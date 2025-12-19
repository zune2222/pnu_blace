import { SeatDetailDto, SeatPredictionDto, ReserveSeatRequestDto, SeatActionResponseDto } from "@pnu-blace/types";
import { apiClient } from "@/shared/lib/api";

class SeatFinderApi {
  // 좌석 상세 정보 조회
  async getSeatDetail(roomNo: string): Promise<SeatDetailDto | null> {
    try {
      return await apiClient.get<SeatDetailDto>(`/api/v1/seats/${roomNo}/detail`);
    } catch (error) {
      console.warn("좌석 상세 조회 실패:", error);
      return null;
    }
  }

  // 좌석 예약
  async reserveSeat(request: ReserveSeatRequestDto): Promise<SeatActionResponseDto> {
    return await apiClient.post<SeatActionResponseDto>("/api/v1/seats/reserve", request);
  }

  // 좌석 예측 정보 조회
  async getSeatPrediction(roomNo: string, seatNo: string): Promise<SeatPredictionDto | null> {
    try {
      return await apiClient.get<SeatPredictionDto>(`/api/v1/seats/${roomNo}/${seatNo}/prediction`);
    } catch (error) {
      console.warn("좌석 예측 조회 실패:", error);
      return null;
    }
  }
}

export const seatFinderApi = new SeatFinderApi();
