import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatEventLog } from '@pnu-blace/db';
import { CalendarService } from '../../stats/calendar.service';
import { SeatSnapshot, SeatChangeEvent } from '@pnu-blace/types';

@Injectable()
export class SeatChangeDetectorService {
  private readonly logger = new Logger(SeatChangeDetectorService.name);
  private previousSnapshots = new Map<string, SeatSnapshot[]>();

  constructor(
    @InjectRepository(SeatEventLog)
    private seatEventLogRepository: Repository<SeatEventLog>,
    private calendarService: CalendarService,
  ) {}

  /**
   * 좌석 상태 변화 감지 및 이벤트 생성
   */
  async detectChanges(
    roomNo: string,
    currentSnapshot: SeatSnapshot[],
  ): Promise<SeatChangeEvent[]> {
    const roomKey = `room_${roomNo}`;
    const previousSnapshot = this.previousSnapshots.get(roomKey);

    if (!previousSnapshot) {
      // 첫 번째 스캔이므로 변화 없음
      this.previousSnapshots.set(roomKey, currentSnapshot);
      return [];
    }

    const changes = this.compareSnapshots(
      previousSnapshot,
      currentSnapshot,
      roomNo,
    );

    // 현재 스냅샷을 이전 스냅샷으로 저장
    this.previousSnapshots.set(roomKey, currentSnapshot);

    // 감지된 변화를 로그에 기록
    for (const change of changes) {
      await this.logSeatEvent(change);
    }

    return changes;
  }

  /**
   * 스냅샷 비교하여 변화 감지
   */
  private compareSnapshots(
    previousSnapshot: SeatSnapshot[],
    currentSnapshot: SeatSnapshot[],
    roomNo: string,
  ): SeatChangeEvent[] {
    const changes: SeatChangeEvent[] = [];

    // 좌석별로 상태 변화 확인
    const previousMap = new Map(
      previousSnapshot.map((seat) => [seat.setNo, seat.status]),
    );

    for (const currentSeat of currentSnapshot) {
      const previousStatus = previousMap.get(currentSeat.setNo);

      if (previousStatus && previousStatus !== currentSeat.status) {
        // 상태 변화 감지
        const event = this.determineEvent(previousStatus, currentSeat.status);

        if (event) {
          changes.push({
            roomNo,
            setNo: currentSeat.setNo,
            previousStatus,
            currentStatus: currentSeat.status,
            event,
            timestamp: currentSeat.timestamp,
          });
        }
      }
    }

    return changes;
  }

  /**
   * 상태 변화에 따른 이벤트 종류 결정
   */
  private determineEvent(
    previousStatus: string,
    currentStatus: string,
  ): 'OCCUPIED' | 'VACATED' | null {
    if (previousStatus === 'AVAILABLE' && currentStatus === 'OCCUPIED') {
      return 'OCCUPIED';
    } else if (previousStatus === 'OCCUPIED' && currentStatus === 'AVAILABLE') {
      return 'VACATED';
    }
    return null;
  }

  /**
   * 좌석 이벤트 로그 기록
   */
  private async logSeatEvent(change: SeatChangeEvent): Promise<void> {
    try {
      // 현재 학사일정 기간 조회
      const periodType = await this.calendarService.getCurrentPeriodType(
        change.timestamp,
      );

      const eventLog = this.seatEventLogRepository.create({
        roomNo: change.roomNo,
        setNo: change.setNo,
        event: change.event,
        timestamp: change.timestamp,
        libraryName: this.getRoomName(change.roomNo),
        periodType,
      });

      await this.seatEventLogRepository.save(eventLog);
    } catch (error) {
      this.logger.error(
        `Failed to log seat event: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * 열람실 번호로 열람실 이름 조회
   */
  private getRoomName(roomNo: string): string {
    const roomNames: Record<string, string> = {
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

    return roomNames[roomNo] || '부산대학교 중앙도서관';
  }

  /**
   * 특정 열람실의 이전 스냅샷 조회 (테스트용)
   */
  getPreviousSnapshot(roomNo: string): SeatSnapshot[] | undefined {
    return this.previousSnapshots.get(`room_${roomNo}`);
  }

  /**
   * 모든 스냅샷 초기화 (테스트용)
   */
  clearAllSnapshots(): void {
    this.previousSnapshots.clear();
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
