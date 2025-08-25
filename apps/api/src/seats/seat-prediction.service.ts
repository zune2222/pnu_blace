import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SchoolApiService } from '../school-api/school-api.service';
import { SeatVacancyPredictionDto } from '@pnu-blace/types';

@Injectable()
export class SeatPredictionService {
  private readonly logger = new Logger(SeatPredictionService.name);

  constructor(private schoolApiService: SchoolApiService) {}

  /**
   * 좌석 반납 예측 시간 조회
   */
  async getSeatPrediction(
    roomNo: string,
    setNo: string,
  ): Promise<SeatVacancyPredictionDto> {
    try {
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new BadRequestException('좌석 정보 조회에 실패했습니다.');
      }

      const seats = await this.schoolApiService.getSeatMap(
        roomNo,
        loginResult.sessionID,
      );
      const targetSeat = seats.find((seat) => seat.setNo === setNo);

      if (!targetSeat) {
        throw new BadRequestException('좌석을 찾을 수 없습니다.');
      }

      if (targetSeat.status !== 'OCCUPIED') {
        throw new BadRequestException('이 좌석은 현재 사용 중이 아닙니다.');
      }

      // TODO: 실제로는 머신러닝 모델이나 사용 패턴 분석을 통해 예측
      const now = new Date();
      const predictedEndTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2시간 후

      this.logger.debug(`Seat prediction requested: ${roomNo}/${setNo}`);

      return {
        setNo,
        predictedEndTime: predictedEndTime.toISOString(),
        confidence: 0.7, // 70% 확신
        message: '사용 패턴을 기반으로 한 예측입니다.',
      };
    } catch (error: any) {
      this.logger.error(`Get seat prediction error: ${error.message}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        '좌석 예측 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }
}