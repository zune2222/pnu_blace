import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { SeatEventLog } from '@pnu-blace/db';
import {
  PeriodType,
  SurvivalPoint,
  VacancyProbabilityBand,
  SurvivalPredictionResult,
  PredictionSegment,
} from '@pnu-blace/types';
import { CalendarService } from './calendar.service';

const HOUR_BUCKETS = {
  EARLY_MORNING: { start: 5, end: 9 },
  MORNING: { start: 9, end: 13 },
  AFTERNOON: { start: 13, end: 18 },
  EVENING: { start: 18, end: 22 },
  NIGHT: { start: 22, end: 5 },
} as const;

type HourBucket = keyof typeof HOUR_BUCKETS;

const CURVE_INTERVAL_MINUTES = 15;
const MIN_SAMPLE_SIZE = 30;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6시간
const MIN_SESSION_MINUTES = 5;
const MAX_SESSION_MINUTES = 1440; // 24시간
const PROBABILITY_BAND_INTERVALS = [15, 30, 60, 120, 180, 240]; // 분

interface CachedCurve {
  curve: SurvivalPoint[];
  sampleSize: number;
  updatedAt: Date;
}

interface SessionRow {
  roomNo: string;
  seatNo: string;
  startTime: Date;
  durationMinutes: number;
  periodType: PeriodType;
  startHour: number;
  dayOfWeek: number;
}

@Injectable()
export class SurvivalAnalysisService {
  private readonly logger = new Logger(SurvivalAnalysisService.name);
  private readonly curveCache = new Map<string, CachedCurve>();

  constructor(
    @InjectRepository(SeatEventLog)
    private seatEventLogRepository: Repository<SeatEventLog>,
    private calendarService: CalendarService,
  ) {}

  /**
   * 좌석 비움 예측: 현재 사용 중인 좌석이 언제 비워질지 예측
   */
  async predictVacancy(
    roomNo: string,
    occupiedSince: Date,
    includeCurve = false,
  ): Promise<
    SurvivalPredictionResult & {
      segment: PredictionSegment;
      sampleSize: number;
    }
  > {
    const now = new Date();
    const elapsedMinutes = (now.getTime() - occupiedSince.getTime()) / 60000;
    const periodType =
      await this.calendarService.getCurrentPeriodType(occupiedSince);
    const startHour = this.toKstHour(occupiedSince);
    const bucket = this.getHourBucket(startHour);
    const dayType = this.getDayType(occupiedSince);

    // 계층적 폴백으로 생존 곡선 조회
    const { curve, segment, sampleSize } = await this.getCurveWithFallback(
      periodType,
      bucket,
      dayType,
      roomNo,
    );

    // 조건부 확률: S(t | T > E) = S(E + t) / S(E)
    const sAtElapsed = this.interpolateSurvival(curve, elapsedMinutes);

    // sAtElapsed <= 0이면 거의 모든 세션이 끝난 시간대 → 남은 시간 0
    const medianRemaining =
      sAtElapsed <= 0
        ? 0
        : this.findConditionalQuantile(curve, elapsedMinutes, sAtElapsed, 0.5);
    const q25Remaining =
      sAtElapsed <= 0
        ? 0
        : this.findConditionalQuantile(curve, elapsedMinutes, sAtElapsed, 0.25);
    const q75Remaining =
      sAtElapsed <= 0
        ? 0
        : this.findConditionalQuantile(curve, elapsedMinutes, sAtElapsed, 0.75);

    return {
      medianRemainingMinutes: Math.round(medianRemaining),
      q25RemainingMinutes: Math.round(q25Remaining),
      q75RemainingMinutes: Math.round(q75Remaining),
      probabilityBands: this.buildBands(curve, elapsedMinutes, sAtElapsed),
      confidence: this.calculateConfidence(sampleSize),
      survivalCurve: includeCurve
        ? this.buildConditionalCurve(curve, elapsedMinutes)
        : undefined,
      segment,
      sampleSize,
    };
  }

  /**
   * 캐시 강제 갱신 (크론 또는 수동)
   */
  @Cron('0 */6 * * *')
  refreshCache(): void {
    this.logger.log('Refreshing survival curve cache...');
    this.curveCache.clear();
    // 다음 predictVacancy 호출 시 lazy하게 다시 구축
    this.logger.log('Survival curve cache cleared');
  }

  /**
   * OCCUPIED→VACATED 쌍 매칭으로 유효 세션 추출
   * SQL LEAD 윈도우 함수 사용
   */
  private async fetchSessions(
    filters: {
      periodType?: PeriodType;
      startHourBucket?: HourBucket;
      dayType?: 'WEEKDAY' | 'WEEKEND';
      roomNo?: string;
    } = {},
  ): Promise<SessionRow[]> {
    // CTE 내부에 적용 가능한 필터 (windowing 전 데이터 축소)
    // 주의: event 필터는 CTE에 넣으면 안됨 — LEAD가 VACATED 이벤트도 봐야 페어링 가능
    const cteConditions: string[] = ["event IN ('OCCUPIED', 'VACATED')"];
    // CTE 외부에만 적용 가능한 필터 (계산된 컬럼 기반)
    const outerConditions: string[] = [
      "paired.event = 'OCCUPIED'",
      "paired.next_event = 'VACATED'",
      'paired.next_time IS NOT NULL',
      `EXTRACT(EPOCH FROM (paired.next_time - paired.start_time)) / 60 BETWEEN ${MIN_SESSION_MINUTES} AND ${MAX_SESSION_MINUTES}`,
    ];
    const params: (string | number)[] = [];
    let paramIdx = 1;

    // periodType과 roomNo는 CTE 안으로 푸시 가능
    if (filters.periodType) {
      cteConditions.push(`"periodType" = $${paramIdx++}`);
      params.push(filters.periodType);
    }
    if (filters.roomNo) {
      cteConditions.push(`"roomNo" = $${paramIdx++}`);
      params.push(filters.roomNo);
    }

    // 시간대/요일 필터는 CTE가 계산한 컬럼 기반이므로 외부에서 적용
    if (filters.startHourBucket) {
      const bucket = HOUR_BUCKETS[filters.startHourBucket];
      if (filters.startHourBucket === 'NIGHT') {
        outerConditions.push(
          `(paired.start_hour >= $${paramIdx} OR paired.start_hour < $${paramIdx + 1})`,
        );
      } else {
        outerConditions.push(
          `paired.start_hour >= $${paramIdx} AND paired.start_hour < $${paramIdx + 1}`,
        );
      }
      params.push(bucket.start, bucket.end);
      paramIdx += 2;
    }
    if (filters.dayType) {
      outerConditions.push(
        filters.dayType === 'WEEKEND'
          ? 'paired.dow IN (0, 6)'
          : 'paired.dow NOT IN (0, 6)',
      );
    }

    const sql = `
      WITH paired AS (
        SELECT
          "roomNo",
          "seatNo",
          event,
          timestamp AS start_time,
          "periodType",
          EXTRACT(HOUR FROM (timestamp AT TIME ZONE 'Asia/Seoul'))::int AS start_hour,
          EXTRACT(DOW FROM (timestamp AT TIME ZONE 'Asia/Seoul'))::int AS dow,
          LEAD(timestamp) OVER (
            PARTITION BY "roomNo", "seatNo"
            ORDER BY timestamp
          ) AS next_time,
          LEAD(event) OVER (
            PARTITION BY "roomNo", "seatNo"
            ORDER BY timestamp
          ) AS next_event
        FROM seat_event_log
        WHERE ${cteConditions.join(' AND ')}
      )
      SELECT
        paired."roomNo" AS "roomNo",
        paired."seatNo" AS "seatNo",
        paired.start_time AS "startTime",
        paired."periodType" AS "periodType",
        paired.start_hour AS "startHour",
        paired.dow AS "dayOfWeek",
        EXTRACT(EPOCH FROM (paired.next_time - paired.start_time)) / 60 AS "durationMinutes"
      FROM paired
      WHERE ${outerConditions.join(' AND ')}
      ORDER BY paired.start_time
    `;

    return this.seatEventLogRepository.query(sql, params);
  }

  /**
   * 세션 목록으로부터 Kaplan-Meier 생존 곡선 생성
   * S(t) = 해당 시점에서 아직 사용 중인 비율
   */
  private buildSurvivalCurve(sessions: SessionRow[]): SurvivalPoint[] {
    if (sessions.length === 0) return [];

    const durations = sessions
      .map((s) => Number(s.durationMinutes))
      .sort((a, b) => a - b);

    const n = durations.length;
    const maxDuration = durations[n - 1];
    const points: SurvivalPoint[] = [];

    // 정렬된 배열에서 이진 탐색으로 S(t) 계산 — O(m * log n)
    for (
      let t = 0;
      t <= maxDuration + CURVE_INTERVAL_MINUTES;
      t += CURVE_INTERVAL_MINUTES
    ) {
      const surviving = n - this.upperBound(durations, t);
      points.push({
        minutesFromStart: t,
        survivalProbability: surviving / n,
        sampleSize: n,
      });

      if (surviving === 0) break;
    }

    return points;
  }

  /** 정렬된 배열에서 value 이하인 원소의 개수 (upper bound) */
  private upperBound(sorted: number[], value: number): number {
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (sorted[mid] <= value) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  private buildSegmentKey(segment: PredictionSegment): string {
    const parts = [
      segment.periodType,
      segment.startHourBucket,
      segment.dayType,
    ];
    if (segment.roomNo) parts.push(segment.roomNo);
    return parts.join(':');
  }

  private async getCurveWithFallback(
    periodType: PeriodType,
    bucket: HourBucket,
    dayType: 'WEEKDAY' | 'WEEKEND',
    roomNo: string,
  ): Promise<{
    curve: SurvivalPoint[];
    segment: PredictionSegment;
    sampleSize: number;
  }> {
    // 폴백 계층: 가장 구체적 → 가장 일반적
    type SessionFilters = {
      periodType?: PeriodType;
      startHourBucket?: HourBucket;
      dayType?: 'WEEKDAY' | 'WEEKEND';
      roomNo?: string;
    };

    const fallbackChain: {
      segment: PredictionSegment;
      filters: SessionFilters;
    }[] = [
      {
        segment: { periodType, startHourBucket: bucket, dayType, roomNo },
        filters: { periodType, startHourBucket: bucket, dayType, roomNo },
      },
      {
        segment: { periodType, startHourBucket: bucket, dayType },
        filters: { periodType, startHourBucket: bucket, dayType },
      },
      {
        segment: { periodType, startHourBucket: bucket, dayType: 'ALL' },
        filters: { periodType, startHourBucket: bucket },
      },
      {
        segment: {
          periodType,
          startHourBucket: 'ALL',
          dayType: 'ALL',
        },
        filters: { periodType },
      },
      {
        segment: {
          periodType: 'ALL',
          startHourBucket: 'ALL',
          dayType: 'ALL',
        },
        filters: {},
      },
    ];

    for (const { segment, filters } of fallbackChain) {
      const key = this.buildSegmentKey(segment);

      // 캐시 확인
      const cached = this.curveCache.get(key);
      if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL_MS) {
        if (cached.sampleSize >= MIN_SAMPLE_SIZE) {
          return {
            curve: cached.curve,
            segment,
            sampleSize: cached.sampleSize,
          };
        }
        continue; // 캐시는 있지만 샘플 부족 → 다음 폴백
      }

      // DB에서 세션 로드 + 곡선 구축
      const sessions = await this.fetchSessions(filters);
      const curve = this.buildSurvivalCurve(sessions);

      // 캐시 저장
      this.curveCache.set(key, {
        curve,
        sampleSize: sessions.length,
        updatedAt: new Date(),
      });

      if (sessions.length >= MIN_SAMPLE_SIZE) {
        return { curve, segment, sampleSize: sessions.length };
      }

      this.logger.debug(
        `Segment ${key}: ${sessions.length} sessions (< ${MIN_SAMPLE_SIZE}), falling back`,
      );
    }

    // 최후 수단: 빈 데이터도 없으면 기본 곡선
    this.logger.warn('No sufficient data for any segment, using default curve');
    return {
      curve: this.buildDefaultCurve(),
      segment: {
        periodType: 'ALL',
        startHourBucket: 'ALL',
        dayType: 'ALL',
      },
      sampleSize: 0,
    };
  }

  /**
   * 데이터가 전혀 없을 때 사용하는 기본 곡선 (지수분포 가정, 중앙값 180분)
   */
  private buildDefaultCurve(): SurvivalPoint[] {
    const lambda = Math.LN2 / 180; // 중앙값 180분
    const points: SurvivalPoint[] = [];
    for (let t = 0; t <= MAX_SESSION_MINUTES; t += CURVE_INTERVAL_MINUTES) {
      points.push({
        minutesFromStart: t,
        survivalProbability: Math.exp(-lambda * t),
        sampleSize: 0,
      });
    }
    return points;
  }

  /**
   * 선형 보간으로 곡선에서 특정 시점의 생존 확률 조회
   */
  private interpolateSurvival(curve: SurvivalPoint[], minutes: number): number {
    if (curve.length === 0) return 0;
    if (minutes <= 0) return 1;

    const last = curve[curve.length - 1];
    if (minutes >= last.minutesFromStart) return last.survivalProbability;

    for (let i = 1; i < curve.length; i++) {
      const prev = curve[i - 1];
      const curr = curve[i];
      if (minutes <= curr.minutesFromStart) {
        const ratio =
          (minutes - prev.minutesFromStart) /
          (curr.minutesFromStart - prev.minutesFromStart);
        return (
          prev.survivalProbability +
          ratio * (curr.survivalProbability - prev.survivalProbability)
        );
      }
    }

    return last.survivalProbability;
  }

  /**
   * 조건부 분위수 계산
   * "이미 E분 사용 중일 때, 추가로 남은 시간의 q-분위수"
   * S(E + t) / S(E) = 1 - q 를 만족하는 t 를 찾음
   */
  private findConditionalQuantile(
    curve: SurvivalPoint[],
    elapsedMinutes: number,
    sAtElapsed: number,
    quantile: number,
  ): number {
    // 목표: S(E + t) / S(E) = 1 - quantile
    const targetConditional = 1 - quantile;
    const targetAbsolute = sAtElapsed * targetConditional;

    // 곡선에서 S(t) = targetAbsolute 인 t 찾기
    for (let i = 1; i < curve.length; i++) {
      const prev = curve[i - 1];
      const curr = curve[i];

      if (
        curr.survivalProbability <= targetAbsolute &&
        prev.survivalProbability >= targetAbsolute
      ) {
        // 선형 보간
        const ratio =
          prev.survivalProbability === curr.survivalProbability
            ? 0
            : (prev.survivalProbability - targetAbsolute) /
              (prev.survivalProbability - curr.survivalProbability);
        const absoluteTime =
          prev.minutesFromStart +
          ratio * (curr.minutesFromStart - prev.minutesFromStart);
        return Math.max(0, absoluteTime - elapsedMinutes);
      }
    }

    // 곡선 끝까지 도달 못함 → 마지막 시점 기준
    const last = curve[curve.length - 1];
    return Math.max(0, last.minutesFromStart - elapsedMinutes);
  }

  /**
   * "N분 내 비워질 확률" 밴드 구축
   */
  private buildBands(
    curve: SurvivalPoint[],
    elapsedMinutes: number,
    sAtElapsed: number,
  ): VacancyProbabilityBand[] {
    const intervals = PROBABILITY_BAND_INTERVALS;
    return intervals.map((withinMinutes) => {
      if (sAtElapsed <= 0) {
        return { withinMinutes, probability: 1 };
      }
      const futureS = this.interpolateSurvival(
        curve,
        elapsedMinutes + withinMinutes,
      );
      // P(비워질 | 이미 E분 사용) = 1 - S(E+t)/S(E)
      const probability = Math.min(1, Math.max(0, 1 - futureS / sAtElapsed));
      return {
        withinMinutes,
        probability: Math.round(probability * 1000) / 1000,
      };
    });
  }

  /**
   * 프론트엔드 차트용 조건부 생존 곡선 (elapsed 이후부터)
   */
  private buildConditionalCurve(
    curve: SurvivalPoint[],
    elapsedMinutes: number,
  ): SurvivalPoint[] {
    const sAtElapsed = this.interpolateSurvival(curve, elapsedMinutes);
    if (sAtElapsed <= 0) return [];

    return curve
      .filter((p) => p.minutesFromStart >= elapsedMinutes)
      .map((p) => ({
        minutesFromStart: Math.round(p.minutesFromStart - elapsedMinutes),
        survivalProbability:
          Math.round((p.survivalProbability / sAtElapsed) * 1000) / 1000,
        sampleSize: p.sampleSize,
      }));
  }

  private toKstHour(date: Date): number {
    // UTC → KST (+9)
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return kst.getUTCHours();
  }

  private getHourBucket(hour: number): HourBucket {
    if (hour >= 5 && hour < 9) return 'EARLY_MORNING';
    if (hour >= 9 && hour < 13) return 'MORNING';
    if (hour >= 13 && hour < 18) return 'AFTERNOON';
    if (hour >= 18 && hour < 22) return 'EVENING';
    return 'NIGHT';
  }

  private getDayType(date: Date): 'WEEKDAY' | 'WEEKEND' {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const day = kst.getUTCDay();
    return day === 0 || day === 6 ? 'WEEKEND' : 'WEEKDAY';
  }

  private calculateConfidence(sampleSize: number): number {
    if (sampleSize === 0) return 0;
    if (sampleSize < MIN_SAMPLE_SIZE) return 0.3;
    if (sampleSize < 100) return 0.5;
    if (sampleSize < 500) return 0.7;
    if (sampleSize < 1000) return 0.85;
    return 0.95;
  }
}
