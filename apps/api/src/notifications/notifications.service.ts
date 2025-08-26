import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, NotificationRequest } from '@pnu-blace/db';
import {
  CreateNotificationRequestDto,
  NotificationRequestDto,
  NotificationActionResponseDto,
} from '@pnu-blace/types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(NotificationRequest)
    private notificationRepository: Repository<NotificationRequest>,
  ) {}

  /**
   * 빈자리 알림 신청
   */
  async createNotification(
    studentId: string,
    createDto: CreateNotificationRequestDto,
  ): Promise<NotificationActionResponseDto> {
    try {
      const { roomNo, seatNo, autoReserve } = createDto;

      // 사용자 존재 확인
      const user = await this.userRepository.findOne({
        where: { studentId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 이미 같은 좌석에 대한 알림이 있는지 확인
      const existingNotification = await this.notificationRepository.findOne({
        where: {
          user: { studentId },
          roomNo,
          seatNo,
          status: 'PENDING',
        },
      });

      if (existingNotification) {
        throw new ConflictException(
          '이미 해당 좌석에 대한 알림이 등록되어 있습니다.',
        );
      }

      // 새 알림 생성
      const notification = this.notificationRepository.create({
        user,
        roomNo,
        seatNo,
        autoReserve,
        status: 'PENDING',
      });

      await this.notificationRepository.save(notification);

      this.logger.debug(
        `Notification created: ${studentId} - ${roomNo}/${seatNo}`,
      );

      return {
        success: true,
        message: '빈자리 알림이 성공적으로 등록되었습니다.',
      };
    } catch (error: any) {
      this.logger.error(`Create notification error: ${error.message}`);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException('알림 등록 중 오류가 발생했습니다.');
    }
  }

  /**
   * 내가 신청한 알림 목록 조회
   */
  async getMyNotifications(
    studentId: string,
  ): Promise<NotificationRequestDto[]> {
    try {
      const notifications = await this.notificationRepository.find({
        where: {
          user: { studentId },
          status: 'PENDING',
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return notifications.map((notification) => ({
        id: notification.requestId,
        roomNo: notification.roomNo,
        seatNo: notification.seatNo,
        autoReserve: notification.autoReserve,
        createdAt: notification.createdAt,
        isActive: notification.status === 'PENDING',
      }));
    } catch (error: any) {
      this.logger.error(`Get notifications error: ${error.message}`);
      throw new BadRequestException('알림 목록 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 알림 신청 취소
   */
  async cancelNotification(
    studentId: string,
    requestId: number,
  ): Promise<NotificationActionResponseDto> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: {
          requestId: requestId,
          user: { studentId },
          status: 'PENDING',
        },
      });

      if (!notification) {
        throw new NotFoundException('알림을 찾을 수 없습니다.');
      }

      // 알림 상태를 취소로 변경
      notification.status = 'CANCELED';
      await this.notificationRepository.save(notification);

      this.logger.debug(
        `Notification cancelled: ${studentId} - ${notification.roomNo}/${notification.seatNo}`,
      );

      return {
        success: true,
        message: '알림이 성공적으로 취소되었습니다.',
      };
    } catch (error: any) {
      this.logger.error(`Cancel notification error: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('알림 취소 중 오류가 발생했습니다.');
    }
  }

  /**
   * 특정 좌석에 대한 활성 알림 목록 조회 (백그라운드 작업용)
   */
  async getActiveNotificationsForSeat(
    roomNo: string,
    seatNo: string,
  ): Promise<NotificationRequest[]> {
    return this.notificationRepository.find({
      where: {
        roomNo,
        seatNo,
        status: 'PENDING',
      },
      relations: ['user'],
      order: {
        createdAt: 'ASC', // 먼저 신청한 순서대로
      },
    });
  }

  /**
   * 알림 처리 완료 (백그라운드 작업용)
   */
  async markNotificationAsProcessed(notificationId: number): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      status: 'COMPLETED',
    });
  }

  /**
   * 활성 알림 개수 조회 (사용자별)
   */
  async getActiveNotificationCount(studentId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        user: { studentId },
        status: 'PENDING',
      },
    });
  }
}
