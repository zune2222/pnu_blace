import { Injectable } from '@nestjs/common';
import { SchoolApiService } from '../school-api/school-api.service';
import {
  SeatStatusDto,
  MySeatDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
  ExtendSeatResponseDto,
  SeatDetailDto,
  SeatVacancyPredictionDto,
} from '@pnu-blace/types';
import { SeatQueryService } from './seat-query.service';
import { SeatReservationService } from './seat-reservation.service';
import { SeatRendererService } from './seat-renderer.service';
import { SeatPredictionService } from './seat-prediction.service';

@Injectable()
export class SeatsService {
  constructor(
    private schoolApiService: SchoolApiService,
    private seatQueryService: SeatQueryService,
    private seatReservationService: SeatReservationService,
    private seatRendererService: SeatRendererService,
    private seatPredictionService: SeatPredictionService,
  ) {}

  /**
   * 특정 열람실의 전체 좌석 상태 조회
   */
  async getSeatStatus(
    roomNo: string,
    studentId: string,
  ): Promise<SeatStatusDto[]> {
    return this.seatQueryService.getSeatStatus(roomNo, studentId);
  }

  /**
   * 특정 열람실의 상세 좌석 정보 조회
   */
  async getSeatDetail(
    roomNo: string,
    studentId: string,
  ): Promise<SeatDetailDto> {
    return this.seatQueryService.getSeatDetail(roomNo, studentId);
  }

  /**
   * 방 번호에 따른 배경 이미지 URL 반환
   */
  getBackgroundImageUrl(roomNo: string): string {
    return this.seatQueryService.getBackgroundImageUrl(roomNo);
  }

  /**
   * 시스템 계정으로 로그인
   */
  async loginAsSystem() {
    return this.schoolApiService.loginAsSystem();
  }

  /**
   * 원본 PNU HTML을 가져와서 좌석 버튼을 교체
   */
  async getSeatMapHtml(roomNo: string, sessionID: string): Promise<string> {
    return this.seatRendererService.getSeatMapHtml(roomNo, sessionID);
  }

  /**
   * 현재 내가 예약한 좌석 정보 조회
   */
  async getMySeat(studentId: string): Promise<MySeatDto | null> {
    return this.seatReservationService.getMySeat(studentId);
  }

  /**
   * 좌석 예약
   */
  async reserveSeat(
    studentId: string,
    reserveSeatDto: ReserveSeatRequestDto,
  ): Promise<SeatActionResponseDto> {
    return this.seatReservationService.reserveSeat(studentId, reserveSeatDto);
  }

  /**
   * 좌석 반납
   */
  async returnSeat(studentId: string): Promise<SeatActionResponseDto> {
    return this.seatReservationService.returnSeat(studentId);
  }

  /**
   * 좌석 연장
   */
  async extendSeat(studentId: string): Promise<ExtendSeatResponseDto> {
    return this.seatReservationService.extendSeat(studentId);
  }

  /**
   * 좌석 반납 예측 시간 조회
   */
  async getSeatPrediction(
    roomNo: string,
    seatNo: string,
  ): Promise<SeatVacancyPredictionDto> {
    return this.seatPredictionService.getSeatPrediction(roomNo, seatNo);
  }
}
