import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { MyUsageLog, SeatEventLog, User } from '@pnu-blace/db';
import { CalendarService, PeriodType } from './calendar.service';
import {
  MyUsageStatsDto,
  SeatPredictionDto,
  UsagePattern,
} from '@pnu-blace/types';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(MyUsageLog)
    private myUsageLogRepository: Repository<MyUsageLog>,
    @InjectRepository(SeatEventLog)
    private seatEventLogRepository: Repository<SeatEventLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private calendarService: CalendarService,
  ) {}

  /**
   * 사용자의 개인 이용 통계 조회
   */
  async getMyUsageStats(studentId: string): Promise<MyUsageStatsDto> {
    try {
      // 사용자 존재 확인
      const user = await this.userRepository.findOne({
        where: { studentId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 완료된 이용 기록만 조회 (endTime이 있는 것)
      const usageLogs = await this.myUsageLogRepository.find({
        where: {
          studentId,
        },
      });

      // endTime이 null이 아닌 것만 필터링
      const completedLogs = usageLogs.filter((log) => log.endTime !== null);

      if (completedLogs.length === 0) {
        return this.getEmptyStats();
      }

      // 총 이용 시간 계산
      let totalUsageHours = 0;
      const roomUsage = new Map<string, number>();
      const timeSlotUsage = new Map<number, number>();

      for (const log of completedLogs) {
        if (log.endTime && log.startTime) {
          const duration =
            (log.endTime.getTime() - log.startTime.getTime()) /
            (1000 * 60 * 60);
          totalUsageHours += duration;

          // 열람실별 이용 시간
          const currentRoomHours = roomUsage.get(log.roomNo) || 0;
          roomUsage.set(log.roomNo, currentRoomHours + duration);

          // 시간대별 이용 패턴 (시작 시간 기준)
          const startHour = log.startTime.getHours();
          const currentSlotCount = timeSlotUsage.get(startHour) || 0;
          timeSlotUsage.set(startHour, currentSlotCount + 1);
        }
      }

      // 가장 많이 사용한 열람실
      let mostUsedRoom = '';
      let maxUsage = 0;
      for (const [roomNo, usage] of roomUsage.entries()) {
        if (usage > maxUsage) {
          maxUsage = usage;
          mostUsedRoom = roomNo;
        }
      }

      // 이번 주 이용 시간
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const thisWeekLogs = completedLogs.filter(
        (log) => log.startTime && log.startTime >= oneWeekAgo,
      );

      const thisWeekHours = thisWeekLogs.reduce((total, log) => {
        if (log.endTime && log.startTime) {
          return (
            total +
            (log.endTime.getTime() - log.startTime.getTime()) / (1000 * 60 * 60)
          );
        }
        return total;
      }, 0);

      // 이번 달 이용 시간
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const thisMonthLogs = completedLogs.filter(
        (log) => log.startTime && log.startTime >= oneMonthAgo,
      );

      const thisMonthHours = thisMonthLogs.reduce((total, log) => {
        if (log.endTime && log.startTime) {
          return (
            total +
            (log.endTime.getTime() - log.startTime.getTime()) / (1000 * 60 * 60)
          );
        }
        return total;
      }, 0);

      // 선호 시간대 (상위 5개)
      const favoriteTimeSlots = Array.from(timeSlotUsage.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 열람실 이름 매핑 (SeatMonitorService에서 가져오거나 별도 설정)
      const roomNames: { [key: string]: string } = {
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

      return {
        totalUsageHours: Math.round(totalUsageHours * 100) / 100,
        totalSessions: completedLogs.length,
        averageSessionHours:
          Math.round((totalUsageHours / completedLogs.length) * 100) / 100,
        mostUsedRoom,
        mostUsedRoomName: roomNames[mostUsedRoom] || '알 수 없음',
        thisWeekHours: Math.round(thisWeekHours * 100) / 100,
        thisMonthHours: Math.round(thisMonthHours * 100) / 100,
        favoriteTimeSlots,
      };
    } catch (error: any) {
      this.logger.error(`Get usage stats error: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('통계 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 특정 좌석의 이용 패턴 예측
   */
  async getSeatPrediction(
    roomNo: string,
    seatNo: string,
  ): Promise<SeatPredictionDto> {
    try {
      // 현재 기간 타입 조회
      const currentPeriod = await this.calendarService.getCurrentPeriodType();

      // 최근 90일간의 해당 좌석 이벤트 로그 조회
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const eventLogs = await this.seatEventLogRepository.find({
        where: {
          roomNo,
          seatNo,
          timestamp: MoreThan(ninetyDaysAgo),
          event: 'OCCUPIED', // 점유 이벤트만
        },
        order: {
          timestamp: 'ASC',
        },
      });

      if (eventLogs.length === 0) {
        return this.getEmptyPrediction(roomNo, seatNo, currentPeriod);
      }

      // 현재 기간과 같은 타입의 이벤트들만 필터링
      const currentPeriodEvents = eventLogs.filter(
        (log) => log.periodType === currentPeriod,
      );

      // 이용 패턴 분석
      const usagePatterns = this.analyzeUsagePatterns(currentPeriodEvents);
      const usageProfile = this.generateUsageProfile(usagePatterns);
      const summaryMessage = this.generateSummaryMessage(
        currentPeriod,
        usageProfile,
      );

      return {
        roomNo,
        seatNo,
        analysis: {
          currentPeriod,
          totalEvents: eventLogs.length,
          averageUtilization: eventLogs.length > 0 ? 75.5 : 0, // 예시 값
          peakHours: ['09:00', '14:00', '19:00'], // 예시 값
          recommendedTimes: ['08:00', '13:00', '18:00'], // 예시 값
        },
      };
    } catch (error: any) {
      this.logger.error(`Get seat prediction error: ${error.message}`);
      throw new Error('좌석 예측 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 빈 통계 객체 반환
   */
  private getEmptyStats(): MyUsageStatsDto {
    return {
      totalUsageHours: 0,
      totalSessions: 0,
      averageSessionHours: 0,
      mostUsedRoom: '',
      mostUsedRoomName: '이용 기록 없음',
      thisWeekHours: 0,
      thisMonthHours: 0,
      favoriteTimeSlots: [],
    };
  }

  /**
   * 빈 예측 객체 반환
   */
  private getEmptyPrediction(
    roomNo: string,
    seatNo: string,
    currentPeriod: PeriodType,
  ): SeatPredictionDto {
    return {
      roomNo,
      seatNo,
      analysis: {
        currentPeriod,
        totalEvents: 0,
        averageUtilization: 0,
        peakHours: [],
        recommendedTimes: [],
      },
    };
  }

  /**
   * 이용 패턴 분석 (간단한 버전)
   */
  private analyzeUsagePatterns(eventLogs: SeatEventLog[]): UsagePattern[] {
    // 실제로는 더 복잡한 분석이 필요하지만,
    // 여기서는 간단히 이용 시간대별 빈도만 분석
    const patterns: { [duration: number]: number } = {};

    // 가상의 이용 시간 생성 (실제로는 VACATED 이벤트와 매칭 필요)
    for (let i = 0; i < eventLogs.length; i++) {
      // 임시로 랜덤한 이용 시간 생성 (1-12시간)
      const duration = Math.floor(Math.random() * 12) + 1;
      patterns[duration] = (patterns[duration] || 0) + 1;
    }

    return Object.entries(patterns).map(([duration, count]) => ({
      durationHours: parseInt(duration),
      count,
    }));
  }

  /**
   * 이용 프로파일 생성
   */
  private generateUsageProfile(
    patterns: UsagePattern[],
  ): { durationHours: number; percentage: number }[] {
    const totalCount = patterns.reduce(
      (sum, pattern) => sum + pattern.count,
      0,
    );

    if (totalCount === 0) {
      return [];
    }

    return patterns
      .map((pattern) => ({
        durationHours: pattern.durationHours,
        percentage: Math.round((pattern.count / totalCount) * 100) / 100,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // 상위 5개만
  }

  /**
   * 요약 메시지 생성
   */
  private generateSummaryMessage(
    currentPeriod: PeriodType,
    usageProfile: { durationHours: number; percentage: number }[],
  ): string {
    if (usageProfile.length === 0) {
      return '충분한 데이터가 없어 예측할 수 없습니다.';
    }

    const topPattern = usageProfile[0];
    const periodName = this.getPeriodName(currentPeriod);

    return `${periodName}에는 ${Math.round(topPattern.percentage * 100)}%의 확률로 ${topPattern.durationHours}시간 이용하는 패턴을 보여요.`;
  }

  /**
   * 기간 타입을 한국어 이름으로 변환
   */
  private getPeriodName(periodType: PeriodType): string {
    const names = {
      NORMAL: '평상시',
      EXAM: '시험 기간',
      VACATION: '방학 기간',
      FINALS: '기말고사 기간',
    };
    return names[periodType] || '평상시';
  }
}
