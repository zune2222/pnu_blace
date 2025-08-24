import { Injectable, Logger } from '@nestjs/common';
import { SchoolApiService } from '../../school-api/school-api.service';
import { SeatSnapshot } from '@pnu-blace/types';

@Injectable()
export class SeatScannerService {
  private readonly logger = new Logger(SeatScannerService.name);

  // 모니터링할 열람실 목록 및 정보
  private readonly MONITORED_ROOMS = {
    '2': '1미디어존',
    '1': '1f열람zone',
    '5': '2f 1노트북열람실',
    '3': '2f 1열람실-A',
    '4': '2f 1열람실-B',
    '29': '새벽별당-A',
    '30': '새벽별당-B',
    '8': '3f열람실a',
    '9': '3f열람실b',
    '10': '3f열람실c',
    '11': '3f열람실d',
    '15': '4f 2노트북a',
    '16': '4f 2노트북b',
    '12': '4f 3열람실-A',
    '13': '4f 3열람실-B',
    '14': '4f 3열람실-C',
    '17': '4f 3열람실-D (대학원생)',
  };

  constructor(private schoolApiService: SchoolApiService) {}

  /**
   * 모든 모니터링 대상 열람실의 좌석 상태를 수집
   */
  async scanAllRooms(): Promise<Map<string, SeatSnapshot[]>> {
    this.logger.debug('Starting seat data collection for all rooms...');

    try {
      // 시스템 계정으로 로그인
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        this.logger.error('Failed to login as system account');
        throw new Error('System login failed');
      }

      const results = new Map<string, SeatSnapshot[]>();

      // 각 열람실별로 좌석 상태 수집
      for (const roomNo of Object.keys(this.MONITORED_ROOMS)) {
        try {
          const snapshot = await this.scanRoom(roomNo, loginResult.sessionID);
          results.set(roomNo, snapshot);
          this.logger.debug(
            `Scanned room ${roomNo} (${this.MONITORED_ROOMS[roomNo]}): ${snapshot.length} seats`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to scan room ${roomNo}: ${this.getErrorMessage(error)}`,
          );
          // 개별 열람실 실패 시에도 다른 열람실은 계속 처리
          results.set(roomNo, []);
        }
      }

      this.logger.debug(`Completed scanning ${results.size} rooms`);
      return results;
    } catch (error) {
      this.logger.error(
        `Failed to scan all rooms: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 특정 열람실의 좌석 상태 수집
   */
  async scanRoom(roomNo: string, sessionID?: string): Promise<SeatSnapshot[]> {
    let shouldLogout = false;
    let currentSessionID = sessionID;

    try {
      // 세션이 없으면 로그인
      if (!currentSessionID) {
        const loginResult = await this.schoolApiService.loginAsSystem();
        if (!loginResult.success) {
          throw new Error('System login failed');
        }
        currentSessionID = loginResult.sessionID!;
        shouldLogout = true;
      }

      // 현재 좌석 상태 조회
      const currentSeats = await this.schoolApiService.getSeatMap(
        roomNo,
        currentSessionID,
      );

      if (currentSeats.length === 0) {
        this.logger.warn(`No seat data found for room ${roomNo}`);
        return [];
      }

      const currentTimestamp = new Date();
      const snapshot: SeatSnapshot[] = currentSeats.map((seat) => ({
        roomNo,
        setNo: seat.setNo,
        status: seat.status,
        timestamp: currentTimestamp,
      }));

      return snapshot;
    } catch (error) {
      this.logger.error(
        `Failed to scan room ${roomNo}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    } finally {
      // 세션을 새로 만든 경우 정리 작업
      if (shouldLogout && currentSessionID) {
        // TODO: 필요시 세션 정리 로직 구현
        // 현재는 학교 API에 logout 메서드가 없으므로 별도 처리 없음
        this.logger.debug(`Session cleanup for: ${currentSessionID}`);
      }
    }
  }

  /**
   * 모니터링 대상 열람실 목록 조회
   */
  getMonitoredRooms(): Record<string, string> {
    return { ...this.MONITORED_ROOMS };
  }

  /**
   * 특정 열람실 정보 조회
   */
  getRoomInfo(roomNo: string): string | undefined {
    return this.MONITORED_ROOMS[roomNo];
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
