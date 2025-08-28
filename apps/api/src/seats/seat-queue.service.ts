import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { QueueRequest, User } from '@pnu-blace/db';
import { MySeatDto } from '@pnu-blace/types';
import { SeatReservationService } from './seat-reservation.service';
import { SeatAutoExtensionService } from './seat-auto-extension.service';

@Injectable()
export class SeatQueueService {
  private readonly logger = new Logger(SeatQueueService.name);

  constructor(
    @InjectRepository(QueueRequest)
    private queueRequestRepository: Repository<QueueRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private seatReservationService: SeatReservationService,
    private seatAutoExtensionService: SeatAutoExtensionService,
  ) {}

  /**
   * 빈자리 예약 요청을 큐에 추가 (기존 reserveEmptySeat와 통합)
   */
  async addEmptySeaReservationToQueue(
    studentId: string,
    roomNo: string,
    seatNo: string,
    autoReturnCurrent = false,
    scheduledAt?: Date,
  ): Promise<QueueRequest> {
    // 기존 대기 중인 빈자리 예약 요청이 있는지 확인
    const existingRequest = await this.queueRequestRepository.findOne({
      where: {
        studentId,
        requestType: 'EMPTY_SEAT_RESERVATION',
        status: In(['WAITING', 'PROCESSING']),
      },
    });

    if (existingRequest) {
      throw new BadRequestException('이미 대기 중인 빈자리 예약 요청이 있습니다.');
    }

    const queuePosition = await this.getNextQueuePosition('EMPTY_SEAT_RESERVATION');

    const queueRequest = this.queueRequestRepository.create({
      studentId,
      requestType: 'EMPTY_SEAT_RESERVATION',
      roomNo,
      seatNo,
      status: 'WAITING',
      queuePosition,
      priority: 1, // 빈자리 예약은 우선순위 1
      scheduledAt: scheduledAt || new Date(),
      requestData: JSON.stringify({ roomNo, seatNo }),
      autoReturnCurrent,
    });

    const savedRequest = await this.queueRequestRepository.save(queueRequest);
    this.logger.log(`Empty seat reservation request added to queue for ${studentId}, position: ${queuePosition}`);

    return savedRequest;
  }

  /**
   * 좌석 예약 요청을 큐에 추가
   */
  async addSeatReservationToQueue(
    studentId: string,
    roomNo: string,
    seatNo: string,
    scheduledAt?: Date,
  ): Promise<QueueRequest> {
    // 기존 대기 중인 예약 요청이 있는지 확인
    const existingRequest = await this.queueRequestRepository.findOne({
      where: {
        studentId,
        requestType: 'SEAT_RESERVATION',
        status: In(['WAITING', 'PROCESSING']),
      },
    });

    if (existingRequest) {
      throw new BadRequestException('이미 대기 중인 좌석 예약 요청이 있습니다.');
    }

    const queuePosition = await this.getNextQueuePosition('SEAT_RESERVATION');

    const queueRequest = this.queueRequestRepository.create({
      studentId,
      requestType: 'SEAT_RESERVATION',
      roomNo,
      seatNo,
      status: 'WAITING',
      queuePosition,
      priority: 2, // 좌석 예약은 우선순위 2
      scheduledAt: scheduledAt || new Date(),
      requestData: JSON.stringify({ roomNo, seatNo }),
    });

    const savedRequest = await this.queueRequestRepository.save(queueRequest);
    this.logger.log(`Seat reservation request added to queue for ${studentId}, position: ${queuePosition}`);

    return savedRequest;
  }

  /**
   * 사용자의 현재 큐 상태 조회
   */
  async getUserQueueStatus(studentId: string): Promise<{
    emptySeatReservation?: QueueRequest;
    seatReservation?: QueueRequest;
    totalWaiting: number;
  }> {
    const userRequests = await this.queueRequestRepository.find({
      where: {
        studentId,
        status: In(['WAITING', 'PROCESSING']),
      },
      order: { createdAt: 'DESC' },
    });

    const totalWaiting = await this.queueRequestRepository.count({
      where: { status: 'WAITING' },
    });

    return {
      emptySeatReservation: userRequests.find(req => req.requestType === 'EMPTY_SEAT_RESERVATION'),
      seatReservation: userRequests.find(req => req.requestType === 'SEAT_RESERVATION'),
      totalWaiting,
    };
  }

  /**
   * 처리할 큐 요청들 조회 (우선순위 및 생성일시 순)
   */
  async getNextQueueRequests(limit = 10): Promise<QueueRequest[]> {
    const now = new Date();
    
    return this.queueRequestRepository.find({
      where: {
        status: 'WAITING',
        scheduledAt: LessThan(now),
      },
      order: {
        priority: 'ASC',
        scheduledAt: 'ASC',
        createdAt: 'ASC',
      },
      take: limit,
    });
  }

  /**
   * 큐 요청 처리
   */
  async processQueueRequest(queueId: number): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const queueRequest = await this.queueRequestRepository.findOne({
      where: { queueId },
    });

    if (!queueRequest) {
      return {
        success: false,
        message: '큐 요청을 찾을 수 없습니다.',
      };
    }

    // 상태를 PROCESSING으로 변경
    queueRequest.status = 'PROCESSING';
    queueRequest.processedAt = new Date();
    await this.queueRequestRepository.save(queueRequest);

    try {
      let result: { success: boolean; message: string; error?: string };

      if (queueRequest.requestType === 'EMPTY_SEAT_RESERVATION') {
        const requestData = JSON.parse(queueRequest.requestData || '{}');
        result = await this.processEmptySeatReservation(
          queueRequest.studentId,
          requestData.roomNo,
          requestData.seatNo,
          queueRequest,
        );
      } else if (queueRequest.requestType === 'SEAT_RESERVATION') {
        const requestData = JSON.parse(queueRequest.requestData || '{}');
        result = await this.processSeatReservation(
          queueRequest.studentId,
          requestData.roomNo,
          requestData.seatNo,
        );
      } else {
        result = {
          success: false,
          message: '알 수 없는 요청 타입입니다.',
        };
      }

      // 처리 결과에 따라 상태 업데이트
      if (result.success) {
        queueRequest.status = 'COMPLETED';
        await this.reorderQueue(queueRequest.requestType);
      } else {
        // 재시도 로직
        if (queueRequest.retryCount < queueRequest.maxRetries) {
          queueRequest.status = 'WAITING';
          queueRequest.retryCount++;
          queueRequest.scheduledAt = new Date(Date.now() + 60000); // 1분 후 재시도
          queueRequest.errorMessage = result.error || result.message;
        } else {
          queueRequest.status = 'FAILED';
          queueRequest.errorMessage = result.error || result.message;
        }
      }

      await this.queueRequestRepository.save(queueRequest);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      queueRequest.status = 'FAILED';
      queueRequest.errorMessage = errorMessage;
      await this.queueRequestRepository.save(queueRequest);

      this.logger.error(`Queue processing failed for request ${queueId}: ${errorMessage}`);
      
      return {
        success: false,
        message: '큐 처리 중 오류가 발생했습니다.',
        error: errorMessage,
      };
    }
  }

  /**
   * 큐에서 요청 취소
   */
  async cancelQueueRequest(studentId: string, requestType: 'EMPTY_SEAT_RESERVATION' | 'SEAT_RESERVATION'): Promise<boolean> {
    const queueRequest = await this.queueRequestRepository.findOne({
      where: {
        studentId,
        requestType,
        status: In(['WAITING', 'PROCESSING']),
      },
    });

    if (!queueRequest) {
      return false;
    }

    queueRequest.status = 'CANCELED';
    await this.queueRequestRepository.save(queueRequest);

    // 큐 순서 재정렬
    await this.reorderQueue(requestType);

    this.logger.log(`Queue request canceled: ${studentId} - ${requestType}`);
    return true;
  }

  /**
   * 큐 순서 재정렬
   */
  private async reorderQueue(requestType: 'EMPTY_SEAT_RESERVATION' | 'SEAT_RESERVATION'): Promise<void> {
    const waitingRequests = await this.queueRequestRepository.find({
      where: {
        requestType,
        status: 'WAITING',
      },
      order: {
        priority: 'ASC',
        scheduledAt: 'ASC',
        createdAt: 'ASC',
      },
    });

    for (let i = 0; i < waitingRequests.length; i++) {
      waitingRequests[i].queuePosition = i;
    }

    await this.queueRequestRepository.save(waitingRequests);
  }

  /**
   * 다음 큐 위치 계산
   */
  private async getNextQueuePosition(requestType: 'EMPTY_SEAT_RESERVATION' | 'SEAT_RESERVATION'): Promise<number> {
    const maxPosition = await this.queueRequestRepository
      .createQueryBuilder('queue')
      .select('MAX(queue.queuePosition)', 'maxPosition')
      .where('queue.requestType = :requestType', { requestType })
      .andWhere('queue.status = :status', { status: 'WAITING' })
      .getRawOne();

    return (maxPosition?.maxPosition || -1) + 1;
  }

  /**
   * 빈자리 예약 처리 (좌석이 비워졌을 때만 예약)
   */
  private async processEmptySeatReservation(
    studentId: string,
    roomNo: string,
    seatNo: string,
    queueRequest: QueueRequest,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // 현재 좌석이 있는지 확인
      let currentSeat: MySeatDto | null = null;
      try {
        currentSeat = await this.seatReservationService.getMySeat(studentId);
      } catch (error) {
        // 좌석이 없으면 정상 (NotFoundException)
      }

      // 현재 좌석이 있고 자동 반납 옵션이 활성화된 경우
      if (currentSeat && queueRequest.autoReturnCurrent) {
        this.logger.log(`Auto returning current seat for ${studentId} before empty reservation`);
        
        const returnResult = await this.seatReservationService.returnSeat(studentId);
        if (!returnResult.success) {
          return {
            success: false,
            message: '현재 좌석 반납에 실패해서 빈자리 예약을 할 수 없습니다.',
            error: returnResult.message,
          };
        }
      }

      // 빈자리 예약 시도
      const result = await this.seatReservationService.reserveEmptySeat(studentId, {
        roomNo,
        seatNo,
      });

      if (result.success && currentSeat && queueRequest.autoReturnCurrent) {
        return {
          success: true,
          message: `기존 좌석(${currentSeat.roomName} ${currentSeat.seatDisplayName})을 반납하고 새로운 좌석으로 예약이 완료되었습니다.`,
        };
      }

      return {
        success: result.success,
        message: result.message || '빈자리 예약이 완료되었습니다.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '빈자리 예약에 실패했습니다.';
      
      return {
        success: false,
        message: '빈자리 예약에 실패했습니다.',
        error: errorMessage,
      };
    }
  }

  /**
   * 일반 좌석 예약 처리
   */
  private async processSeatReservation(
    studentId: string,
    roomNo: string,
    seatNo: string,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const result = await this.seatReservationService.reserveSeat(studentId, {
        roomNo,
        seatNo,
      });

      return {
        success: result.success,
        message: result.message || '좌석 예약이 완료되었습니다.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '좌석 예약에 실패했습니다.';
      
      return {
        success: false,
        message: '좌석 예약에 실패했습니다.',
        error: errorMessage,
      };
    }
  }

  /**
   * 큐 통계 조회
   */
  async getQueueStats(): Promise<{
    totalWaiting: number;
    totalProcessing: number;
    autoExtensionWaiting: number;
    seatReservationWaiting: number;
    avgProcessingTime: number;
  }> {
    const [totalWaiting, totalProcessing, emptySeatWaiting, seatReservationWaiting] = await Promise.all([
      this.queueRequestRepository.count({ where: { status: 'WAITING' } }),
      this.queueRequestRepository.count({ where: { status: 'PROCESSING' } }),
      this.queueRequestRepository.count({ 
        where: { status: 'WAITING', requestType: 'EMPTY_SEAT_RESERVATION' } 
      }),
      this.queueRequestRepository.count({ 
        where: { status: 'WAITING', requestType: 'SEAT_RESERVATION' } 
      }),
    ]);

    // 평균 처리 시간 계산 (최근 100개 완료된 요청 기준)
    const recentCompletedRequests = await this.queueRequestRepository.find({
      where: { status: 'COMPLETED' },
      order: { updatedAt: 'DESC' },
      take: 100,
    });

    let avgProcessingTime = 0;
    if (recentCompletedRequests.length > 0) {
      const totalProcessingTime = recentCompletedRequests.reduce((sum, req) => {
        if (req.processedAt && req.createdAt) {
          return sum + (req.processedAt.getTime() - req.createdAt.getTime());
        }
        return sum;
      }, 0);
      avgProcessingTime = Math.round(totalProcessingTime / recentCompletedRequests.length / 1000); // 초 단위
    }

    return {
      totalWaiting,
      totalProcessing,
      autoExtensionWaiting: emptySeatWaiting, // 호환성을 위해 필드명 유지
      seatReservationWaiting,
      avgProcessingTime,
    };
  }

  /**
   * 오래된 완료/실패된 큐 요청 정리 (1주일 이상)
   */
  async cleanupOldQueueRequests(): Promise<number> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await this.queueRequestRepository.delete({
      status: In(['COMPLETED', 'FAILED', 'CANCELED']),
      updatedAt: LessThan(oneWeekAgo),
    });

    this.logger.log(`Cleaned up ${result.affected || 0} old queue requests`);
    return result.affected || 0;
  }
}