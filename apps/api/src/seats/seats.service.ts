import { Injectable } from '@nestjs/common';
import { SchoolApiService } from '../school-api/school-api.service';
import {
  SeatStatusDto,
  MySeatDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
  ExtendSeatResponseDto,
  SeatDetailDto,
  SeatVacancyPredictionDto,
  AutoExtensionConfigDto,
  UpdateAutoExtensionConfigDto,
  AutoExtensionStatsDto,
  QueueRequestDto,
  QueueStatusDto,
  QueueStatsDto,
} from '@pnu-blace/types';
import { SeatQueryService } from './seat-query.service';
import { SeatReservationService } from './seat-reservation.service';
import { SeatRendererService } from './seat-renderer.service';
import { SeatPredictionService } from './seat-prediction.service';
import { SeatAutoExtensionService } from './seat-auto-extension.service';
import { SeatQueueService } from './seat-queue.service';

@Injectable()
export class SeatsService {
  constructor(
    private schoolApiService: SchoolApiService,
    private seatQueryService: SeatQueryService,
    private seatReservationService: SeatReservationService,
    private seatRendererService: SeatRendererService,
    private seatPredictionService: SeatPredictionService,
    private seatAutoExtensionService: SeatAutoExtensionService,
    private seatQueueService: SeatQueueService,
  ) {}

  /**
   * 특정 열람실의 전체 좌석 상태 조회
   */
  async getSeatStatus(
    roomNo: string,
    studentId: string,
  ): Promise<SeatStatusDto[]> {
    return this.seatQueryService.getSeatStatus(roomNo, studentId);
  }

  /**
   * 특정 열람실의 상세 좌석 정보 조회
   */
  async getSeatDetail(
    roomNo: string,
    studentId: string,
  ): Promise<SeatDetailDto> {
    return this.seatQueryService.getSeatDetail(roomNo, studentId);
  }

  /**
   * 방 번호에 따른 배경 이미지 URL 반환
   */
  getBackgroundImageUrl(roomNo: string): string {
    return this.seatQueryService.getBackgroundImageUrl(roomNo);
  }

  /**
   * 시스템 계정으로 로그인
   */
  async loginAsSystem() {
    return this.schoolApiService.loginAsSystem();
  }

  /**
   * 원본 PNU HTML을 가져와서 좌석 버튼을 교체
   */
  async getSeatMapHtml(roomNo: string, sessionID: string): Promise<string> {
    return this.seatRendererService.getSeatMapHtml(roomNo, sessionID);
  }

  /**
   * 현재 내가 예약한 좌석 정보 조회
   */
  async getMySeat(studentId: string): Promise<MySeatDto> {
    return this.seatReservationService.getMySeat(studentId);
  }

  /**
   * 좌석 예약
   */
  async reserveSeat(
    studentId: string,
    reserveSeatDto: ReserveSeatRequestDto,
  ): Promise<SeatActionResponseDto> {
    return this.seatReservationService.reserveSeat(studentId, reserveSeatDto);
  }

  /**
   * 좌석 반납
   */
  async returnSeat(studentId: string): Promise<SeatActionResponseDto> {
    const result = await this.seatReservationService.returnSeat(studentId);

    // 좌석 반납 시 자동 연장 비활성화
    if (result.success) {
      await this.seatAutoExtensionService.toggleAutoExtension(studentId, false);
    }

    return result;
  }

  /**
   * 좌석 연장
   */
  async extendSeat(studentId: string): Promise<ExtendSeatResponseDto> {
    return this.seatReservationService.extendSeat(studentId);
  }

  /**
   * 좌석 반납 예측 시간 조회
   */
  async getSeatPrediction(
    roomNo: string,
    seatNo: string,
  ): Promise<SeatVacancyPredictionDto> {
    return this.seatPredictionService.getSeatPrediction(roomNo, seatNo);
  }

  /**
   * 자동 연장 설정 조회
   */
  async getAutoExtensionConfig(
    studentId: string,
  ): Promise<AutoExtensionConfigDto | null> {
    const config =
      await this.seatAutoExtensionService.getAutoExtensionConfig(studentId);
    return config as AutoExtensionConfigDto | null;
  }

  /**
   * 자동 연장 설정 업데이트
   */
  async updateAutoExtensionConfig(
    studentId: string,
    configDto: UpdateAutoExtensionConfigDto,
  ): Promise<AutoExtensionConfigDto> {
    const config =
      await this.seatAutoExtensionService.upsertAutoExtensionConfig(
        studentId,
        configDto,
      );
    return config as AutoExtensionConfigDto;
  }

  /**
   * 자동 연장 토글 (활성화/비활성화)
   */
  async toggleAutoExtension(
    studentId: string,
    isEnabled: boolean,
  ): Promise<AutoExtensionConfigDto> {
    const config = await this.seatAutoExtensionService.toggleAutoExtension(
      studentId,
      isEnabled,
    );
    return config as AutoExtensionConfigDto;
  }

  /**
   * 자동 연장 통계 조회
   */
  async getAutoExtensionStats(
    studentId: string,
  ): Promise<AutoExtensionStatsDto> {
    const config =
      await this.seatAutoExtensionService.getAutoExtensionConfig(studentId);
    return {
      isEnabled: config?.isEnabled || false,
      currentExtensionCount: config?.currentExtensionCount || 0,
      maxAutoExtensions: config?.maxAutoExtensions || 0,
      remainingExtensions: Math.max(
        0,
        (config?.maxAutoExtensions || 0) - (config?.currentExtensionCount || 0),
      ),
      lastExtendedAt: config?.lastExtendedAt,
      nextTriggerMinutes: config?.triggerMinutesBefore,
    };
  }

  /**
   * 자동 연장 수동 실행
   */
  async executeAutoExtension(): Promise<ExtendSeatResponseDto> {
    // 자동 연장 배치 처리 실행
    const result = await this.seatAutoExtensionService.processAutoExtensions();
    return {
      success: result.successful > 0,
      message:
        result.successful > 0
          ? '자동 연장이 완료되었습니다.'
          : '자동 연장할 수 없습니다.',
      endTime: new Date().toISOString(), // 임시값
    };
  }

  /**
   * 빈자리 예약 대기열에 추가
   */
  async addSeatReservationToQueue(
    studentId: string,
    roomNo: string,
    seatNo: string,
    scheduledAt?: Date,
  ): Promise<QueueRequestDto> {
    const result = await this.seatQueueService.addEmptySeaReservationToQueue(
      studentId,
      roomNo,
      seatNo,
      false,
      scheduledAt,
    );
    return result as QueueRequestDto;
  }

  /**
   * 사용자 대기열 상태 조회
   */
  async getUserQueueStatus(studentId: string): Promise<QueueStatusDto> {
    const result = await this.seatQueueService.getUserQueueStatus(studentId);
    return result as unknown as QueueStatusDto;
  }

  /**
   * 대기열에서 요청 취소
   */
  async cancelQueueRequest(studentId: string): Promise<boolean> {
    return this.seatQueueService.cancelQueueRequest(
      studentId,
      'EMPTY_SEAT_RESERVATION',
    );
  }

  /**
   * 대기열 통계 조회 (관리자용)
   */
  async getQueueStats(): Promise<QueueStatsDto> {
    const result = await this.seatQueueService.getQueueStats();
    return result as unknown as QueueStatsDto;
  }
}
