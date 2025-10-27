import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, Not, IsNull } from 'typeorm';
import { MyUsageLog, SeatEventLog, User, UserStats } from '@pnu-blace/db';
import { CalendarService, PeriodType } from './calendar.service';
import { SchoolApiService } from '../school-api/school-api.service';
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
    @InjectRepository(UserStats)
    private userStatsRepository: Repository<UserStats>,
    private calendarService: CalendarService,
    private schoolApiService: SchoolApiService,
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

  /**
   * 학교 API에서 자리 이용 내역을 가져와서 통계를 생성합니다
   */
  async getMySeatHistory(userID: string, sessionID: string) {
    try {
      this.logger.debug(`Getting seat history for user: ${userID}`);

      const seatHistory = await this.schoolApiService.getMySeatHistory(
        userID,
        sessionID,
      );

      if (!seatHistory || seatHistory.length === 0) {
        return {
          totalSessions: 0,
          totalUsageHours: 0,
          totalDays: 0,
          averageSessionHours: 0,
          favoriteRoom: null,
          recentActivity: [],
          stats: {
            message: '아직 도서관 이용 기록이 없네요! 첫 방문을 환영합니다 🎉',
            totalTimeMessage: '이용 시간: 0시간',
            visitCountMessage: '방문 횟수: 0회',
            favoriteRoomMessage: '자주 이용하는 방: 없음',
          },
        };
      }

      // 통계 계산
      let totalUsageMinutes = 0;
      const roomUsage = new Map<string, { count: number; hours: number }>();
      const uniqueDates = new Set<string>();

      for (const record of seatHistory) {
        // 날짜 추가 (YYYY.MM.DD 형태)
        uniqueDates.add(record.useDt);

        // 시간 계산 (HH:MM 형태를 분으로 변환)
        const usageMinutes = this.calculateUsageMinutes(
          record.startTm,
          record.endTm,
        );
        totalUsageMinutes += usageMinutes;

        // 방별 통계
        const roomKey = record.roomNm;
        const current = roomUsage.get(roomKey) || { count: 0, hours: 0 };
        roomUsage.set(roomKey, {
          count: current.count + 1,
          hours: current.hours + usageMinutes / 60,
        });
      }

      const totalHours = totalUsageMinutes / 60;
      const totalSessions = seatHistory.length;
      const totalDays = uniqueDates.size;
      const averageSessionHours = totalSessions > 0 ? totalHours / totalSessions : 0;

      // 가장 자주 이용한 방 찾기
      let favoriteRoom: { name: string; count: number; totalHours: number } | null = null;
      let maxCount = 0;
      for (const [roomName, stats] of roomUsage.entries()) {
        if (stats.count > maxCount) {
          maxCount = stats.count;
          favoriteRoom = {
            name: roomName,
            count: stats.count,
            totalHours: Math.round(stats.hours * 10) / 10,
          };
        }
      }

      // 최근 5개 활동
      const recentActivity = seatHistory.slice(0, 5).map((record: any) => ({
        date: record.useDt,
        roomName: record.roomNm,
        seatNo: record.seatNo,
        startTime: record.startTm,
        endTime: record.endTm,
        duration: this.formatDuration(
          this.calculateUsageMinutes(record.startTm, record.endTm),
        ),
      }));

      // 이번주 통계 계산
      const weeklyStats = this.calculateWeeklyStats(seatHistory);

      // 재미있는 메시지 생성
      const stats = this.generateFunMessages(
        totalHours,
        totalSessions,
        totalDays,
        favoriteRoom,
      );

      const result = {
        totalSessions,
        totalUsageHours: Math.round(totalHours * 10) / 10,
        totalDays,
        averageSessionHours: Math.round(averageSessionHours * 10) / 10,
        favoriteRoom,
        recentActivity,
        stats,
        weeklyStats,
      };

      // 통계를 DB에 저장하고 랭킹 업데이트
      await this.saveUserStats(userID, result);

      return result;
    } catch (error: any) {
      this.logger.error(`Get seat history error: ${error.message}`);
      throw new Error('자리 이용 내역 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 시작시간과 종료시간으로 이용시간(분) 계산
   */
  private calculateUsageMinutes(startTm: string, endTm: string): number {
    if (!startTm || !endTm) return 0;

    try {
      const [startHour, startMin] = startTm.split(':').map(Number);
      const [endHour, endMin] = endTm.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;

      // 자정을 넘는 경우 처리
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      return endMinutes - startMinutes;
    } catch (error) {
      this.logger.warn(`Failed to calculate usage time: ${startTm} - ${endTm}`);
      return 0;
    }
  }

  /**
   * 분을 "X시간 Y분" 형태로 포맷
   */
  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}분`;
    } else if (mins === 0) {
      return `${hours}시간`;
    } else {
      return `${hours}시간 ${mins}분`;
    }
  }

  /**
   * 이번주 통계 계산
   */
  private calculateWeeklyStats(seatHistory: any[]) {
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    
    // 이번주 데이터만 필터링
    const thisWeekRecords = seatHistory.filter(record => {
      const recordDate = this.parseDate(record.useDt);
      return recordDate >= weekStart;
    });

    let weeklyUsageMinutes = 0;
    const weeklyUniqueDates = new Set<string>();

    for (const record of thisWeekRecords) {
      // 날짜 추가
      weeklyUniqueDates.add(record.useDt);

      // 시간 계산
      const usageMinutes = this.calculateUsageMinutes(
        record.startTm,
        record.endTm,
      );
      weeklyUsageMinutes += usageMinutes;
    }

    const weeklyHours = weeklyUsageMinutes / 60;
    const weeklySessions = thisWeekRecords.length;
    const weeklyDays = weeklyUniqueDates.size;

    return {
      weeklyUsageHours: Math.round(weeklyHours * 10) / 10,
      weeklySessions,
      weeklyDays,
      weekStartDate: weekStart,
    };
  }

  /**
   * 주의 시작일 계산 (월요일 00:00)
   */
  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  /**
   * YYYY.MM.DD 형태의 날짜 문자열을 Date 객체로 변환
   */
  private parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * 재미있는 통계 메시지 생성
   */
  private generateFunMessages(
    totalHours: number,
    totalSessions: number,
    _totalDays: number,
    favoriteRoom: { name: string; count: number; totalHours: number } | null,
  ) {
    // 기본 메시지들
    let message = '';
    let totalTimeMessage = '';
    let visitCountMessage = '';
    let favoriteRoomMessage = '';

    // 총 이용시간에 따른 메시지
    if (totalHours < 100) {
      message = '도서관 탐험을 시작하셨네요! 📚✨';
      totalTimeMessage = `총 ${Math.round(totalHours * 10) / 10}시간 이용하셨어요`;
    } else if (totalHours < 500) {
      message = '도서관이 조금씩 익숙해지고 있군요! 😊📖';
      totalTimeMessage = `벌써 ${Math.round(totalHours * 10) / 10}시간이나 공부하셨네요!`;
    } else if (totalHours < 1000) {
      message = '와우! 진정한 도서관러네요! 🔥📚';
      totalTimeMessage = `무려 ${Math.round(totalHours * 10) / 10}시간! 대단해요!`;
    } else if (totalHours < 3000) {
      message = '도서관 마스터 등극! 🏆📚';
      totalTimeMessage = `${Math.round(totalHours * 10) / 10}시간... 진짜 대단합니다!`;
    } else if (totalHours < 5000) {
      message = '도서관의 전설이 되셨습니다! 👑📚';
      totalTimeMessage = `${Math.round(totalHours * 10) / 10}시간... 말이 안되는 기록이에요!`;
    } else {
      message = '도서관계의 신화가 되셨습니다! ⚡👑';
      totalTimeMessage = `${Math.round(totalHours * 10) / 10}시간... 이건 정말 전설입니다!`;
    }

    // 방문 횟수 메시지
    if (totalSessions < 5) {
      visitCountMessage = `${totalSessions}번의 소중한 방문 💫`;
    } else if (totalSessions < 20) {
      visitCountMessage = `${totalSessions}번이나 오셨네요! 열심히 하시는군요 👏`;
    } else if (totalSessions < 50) {
      visitCountMessage = `${totalSessions}번... 이제 단골이시네요! 🎯`;
    } else {
      visitCountMessage = `${totalSessions}번... 도서관이 제2의 집이군요! 🏠`;
    }

    // 선호 장소 메시지
    if (favoriteRoom) {
      const { name, count } = favoriteRoom;
      if (count < 3) {
        favoriteRoomMessage = `${name}을 좋아하시는 것 같아요 💝`;
      } else if (count < 10) {
        favoriteRoomMessage = `${name}이 최애 장소네요! (${count}번 방문) ❤️`;
      } else {
        favoriteRoomMessage = `${name}의 터줏대감! (${count}번 방문) 👑`;
      }
    } else {
      favoriteRoomMessage = '아직 단골 장소가 정해지지 않았네요 🤔';
    }

    return {
      message,
      totalTimeMessage,
      visitCountMessage,
      favoriteRoomMessage,
    };
  }

  /**
   * 사용자 통계를 데이터베이스에 저장
   */
  private async saveUserStats(studentId: string, statsData: any) {
    try {
      const tier = this.calculateTier(statsData.totalUsageHours);
      
      const userStats = await this.userStatsRepository.findOne({
        where: { studentId },
      });

      const statsToSave = {
        studentId,
        totalUsageHours: statsData.totalUsageHours,
        totalSessions: statsData.totalSessions,
        totalDays: statsData.totalDays,
        averageSessionHours: statsData.averageSessionHours,
        favoriteRoomName: statsData.favoriteRoom?.name || null,
        favoriteRoomVisits: statsData.favoriteRoom?.count || 0,
        favoriteRoomHours: statsData.favoriteRoom?.totalHours || 0,
        weeklyUsageHours: statsData.weeklyStats.weeklyUsageHours,
        weeklySessions: statsData.weeklyStats.weeklySessions,
        weeklyDays: statsData.weeklyStats.weeklyDays,
        weekStartDate: statsData.weeklyStats.weekStartDate,
        tier,
        lastDataSyncAt: new Date(),
      };

      if (userStats) {
        // 업데이트
        await this.userStatsRepository.update({ studentId }, statsToSave);
      } else {
        // 새로 생성
        await this.userStatsRepository.save(statsToSave);
      }

      // 랭킹 업데이트 (동기적으로 실행)
      await this.updateRankings();

      this.logger.debug(`Saved stats for user: ${studentId}`);
    } catch (error: any) {
      this.logger.error(`Failed to save user stats: ${error.message}`);
      // 통계 저장 실패해도 메인 로직에 영향 주지 않음
    }
  }

  /**
   * 이용시간에 따른 티어 계산
   */
  private calculateTier(totalHours: number): string {
    if (totalHours < 100) return 'Explorer';
    if (totalHours < 500) return 'Student';
    if (totalHours < 1000) return 'Scholar';
    if (totalHours < 3000) return 'Master';
    if (totalHours < 5000) return 'Legend';
    return 'Myth';
  }

  /**
   * 모든 사용자의 랭킹 업데이트
   */
  private async updateRankings() {
    try {
      // 이용시간 랭킹 업데이트
      await this.userStatsRepository.query(`
        UPDATE "user_stats" 
        SET "hoursRank" = ranked.rank
        FROM (
          SELECT "studentId", 
                 ROW_NUMBER() OVER (ORDER BY "totalUsageHours" DESC) as rank
          FROM "user_stats"
        ) ranked
        WHERE "user_stats"."studentId" = ranked."studentId"
      `);

      // 방문횟수 랭킹 업데이트
      await this.userStatsRepository.query(`
        UPDATE "user_stats" 
        SET "sessionsRank" = ranked.rank
        FROM (
          SELECT "studentId", 
                 ROW_NUMBER() OVER (ORDER BY "totalSessions" DESC) as rank
          FROM "user_stats"
        ) ranked
        WHERE "user_stats"."studentId" = ranked."studentId"
      `);

      // 이용일수 랭킹 업데이트
      await this.userStatsRepository.query(`
        UPDATE "user_stats" 
        SET "daysRank" = ranked.rank
        FROM (
          SELECT "studentId", 
                 ROW_NUMBER() OVER (ORDER BY "totalDays" DESC) as rank
          FROM "user_stats"
        ) ranked
        WHERE "user_stats"."studentId" = ranked."studentId"
      `);

      // 이번주 이용시간 랭킹 업데이트
      await this.userStatsRepository.query(`
        UPDATE "user_stats" 
        SET "weeklyHoursRank" = ranked.rank
        FROM (
          SELECT "studentId", 
                 ROW_NUMBER() OVER (ORDER BY "weeklyUsageHours" DESC) as rank
          FROM "user_stats"
        ) ranked
        WHERE "user_stats"."studentId" = ranked."studentId"
      `);

      // 이번주 방문횟수 랭킹 업데이트
      await this.userStatsRepository.query(`
        UPDATE "user_stats" 
        SET "weeklySessionsRank" = ranked.rank
        FROM (
          SELECT "studentId", 
                 ROW_NUMBER() OVER (ORDER BY "weeklySessions" DESC) as rank
          FROM "user_stats"
        ) ranked
        WHERE "user_stats"."studentId" = ranked."studentId"
      `);

      // 이번주 이용일수 랭킹 업데이트
      await this.userStatsRepository.query(`
        UPDATE "user_stats" 
        SET "weeklyDaysRank" = ranked.rank
        FROM (
          SELECT "studentId", 
                 ROW_NUMBER() OVER (ORDER BY "weeklyDays" DESC) as rank
          FROM "user_stats"
        ) ranked
        WHERE "user_stats"."studentId" = ranked."studentId"
      `);

      this.logger.debug('Rankings updated successfully');
    } catch (error: any) {
      this.logger.error(`Failed to update rankings: ${error.message}`);
      throw error; // 에러를 다시 던져서 호출하는 곳에서 알 수 있게 함
    }
  }

  /**
   * 공개 랭킹 조회 (닉네임으로 공개 설정한 사용자만)
   */
  async getLeaderboards(limit: number = 100) {
    try {
      const [hoursRanking, sessionsRanking, daysRanking] = await Promise.all([
        // 이용시간 랭킹 (공개 설정한 사용자만)
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select([
            'stats.publicNickname as nickname',
            'stats.totalUsageHours',
            'stats.tier',
            'stats.updatedAt',
          ])
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.publicNickname IS NOT NULL')
          .orderBy('stats.totalUsageHours', 'DESC')
          .limit(limit)
          .getRawMany(),

        // 방문횟수 랭킹 (공개 설정한 사용자만)
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select([
            'stats.publicNickname as nickname',
            'stats.totalSessions',
            'stats.tier',
            'stats.updatedAt',
          ])
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.publicNickname IS NOT NULL')
          .orderBy('stats.totalSessions', 'DESC')
          .limit(limit)
          .getRawMany(),

        // 이용일수 랭킹 (공개 설정한 사용자만)
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select([
            'stats.publicNickname as nickname',
            'stats.totalDays',
            'stats.tier',
            'stats.updatedAt',
          ])
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.publicNickname IS NOT NULL')
          .orderBy('stats.totalDays', 'DESC')
          .limit(limit)
          .getRawMany(),
      ]);

      return {
        hoursRanking,
        sessionsRanking,
        daysRanking,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get leaderboards: ${error.message}`);
      throw new Error('랭킹 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이번주 공개 랭킹 조회
   */
  async getWeeklyLeaderboards(limit: number = 100) {
    try {
      const [weeklyHoursRanking, weeklySessionsRanking, weeklyDaysRanking] = await Promise.all([
        // 이번주 이용시간 랭킹 (공개 설정한 사용자만)
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select([
            'stats.publicNickname as nickname',
            'stats.weeklyUsageHours',
            'stats.tier',
            'stats.updatedAt',
          ])
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.publicNickname IS NOT NULL')
          .andWhere('stats.weeklyUsageHours > 0')
          .orderBy('stats.weeklyUsageHours', 'DESC')
          .limit(limit)
          .getRawMany(),

        // 이번주 방문횟수 랭킹 (공개 설정한 사용자만)
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select([
            'stats.publicNickname as nickname',
            'stats.weeklySessions',
            'stats.tier',
            'stats.updatedAt',
          ])
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.publicNickname IS NOT NULL')
          .andWhere('stats.weeklySessions > 0')
          .orderBy('stats.weeklySessions', 'DESC')
          .limit(limit)
          .getRawMany(),

        // 이번주 이용일수 랭킹 (공개 설정한 사용자만)
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select([
            'stats.publicNickname as nickname',
            'stats.weeklyDays',
            'stats.tier',
            'stats.updatedAt',
          ])
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.publicNickname IS NOT NULL')
          .andWhere('stats.weeklyDays > 0')
          .orderBy('stats.weeklyDays', 'DESC')
          .limit(limit)
          .getRawMany(),
      ]);

      return {
        weeklyHoursRanking,
        weeklySessionsRanking,
        weeklyDaysRanking,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get weekly leaderboards: ${error.message}`);
      throw new Error('주간 랭킹 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자의 랭킹 정보 조회
   */
  async getUserRankInfo(studentId: string) {
    try {
      const userStats = await this.userStatsRepository.findOne({
        where: { studentId },
      });

      if (!userStats) {
        return null;
      }

      // 실시간으로 랭킹 계산
      const [hoursRank, sessionsRank, daysRank, totalUsers] = await Promise.all([
        // 이용시간 랭킹
        this.userStatsRepository.count({
          where: { totalUsageHours: MoreThan(userStats.totalUsageHours) }
        }).then(count => count + 1),
        
        // 방문횟수 랭킹  
        this.userStatsRepository.count({
          where: { totalSessions: MoreThan(userStats.totalSessions) }
        }).then(count => count + 1),
        
        // 이용일수 랭킹
        this.userStatsRepository.count({
          where: { totalDays: MoreThan(userStats.totalDays) }
        }).then(count => count + 1),

        // 전체 사용자 수
        this.userStatsRepository.count()
      ]);

      return {
        ...userStats,
        totalUsers,
        hoursRank,
        sessionsRank, 
        daysRank,
        hoursPercentile: hoursRank ? 
          Math.round((1 - hoursRank / totalUsers) * 100) : null,
        sessionsPercentile: sessionsRank ? 
          Math.round((1 - sessionsRank / totalUsers) * 100) : null,
        daysPercentile: daysRank ? 
          Math.round((1 - daysRank / totalUsers) * 100) : null,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get user rank info: ${error.message}`);
      return null;
    }
  }

  /**
   * 랭킹 공개 설정 업데이트
   */
  async updateRankingPrivacy(
    studentId: string,
    isPublic: boolean,
    nickname?: string,
  ) {
    try {
      // 사용자 통계가 존재하는지 확인
      const userStats = await this.userStatsRepository.findOne({
        where: { studentId },
      });

      if (!userStats) {
        throw new NotFoundException('사용자 통계를 찾을 수 없습니다.');
      }

      // 공개 설정하는 경우 닉네임 유효성 검사
      if (isPublic) {
        if (!nickname || nickname.trim().length === 0) {
          throw new Error('랭킹 공개 시 닉네임은 필수입니다.');
        }

        if (nickname.length > 20) {
          throw new Error('닉네임은 20자 이하여야 합니다.');
        }

        // 닉네임 중복 체크
        const existingNickname = await this.userStatsRepository.findOne({
          where: {
            publicNickname: nickname.trim(),
            studentId: Not(studentId), // 자신 제외
          },
        });

        if (existingNickname) {
          throw new Error('이미 사용 중인 닉네임입니다.');
        }
      }

      // 업데이트
      await this.userStatsRepository.update(
        { studentId },
        {
          isPublicRanking: isPublic,
          publicNickname: isPublic ? nickname?.trim() : undefined,
        },
      );

      this.logger.debug(
        `Updated ranking privacy for user ${studentId}: public=${isPublic}, nickname=${nickname}`,
      );

      return {
        success: true,
        message: isPublic
          ? '랭킹이 공개되었습니다.'
          : '랭킹이 비공개로 설정되었습니다.',
      };
    } catch (error: any) {
      this.logger.error(`Failed to update ranking privacy: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(error.message || '랭킹 설정 업데이트 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자의 랭킹 공개 설정 조회
   */
  async getRankingPrivacySettings(studentId: string) {
    try {
      const userStats = await this.userStatsRepository.findOne({
        where: { studentId },
        select: ['isPublicRanking', 'publicNickname'],
      });

      if (!userStats) {
        return {
          isPublicRanking: false,
          publicNickname: null,
        };
      }

      return {
        isPublicRanking: userStats.isPublicRanking,
        publicNickname: userStats.publicNickname,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get ranking privacy settings: ${error.message}`);
      throw new Error('랭킹 설정 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 공개 랭킹에서 사용자의 순위 조회
   */
  async getPublicRankPosition(studentId: string) {
    try {
      const userStats = await this.userStatsRepository.findOne({
        where: { studentId },
      });

      if (!userStats || !userStats.isPublicRanking) {
        return null;
      }

      const [hoursRank, sessionsRank, daysRank] = await Promise.all([
        // 이용시간 기준 공개 랭킹에서의 순위
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select('COUNT(*) + 1', 'rank')
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.totalUsageHours > :hours', { hours: userStats.totalUsageHours })
          .getRawOne(),

        // 방문횟수 기준 공개 랭킹에서의 순위
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select('COUNT(*) + 1', 'rank')
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.totalSessions > :sessions', { sessions: userStats.totalSessions })
          .getRawOne(),

        // 이용일수 기준 공개 랭킹에서의 순위
        this.userStatsRepository
          .createQueryBuilder('stats')
          .select('COUNT(*) + 1', 'rank')
          .where('stats.isPublicRanking = :isPublic', { isPublic: true })
          .andWhere('stats.totalDays > :days', { days: userStats.totalDays })
          .getRawOne(),
      ]);

      return {
        nickname: userStats.publicNickname,
        hoursRank: parseInt(hoursRank.rank),
        sessionsRank: parseInt(sessionsRank.rank),
        daysRank: parseInt(daysRank.rank),
        tier: userStats.tier,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get public rank position: ${error.message}`);
      return null;
    }
  }

  /**
   * 전체 랭킹 조회 (새로운 형식)
   */
  async getAllTimeRankings(limit: number = 20, page: number = 1) {
    try {
      const now = new Date();
      const weekStart = this.getWeekStart(now);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const skip = (page - 1) * limit;

      // 총 개수와 랭킹 데이터를 동시에 가져오기
      const [
        hoursTotal,
        hoursUsers,
        sessionsTotal, 
        sessionsUsers,
        daysTotal,
        daysUsers
      ] = await Promise.all([
        // 이용시간 총 개수
        this.userStatsRepository.count({
          where: { 
            totalUsageHours: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          }
        }),
        // 이용시간 랭킹 데이터
        this.userStatsRepository.find({
          where: { 
            totalUsageHours: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          },
          order: { totalUsageHours: 'DESC' },
          skip,
          take: limit,
        }),
        // 방문횟수 총 개수
        this.userStatsRepository.count({
          where: { 
            totalSessions: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          }
        }),
        // 방문횟수 랭킹 데이터
        this.userStatsRepository.find({
          where: { 
            totalSessions: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          },
          order: { totalSessions: 'DESC' },
          skip,
          take: limit,
        }),
        // 이용일수 총 개수
        this.userStatsRepository.count({
          where: { 
            totalDays: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          }
        }),
        // 이용일수 랭킹 데이터
        this.userStatsRepository.find({
          where: { 
            totalDays: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          },
          order: { totalDays: 'DESC' },
          skip,
          take: limit,
        }),
      ]);

      const hoursRanking = hoursUsers.map((user, index) => ({
        rank: skip + index + 1,
        publicNickname: user.publicNickname,
        totalHours: user.totalUsageHours,
        totalSessions: user.totalSessions,
        totalDays: user.totalDays,
        tier: user.tier,
      }));

      const sessionsRanking = sessionsUsers.map((user, index) => ({
        rank: skip + index + 1,
        publicNickname: user.publicNickname,
        totalHours: user.totalUsageHours,
        totalSessions: user.totalSessions,
        totalDays: user.totalDays,
        tier: user.tier,
      }));

      const daysRanking = daysUsers.map((user, index) => ({
        rank: skip + index + 1,
        publicNickname: user.publicNickname,
        totalHours: user.totalUsageHours,
        totalSessions: user.totalSessions,
        totalDays: user.totalDays,
        tier: user.tier,
      }));

      return {
        hoursRanking,
        sessionsRanking,
        daysRanking,
        pagination: {
          page,
          limit,
          totalPages: {
            hours: Math.ceil(hoursTotal / limit),
            sessions: Math.ceil(sessionsTotal / limit),
            days: Math.ceil(daysTotal / limit),
          },
          totalItems: {
            hours: hoursTotal,
            sessions: sessionsTotal,
            days: daysTotal,
          },
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get all-time rankings: ${error.message}`);
      throw new Error('전체 랭킹 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 주간 랭킹 조회 (새로운 형식)
   */
  async getWeeklyRankings(limit: number = 20, page: number = 1) {
    try {
      const now = new Date();
      const weekStart = this.getWeekStart(now);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const skip = (page - 1) * limit;

      // 총 개수와 랭킹 데이터를 동시에 가져오기
      const [
        hoursTotal,
        hoursUsers,
        sessionsTotal, 
        sessionsUsers,
        daysTotal,
        daysUsers
      ] = await Promise.all([
        // 주간 이용시간 총 개수
        this.userStatsRepository.count({
          where: { 
            weeklyUsageHours: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          }
        }),
        // 주간 이용시간 랭킹 데이터
        this.userStatsRepository.find({
          where: { 
            weeklyUsageHours: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          },
          order: { weeklyUsageHours: 'DESC' },
          skip,
          take: limit,
        }),
        // 주간 방문횟수 총 개수
        this.userStatsRepository.count({
          where: { 
            weeklySessions: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          }
        }),
        // 주간 방문횟수 랭킹 데이터
        this.userStatsRepository.find({
          where: { 
            weeklySessions: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          },
          order: { weeklySessions: 'DESC' },
          skip,
          take: limit,
        }),
        // 주간 이용일수 총 개수
        this.userStatsRepository.count({
          where: { 
            weeklyDays: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          }
        }),
        // 주간 이용일수 랭킹 데이터
        this.userStatsRepository.find({
          where: { 
            weeklyDays: MoreThan(0),
            isPublicRanking: true,
            publicNickname: Not(IsNull())
          },
          order: { weeklyDays: 'DESC' },
          skip,
          take: limit,
        }),
      ]);

      const hoursRanking = hoursUsers.map((user, index) => ({
        rank: skip + index + 1,
        publicNickname: user.publicNickname,
        weeklyHours: user.weeklyUsageHours,
        weeklySessions: user.weeklySessions,
        weeklyDays: user.weeklyDays,
        tier: user.tier,
      }));

      const sessionsRanking = sessionsUsers.map((user, index) => ({
        rank: skip + index + 1,
        publicNickname: user.publicNickname,
        weeklyHours: user.weeklyUsageHours,
        weeklySessions: user.weeklySessions,
        weeklyDays: user.weeklyDays,
        tier: user.tier,
      }));

      const daysRanking = daysUsers.map((user, index) => ({
        rank: skip + index + 1,
        publicNickname: user.publicNickname,
        weeklyHours: user.weeklyUsageHours,
        weeklySessions: user.weeklySessions,
        weeklyDays: user.weeklyDays,
        tier: user.tier,
      }));

      return {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        hoursRanking,
        sessionsRanking,
        daysRanking,
        pagination: {
          page,
          limit,
          totalPages: {
            hours: Math.ceil(hoursTotal / limit),
            sessions: Math.ceil(sessionsTotal / limit),
            days: Math.ceil(daysTotal / limit),
          },
          totalItems: {
            hours: hoursTotal,
            sessions: sessionsTotal,
            days: daysTotal,
          },
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get weekly rankings: ${error.message}`);
      throw new Error('주간 랭킹 조회 중 오류가 발생했습니다.');
    }
  }
}
