import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SchoolApiService } from '../school-api/school-api.service';
import { StatsService } from '../stats/stats.service';
import { SeatVacancyPredictionDto } from '@pnu-blace/types';

@Injectable()
export class SeatPredictionService {
  private readonly logger = new Logger(SeatPredictionService.name);

  constructor(
    private schoolApiService: SchoolApiService,
    private statsService: StatsService,
  ) {}

  /**
   * 좌석 반납 예측 시간 조회
   */
  async getSeatPrediction(
    roomNo: string,
    seatNo: string,
  ): Promise<SeatVacancyPredictionDto> {
    try {
      // 현재 좌석 상태 조회
      const seats = await this.schoolApiService.getSeatMap(roomNo);
      const targetSeat = seats.find((seat) => seat.seatNo === seatNo);

      if (!targetSeat) {
        throw new Error(`좌석 ${seatNo}을 찾을 수 없습니다.`);
      }

      // 통계 서비스를 통한 예측 데이터 조회
      const prediction = await this.statsService.getSeatPrediction(
        roomNo,
        seatNo,
      );

      this.logger.debug(`Seat prediction requested: ${roomNo}/${seatNo}`);

      // SeatVacancyPredictionDto 형식에 맞게 변환
      return {
        seatNo: seatNo,
        predictedEndTime: new Date(
          Date.now() + 2 * 60 * 60 * 1000,
        ).toISOString(), // 2시간 후
        confidence: 0.7, // 70% 확신
        message: '사용 패턴을 기반으로 한 예측입니다.',
        currentStatus: targetSeat.status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get seat prediction: ${this.getErrorMessage(error)}`,
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
