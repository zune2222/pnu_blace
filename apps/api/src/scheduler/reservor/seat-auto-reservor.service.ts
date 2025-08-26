import { Injectable, Logger } from '@nestjs/common';
import { SchoolApiService } from '../../school-api/school-api.service';
import { ReservationRequest, ReservationResult } from '@pnu-blace/types';

@Injectable()
export class SeatAutoReservorService {
  private readonly logger = new Logger(SeatAutoReservorService.name);

  constructor(private schoolApiService: SchoolApiService) {}

  /**
   * 자동 좌석 예약 시도
   */
  async reserveSeat(request: ReservationRequest): Promise<ReservationResult> {
    const { studentId, roomNo, seatNo } = request;

    try {
      // 시스템 계정으로 예약 시도 (실제로는 해당 사용자의 세션 필요)
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new Error('System login failed');
      }

      const success = await this.schoolApiService.reserveSeat(
        studentId,
        loginResult.sessionID!,
        roomNo,
        seatNo,
      );

      if (success) {
        return {
          success: true,
          studentId,
          roomNo,
          seatNo,
          message: 'Seat reserved successfully',
          timestamp: new Date(),
          reservedAt: new Date(),
        };
      } else {
        return {
          success: false,
          studentId,
          roomNo,
          seatNo,
          message: 'Reservation failed',
          timestamp: new Date(),
          error: 'Reservation failed - seat may no longer be available',
        };
      }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(`Auto reserve failed: ${errorMessage}`);

      return {
        success: false,
        studentId,
        roomNo,
        seatNo,
        message: 'Auto reservation failed',
        timestamp: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * 여러 좌석 예약 시도 (배치 처리)
   */
  async reserveSeats(
    requests: ReservationRequest[],
  ): Promise<ReservationResult[]> {
    const results: ReservationResult[] = [];

    // 순차적으로 처리 (동시 예약 시 충돌 방지)
    for (const request of requests) {
      const result = await this.reserveSeat(request);
      results.push(result);

      // 실패한 경우 잠시 대기
      if (!result.success) {
        await this.sleep(1000); // 1초 대기
      }
    }

    return results;
  }

  /**
   * 사용자의 현재 예약 상태 확인
   */
  async checkUserReservation(studentId: string): Promise<{
    hasReservation: boolean;
    reservationInfo?: {
      roomNo: string;
      seatNo: string;
      roomName: string;
    };
    error?: string;
  }> {
    try {
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new Error('System login failed');
      }

      // TODO: 실제 사용자 예약 상태 조회 API 호출
      // 현재는 더미 구현

      return {
        hasReservation: false,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `Failed to check reservation for ${studentId}: ${errorMessage}`,
      );

      return {
        hasReservation: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 예약 취소
   */
  async cancelReservation(studentId: string): Promise<{
    success: boolean;
    cancelledAt?: Date;
    error?: string;
  }> {
    try {
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new Error('System login failed');
      }

      // TODO: 실제 예약 취소 API 호출
      // 현재는 더미 구현

      return {
        success: true,
        cancelledAt: new Date(),
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `Failed to cancel reservation for ${studentId}: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 좌석 예약 가능 여부 확인
   */
  async checkSeatAvailability(
    roomNo: string,
    seatNo: string,
  ): Promise<{
    available: boolean;
    status: 'AVAILABLE' | 'OCCUPIED' | 'UNAVAILABLE';
    error?: string;
  }> {
    try {
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new Error('System login failed');
      }

      const seatMap = await this.schoolApiService.getSeatMap(
        roomNo,
        loginResult.sessionID,
      );

      const targetSeat = seatMap.find((seat) => seat.seatNo === seatNo);

      if (!targetSeat) {
        return {
          available: false,
          status: 'UNAVAILABLE',
          error: 'Seat not found',
        };
      }

      return {
        available: targetSeat.status === 'AVAILABLE',
        status: targetSeat.status,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `Failed to check seat availability ${roomNo}/${seatNo}: ${errorMessage}`,
      );

      return {
        available: false,
        status: 'UNAVAILABLE',
        error: errorMessage,
      };
    }
  }

  /**
   * 자동 예약 통계 조회
   */
  async getReservationStats(): Promise<{
    totalAttempts: number;
    successfulReservations: number;
    failedReservations: number;
    successRate: number;
  }> {
    // TODO: 실제 통계 데이터 조회 구현
    // 현재는 더미 데이터
    return {
      totalAttempts: 0,
      successfulReservations: 0,
      failedReservations: 0,
      successRate: 0,
    };
  }

  /**
   * 지연 함수
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
