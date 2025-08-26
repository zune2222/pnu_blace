import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRequest } from '@pnu-blace/db';
import { SeatScannerService } from './scanner';
import { SeatChangeDetectorService } from './detector';
import { SeatNotificationProcessorService } from './processor';
import { SeatAutoReservorService } from './reservor';
import { ReservationRequest } from '@pnu-blace/types';

@Injectable()
export class SeatMonitorService {
  private readonly logger = new Logger(SeatMonitorService.name);

  constructor(
    @InjectRepository(NotificationRequest)
    private notificationRepository: Repository<NotificationRequest>,
    private seatScannerService: SeatScannerService,
    private seatChangeDetectorService: SeatChangeDetectorService,
    private seatNotificationProcessorService: SeatNotificationProcessorService,
    private seatAutoReservorService: SeatAutoReservorService,
  ) {}

  /**
   * 매 1분마다 실행되는 좌석 상태 수집 및 알림 처리
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async collectSeatData() {
    try {
      // 모든 열람실 스캔
      const roomSnapshots = await this.seatScannerService.scanAllRooms();

      const autoReservationRequests: ReservationRequest[] = [];

      // 각 열람실별로 변화 감지 및 알림 처리
      for (const [roomNo, snapshot] of roomSnapshots) {
        if (snapshot.length === 0) {
          continue;
        }

        // 좌석 상태 변화 감지
        const changes = await this.seatChangeDetectorService.detectChanges(
          roomNo,
          snapshot,
        );

        if (changes.length > 0) {
          // 알림 처리
          await this.seatNotificationProcessorService.processChangeEvents(
            changes,
          );

          // 자동 예약 요청 수집 (실제 구현에서는 알림 처리 결과에서 추출)
          // TODO: 실제 자동 예약 요청 로직 구현
        }
      }

      // 자동 예약 처리
      if (autoReservationRequests.length > 0) {
        await this.seatAutoReservorService.reserveSeats(
          autoReservationRequests,
        );
      }
    } catch (error) {
      this.logger.error(
        `Seat data collection failed: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * 수동으로 특정 열람실 스캔 (테스트용)
   */
  async scanRoom(roomNo: string): Promise<void> {
    try {
      const snapshot = await this.seatScannerService.scanRoom(roomNo);
      const changes = await this.seatChangeDetectorService.detectChanges(
        roomNo,
        snapshot,
      );

      if (changes.length > 0) {
        await this.seatNotificationProcessorService.processChangeEvents(
          changes,
        );
      }
    } catch (error) {
      this.logger.error(`Manual scan failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 모든 알림 상태 확인 (헬스체크용)
   */
  async getNotificationStats(): Promise<{
    pendingNotifications: number;
    completedToday: number;
    monitoredRooms: number;
    roomList: Record<string, string>;
    lastScanTime: Date;
  }> {
    try {
      const pendingCount = await this.notificationRepository.count({
        where: { status: 'PENDING' },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedToday = await this.notificationRepository.count({
        where: {
          status: 'COMPLETED',
          createdAt: today,
        },
      });

      const monitoredRooms = this.seatScannerService.getMonitoredRooms();

      return {
        pendingNotifications: pendingCount,
        completedToday,
        monitoredRooms: Object.keys(monitoredRooms).length,
        roomList: monitoredRooms,
        lastScanTime: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get notification stats: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 에러 메시지 안전하게 추출
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
