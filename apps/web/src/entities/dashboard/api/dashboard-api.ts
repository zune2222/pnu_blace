import { apiClient, ApiError } from "@/shared/lib/api";
import {
  DashboardData,
  CurrentSeat,
  ReadingRoomInfo,
  InsightItem,
  ApiResponse,
  READING_ROOMS,
} from "../model/types";
import {
  MySeatDto,
  SeatStatusDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
  ExtendSeatResponseDto,
} from "@pnu-blace/types";
import { StreakStats, SeatHistoryData, StreakHeatmapData, MyRankData, MyStatsData, SeatHistoryTableData } from "../model/types";

class DashboardApi {
  private favoriteRooms = ["A202", "A301", "A101"]; // 로컬 스토리지로 관리할 수 있음

  // 현재 내 좌석 조회
  async getCurrentSeat(): Promise<CurrentSeat | null> {
    try {
      const mySeat = await apiClient.get<MySeatDto | null>(
        "/api/v1/seats/my-seat"
      );

      // mySeat이 null이면 예약된 좌석이 없음
      if (!mySeat) {
        return null;
      }

      // 백엔드 데이터를 프론트엔드 형식으로 변환
      // 시간 문자열이 "HH:MM" 형식인 경우 오늘 날짜와 결합
      const today = new Date();
      const endTime = mySeat.endTime.includes(":")
        ? new Date(`${today.toDateString()} ${mySeat.endTime}`)
        : new Date(mySeat.endTime);
      const now = new Date();

      // 남은 시간 계산: remainingTime 문자열을 우선 사용, 없으면 endTime으로 계산
      let remainingMinutes = 0;

      if (mySeat.remainingTime && mySeat.remainingTime !== "") {
        // "0시간 01분 남음" 형식의 remainingTime을 분으로 변환
        const timeStr = mySeat.remainingTime;
        const hoursMatch = timeStr.match(/(\d+)시간/);
        const minutesMatch = timeStr.match(/(\d+)분/);

        const hours = hoursMatch ? parseInt(hoursMatch[1] || "0", 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1] || "0", 10) : 0;
        remainingMinutes = hours * 60 + minutes;
      } else if (mySeat.endTime) {
        // endTime으로 남은 시간 계산
        remainingMinutes = Math.max(
          0,
          Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60))
        );
      }

      return {
        roomNo: mySeat.roomNo,
        seatNo: mySeat.seatNo,
        startTime: mySeat.startTime,
        endTime: mySeat.endTime,
        remainingTime: mySeat.remainingTime,
        roomName: mySeat.roomName || `열람실 ${mySeat.roomNo}`,
        seatDisplayName: mySeat.seatDisplayName || `${mySeat.seatNo || "?"}번`,
        remainingMinutes,
        isActive: true,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null; // 예약된 좌석이 없음 (하위호환성)
      }
      throw new Error("현재 좌석 정보를 불러올 수 없습니다");
    }
  }

  // 즐겨찾기 열람실 목록 조회
  async getFavoriteRooms(): Promise<ReadingRoomInfo[]> {
    try {
      const favoriteRoomsData = await Promise.all(
        this.favoriteRooms.map(async (roomNo) => {
          try {
            const seats = await apiClient.get<SeatStatusDto[]>(
              `/api/v1/seats/${roomNo}`
            );
            const roomInfo = READING_ROOMS[roomNo];

            if (!roomInfo) {
              throw new Error(`Room info not found for ${roomNo}`);
            }

            const totalSeats = seats.length;
            const availableSeats = seats.filter(
              (seat) => seat.status === "AVAILABLE"
            ).length;
            const occupancyRate =
              totalSeats > 0
                ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100)
                : 0;

            // 운영시간 체크
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
            const isOpen =
              currentTime >= roomInfo.operatingHours.open &&
              currentTime <= roomInfo.operatingHours.close;

            return {
              roomNo,
              roomName: roomInfo.name,
              location: roomInfo.location,
              seats,
              totalSeats,
              availableSeats,
              occupancyRate,
              operatingHours: roomInfo.operatingHours,
              isOpen,
              isFavorite: true,
            };
          } catch (error) {
            console.warn(`Failed to fetch data for room ${roomNo}:`, error);
            // 에러가 발생한 방은 기본값으로 반환
            const roomInfo = READING_ROOMS[roomNo];
            return {
              roomNo,
              roomName: roomInfo?.name || `열람실 ${roomNo}`,
              location: roomInfo?.location || "위치 정보 없음",
              seats: [],
              totalSeats: 0,
              availableSeats: 0,
              occupancyRate: 0,
              operatingHours: roomInfo?.operatingHours || {
                open: "09:00",
                close: "18:00",
              },
              isOpen: false,
              isFavorite: true,
            };
          }
        })
      );

      return favoriteRoomsData;
    } catch {
      throw new Error("즐겨찾기 열람실 정보를 불러올 수 없습니다");
    }
  }

  // 개인 통계 조회
  async getPersonalStats(): Promise<MyStatsData | null> {
    try {
      return await apiClient.get<MyStatsData>("/api/v1/stats/me");
    } catch (error) {
      console.warn("개인 통계 조회 실패:", error);
      return null;
    }
  }

  // 내 랭킹 조회
  async getMyRank(): Promise<MyRankData | null> {
    try {
      return await apiClient.get<MyRankData>("/api/v1/stats/my-rank");
    } catch (error) {
      console.warn("내 랭킹 조회 실패:", error);
      return null;
    }
  }

  // 연속성 통계 조회
  async getStreakStats(): Promise<StreakStats | null> {
    try {
      return await apiClient.get<StreakStats>("/api/v1/stats/streak");
    } catch (error) {
      console.warn("연속성 통계 조회 실패:", error);
      return null;
    }
  }

  // 좌석 내역 조회
  async getSeatHistory(): Promise<SeatHistoryData | null> {
    try {
      return await apiClient.get<SeatHistoryData>("/api/v1/stats/seat-history");
    } catch (error) {
      console.warn("좌석 내역 조회 실패:", error);
      return null;
    }
  }

  // 스트릭 히트맵 조회
  async getStreakHeatmap(): Promise<StreakHeatmapData | null> {
    try {
      return await apiClient.get<StreakHeatmapData>(
        "/api/v1/stats/streak/heatmap"
      );
    } catch (error) {
      console.warn("스트릭 히트맵 조회 실패:", error);
      return null;
    }
  }

  // 좌석 이용 내역 테이블 조회 (페이지네이션)
  async getSeatHistoryTable(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<SeatHistoryTableData | null> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      return await apiClient.get<SeatHistoryTableData>(
        `/api/v1/stats/seat-history/full?${params.toString()}`
      );
    } catch (error) {
      console.warn("좌석 이용 내역 조회 실패:", error);
      return null;
    }
  }

  // 인사이트 생성 (통계 데이터 기반)
  async generateInsights(): Promise<InsightItem[]> {
    try {
      const insights: InsightItem[] = [];

      // 1. 현재 가장 여유로운 열람실 찾기
      const favoriteRooms = await this.getFavoriteRooms();
      const mostAvailableRoom = favoriteRooms
        .filter((room) => room.isOpen && room.occupancyRate < 80)
        .sort((a, b) => a.occupancyRate - b.occupancyRate)[0];

      if (mostAvailableRoom) {
        insights.push({
          id: "available-room",
          type: "prediction",
          title: "지금 가장 한산한 열람실",
          content: `${mostAvailableRoom.roomName}이 현재 ${mostAvailableRoom.occupancyRate}% 사용중으로 가장 여유롭습니다`,
          priority: "high",
          createdAt: new Date().toISOString(),
          isNew: true,
        });
      }

      // 2. 개인 통계 기반 인사이트
      try {
        const personalStats = await this.getPersonalStats();
        if (personalStats) {
          insights.push({
            id: "personal-usage",
            type: "usage",
            title: "나의 이용 패턴",
            content: `평균 ${personalStats.averageSessionHours.toFixed(1)}시간 이용하며, ${READING_ROOMS[personalStats.mostUsedRoom]?.name || personalStats.mostUsedRoomName}을 가장 선호합니다`,
            priority: "medium",
            createdAt: new Date().toISOString(),
          });

          if (
            personalStats.thisWeekHours >
            personalStats.averageSessionHours * 7
          ) {
            insights.push({
              id: "weekly-usage",
              type: "tip",
              title: "이번 주 열심히 공부하고 있어요!",
              content: `이번 주 ${personalStats.thisWeekHours}시간 이용으로 평균보다 더 많이 공부했습니다`,
              priority: "low",
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.warn("개인 통계 기반 인사이트 생성 실패:", error);
      }

      // 4. 일반적인 팁
      const currentHour = new Date().getHours();
      if (currentHour >= 13 && currentHour <= 15) {
        insights.push({
          id: "peak-time-tip",
          type: "tip",
          title: "지금은 피크 시간이에요",
          content:
            "오후 1-3시는 가장 붐비는 시간대입니다. 미리 좌석을 예약하세요!",
          priority: "medium",
          createdAt: new Date().toISOString(),
        });
      }

      return insights;
    } catch (error) {
      console.warn("인사이트 생성 실패:", error);
      return [];
    }
  }

  // 대시보드 전체 데이터 조회
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    try {
      const [currentSeat, favoriteRooms, personalStats, streakStats, insights] =
        await Promise.all([
          this.getCurrentSeat().catch(() => null),
          this.getFavoriteRooms().catch(() => []),
          this.getPersonalStats().catch(() => null),
          this.getStreakStats().catch(() => null),
          this.generateInsights().catch(() => []),
        ]);

      const data: DashboardData = {
        currentSeat,
        favoriteRooms,
        personalStats,
        streakStats,
        insights,
        lastUpdated: new Date().toISOString(),
      };

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new Error("대시보드 데이터를 불러올 수 없습니다");
    }
  }

  // 좌석 예약
  async reserveSeat(
    roomNo: string,
    seatNo: string,
    autoExtensionEnabled?: boolean
  ): Promise<SeatActionResponseDto> {
    try {
      const reserveRequest: ReserveSeatRequestDto = {
        roomNo,
        seatNo,
        autoExtensionEnabled,
      };
      return await apiClient.post<SeatActionResponseDto>(
        "/api/v1/seats/reserve",
        reserveRequest
      );
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            throw new Error("예약 정보가 올바르지 않습니다");
          case 409:
            throw new Error("이미 예약된 좌석입니다");
          default:
            throw new Error("좌석 예약에 실패했습니다");
        }
      }
      throw new Error("네트워크 연결을 확인해주세요");
    }
  }

  // 좌석 반납
  async returnSeat(): Promise<SeatActionResponseDto> {
    try {
      return await apiClient.post<SeatActionResponseDto>(
        "/api/v1/seats/return"
      );
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 404:
            throw new Error("반납할 좌석이 없습니다");
          default:
            throw new Error("좌석 반납에 실패했습니다");
        }
      }
      throw new Error("네트워크 연결을 확인해주세요");
    }
  }

  // 좌석 연장
  async extendSeat(): Promise<ExtendSeatResponseDto> {
    try {
      return await apiClient.post<ExtendSeatResponseDto>(
        "/api/v1/seats/extend"
      );
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 404:
            throw new Error("연장할 좌석이 없습니다");
          case 409:
            throw new Error("연장할 수 없는 상태입니다");
          default:
            throw new Error("좌석 연장에 실패했습니다");
        }
      }
      throw new Error("네트워크 연결을 확인해주세요");
    }
  }

  // 즐겨찾기 토글 (로컬 관리)
  async toggleFavorite(roomNo: string, isFavorite: boolean): Promise<void> {
    try {
      if (isFavorite) {
        // 즐겨찾기 추가
        if (!this.favoriteRooms.includes(roomNo)) {
          this.favoriteRooms.push(roomNo);
        }
      } else {
        // 즐겨찾기 제거
        this.favoriteRooms = this.favoriteRooms.filter(
          (room) => room !== roomNo
        );
      }
      // 실제로는 localStorage나 서버에 저장해야 함
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "favoriteRooms",
          JSON.stringify(this.favoriteRooms)
        );
      }
    } catch {
      throw new Error("즐겨찾기 설정에 실패했습니다");
    }
  }

  // 즐겨찾기 목록 로드 (로컬에서)
  loadFavoriteRooms(): void {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("favoriteRooms");
      if (saved) {
        try {
          this.favoriteRooms = JSON.parse(saved);
        } catch (error) {
          console.warn("즐겨찾기 목록 로드 실패:", error);
        }
      }
    }
  }
}

export const dashboardApi = new DashboardApi();

// 초기화 시 즐겨찾기 목록 로드
if (typeof window !== "undefined") {
  dashboardApi.loadFavoriteRooms();
}
