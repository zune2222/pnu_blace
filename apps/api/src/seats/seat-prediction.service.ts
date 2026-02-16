import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolApiService } from '../school-api/school-api.service';
import { SurvivalAnalysisService } from '../stats/survival-analysis.service';
import { SeatVacancyPredictionDto } from '@pnu-blace/types';
import { SeatEventLog } from '@pnu-blace/db';

@Injectable()
export class SeatPredictionService {
  private readonly logger = new Logger(SeatPredictionService.name);

  constructor(
    private schoolApiService: SchoolApiService,
    private survivalAnalysisService: SurvivalAnalysisService,
    @InjectRepository(SeatEventLog)
    private seatEventLogRepository: Repository<SeatEventLog>,
  ) {}

  /**
   * 좌석 반납 예측 시간 조회 — 생존분석 기반
   */
  async getSeatPrediction(
    roomNo: string,
    seatNo: string,
    includeCurve = false,
  ): Promise<SeatVacancyPredictionDto> {
    try {
      // 1. 현재 좌석 상태 조회
      const seats = await this.schoolApiService.getSeatMap(roomNo);
      const targetSeat = seats.find((seat) => seat.seatNo === seatNo);

      if (!targetSeat) {
        throw new Error(`좌석 ${seatNo}을 찾을 수 없습니다.`);
      }

      if (targetSeat.status !== 'OCCUPIED') {
        return {
          seatNo,
          predictedEndTime: '',
          confidence: 1,
          message: '현재 비어있는 좌석입니다.',
          currentStatus: targetSeat.status,
        };
      }

      // 2. 현재 세션 시작 시각 조회 (최근 OCCUPIED 이벤트)
      const latestOccupied = await this.seatEventLogRepository.findOne({
        where: { roomNo, seatNo, event: 'OCCUPIED' },
        order: { timestamp: 'DESC' },
      });

      const occupiedSince = latestOccupied?.timestamp ?? new Date();
      const now = new Date();
      const elapsedMinutes = (now.getTime() - occupiedSince.getTime()) / 60000;

      // 3. 생존분석 예측
      const prediction = await this.survivalAnalysisService.predictVacancy(
        roomNo,
        occupiedSince,
        includeCurve,
      );

      // 4. predictedEndTime 계산
      const predictedEnd = new Date(
        now.getTime() + prediction.medianRemainingMinutes * 60000,
      );

      // 5. 메시지 생성
      const message = this.buildMessage(
        prediction.medianRemainingMinutes,
        prediction.confidence,
        prediction.segment.periodType,
      );

      this.logger.debug(
        `Prediction for ${roomNo}/${seatNo}: median=${prediction.medianRemainingMinutes}min, confidence=${prediction.confidence}`,
      );

      return {
        seatNo,
        predictedEndTime: predictedEnd.toISOString(),
        confidence: prediction.confidence,
        message,
        currentStatus: targetSeat.status,
        occupiedSince: occupiedSince.toISOString(),
        elapsedMinutes: Math.round(elapsedMinutes),
        medianRemainingMinutes: prediction.medianRemainingMinutes,
        remainingRange: {
          optimistic: prediction.q25RemainingMinutes,
          pessimistic: prediction.q75RemainingMinutes,
        },
        probabilityBands: prediction.probabilityBands,
        segment: prediction.segment,
        sampleSize: prediction.sampleSize,
        survivalCurve: prediction.survivalCurve,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get seat prediction: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  private static readonly PERIOD_NAMES: Record<string, string> = {
    NORMAL: '평상시',
    EXAM: '시험 기간',
    FINALS: '기말고사 기간',
    VACATION: '방학 기간',
    ALL: '전체',
  };

  private buildMessage(
    medianMinutes: number,
    confidence: number,
    periodType: string,
  ): string {
    if (confidence === 0) {
      return '예측 데이터가 부족합니다.';
    }

    const hours = Math.floor(medianMinutes / 60);
    const mins = Math.round(medianMinutes % 60);
    const periodName =
      SeatPredictionService.PERIOD_NAMES[periodType] ?? '평상시';

    const timeStr =
      hours > 0
        ? `약 ${hours}시간 ${mins > 0 ? `${mins}분` : ''}`
        : `약 ${mins}분`;

    const confStr =
      confidence >= 0.85
        ? '높은 신뢰도'
        : confidence >= 0.5
          ? '보통 신뢰도'
          : '낮은 신뢰도';

    return `${periodName} 패턴 기준, ${timeStr} 후 비워질 것으로 예측됩니다. (${confStr})`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
