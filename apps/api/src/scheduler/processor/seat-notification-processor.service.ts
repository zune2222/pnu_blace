import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';
import { SeatChangeEvent } from '@pnu-blace/types';

@Injectable()
export class SeatNotificationProcessorService {
  private readonly logger = new Logger(SeatNotificationProcessorService.name);

  constructor(private notificationsService: NotificationsService) {}

  /**
   * 좌석 변화 이벤트에 따른 알림 처리
   */
  async processChangeEvents(changes: SeatChangeEvent[]): Promise<void> {
    for (const change of changes) {
      if (change.event === 'VACATED') {
        await this.processVacantSeatNotifications(change.roomNo, change.setNo);
      }
    }
  }

  /**
   * 빈자리 알림 처리
   */
  async processVacantSeatNotifications(
    roomNo: string,
    setNo: string,
  ): Promise<{
    notificationsSent: number;
    autoReservationsRequested: number;
    errors: string[];
  }> {
    const result = {
      notificationsSent: 0,
      autoReservationsRequested: 0,
      errors: [] as string[],
    };

    try {
      // 해당 좌석에 대한 대기중인 알림들 조회
      const pendingNotifications =
        await this.notificationsService.getActiveNotificationsForSeat(
          roomNo,
          setNo,
        );

      if (pendingNotifications.length === 0) {
        return result;
      }

      // 첫 번째 알림만 처리 (FIFO)
      const firstNotification = pendingNotifications[0];

      try {
        // 자동 예약이 설정된 경우 플래그 설정
        if (firstNotification.autoReserve) {
          result.autoReservationsRequested = 1;
        }

        // 알림 발송 처리
        await this.sendNotification(firstNotification, roomNo, setNo);
        result.notificationsSent = 1;

        // 알림 상태를 완료로 변경
        await this.notificationsService.markNotificationAsProcessed(
          firstNotification.requestId,
        );
      } catch (error) {
        const errorMessage = this.getErrorMessage(error);
        result.errors.push(
          `Failed to process notification for ${firstNotification.user.studentId}: ${errorMessage}`,
        );
        this.logger.error(result.errors[result.errors.length - 1]);
      }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      result.errors.push(
        `Failed to process vacant seat notifications: ${errorMessage}`,
      );
      this.logger.error(result.errors[result.errors.length - 1]);
    }

    return result;
  }

  /**
   * 실제 알림 발송 처리
   */
  private async sendNotification(
    notification: { user: { studentId: string } },
    roomNo: string,
    setNo: string,
  ): Promise<void> {
    // TODO: 실제 알림 발송 구현 (푸시 알림, 이메일 등)
    // 현재는 로그만 기록
    await new Promise<void>((resolve) => setTimeout(resolve, 10)); // 비동기 작업 시뮬레이션

    // 여기에 실제 알림 발송 로직 구현
    // 예: FCM 푸시 알림, 이메일 발송, SMS 등
  }

  /**
   * 특정 사용자의 모든 알림 취소
   */
  cancelUserNotifications(studentId: string): Promise<number> {
    try {
      // TODO: NotificationsService에 해당 메서드 구현 필요
      return Promise.resolve(0);
    } catch (error) {
      this.logger.error(
        `Failed to cancel notifications for user ${studentId}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 특정 좌석의 모든 알림 취소
   */
  cancelSeatNotifications(roomNo: string, setNo: string): Promise<number> {
    try {
      // TODO: NotificationsService에 해당 메서드 구현 필요
      return Promise.resolve(0);
    } catch (error) {
      this.logger.error(
        `Failed to cancel notifications for seat ${roomNo}/${setNo}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 만료된 알림들 정리
   */
  cleanupExpiredNotifications(): Promise<number> {
    try {
      // TODO: NotificationsService에 해당 메서드 구현 필요
      return Promise.resolve(0);
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired notifications: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 알림 통계 조회
   */
  getNotificationStats(): Promise<{
    pending: number;
    completed: number;
    cancelled: number;
    expired: number;
  }> {
    try {
      // TODO: NotificationsService에 해당 메서드 구현 필요
      return Promise.resolve({
        pending: 0,
        completed: 0,
        cancelled: 0,
        expired: 0,
      });
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
