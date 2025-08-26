// 실제 백엔드 API와 매칭되는 타입 정의
import {
  MySeatDto,
  SeatStatusDto,
  MyUsageStatsDto,
  SeatPredictionDto,
} from "@pnu-blace/types";

// 좌석 상태 (백엔드와 동일)
export type SeatStatus = "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";

// 현재 내 좌석 (백엔드 API 기반)
export interface CurrentSeat extends MySeatDto {
  roomName?: string; // 열람실 이름 (별도 매핑 필요)
  seatDisplayName?: string; // 좌석 표시명 (seatNo 기반)
  remainingMinutes?: number; // 남은 시간 (분)
}

// 열람실 정보 (좌석 상태 조회용)
export interface ReadingRoomInfo {
  roomNo: string;
  roomName: string;
  location: string;
  seats: SeatStatusDto[];
  totalSeats: number;
  availableSeats: number;
  occupancyRate: number;
  operatingHours: {
    open: string; // HH:mm format
    close: string; // HH:mm format
  };
  isOpen: boolean;
  isFavorite?: boolean;
}

// 대시보드 인사이트 아이템
export interface InsightItem {
  id: string;
  type: "prediction" | "tip" | "statistic" | "usage";
  title: string;
  content: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
  isNew?: boolean;
}

// 대시보드 데이터 (조합)
export interface DashboardData {
  currentSeat: CurrentSeat | null;
  favoriteRooms: ReadingRoomInfo[];
  personalStats: MyUsageStatsDto | null;
  insights: InsightItem[];
  lastUpdated: string;
}

// API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 열람실 목록 (즐겨찾기 포함)
export const READING_ROOMS: Record<
  string,
  {
    name: string;
    location: string;
    operatingHours: { open: string; close: string };
  }
> = {
  A101: {
    name: "1F 제1열람실",
    location: "중앙도서관 1층",
    operatingHours: { open: "06:00", close: "24:00" },
  },
  A201: {
    name: "2F 제2열람실-A",
    location: "중앙도서관 2층",
    operatingHours: { open: "06:00", close: "24:00" },
  },
  A202: {
    name: "2F 새벽별당-A",
    location: "중앙도서관 2층",
    operatingHours: { open: "06:00", close: "24:00" },
  },
  A301: {
    name: "3F 제3열람실-A",
    location: "중앙도서관 3층",
    operatingHours: { open: "06:00", close: "22:00" },
  },
  A401: {
    name: "4F 제4열람실-A",
    location: "중앙도서관 4층",
    operatingHours: { open: "06:00", close: "22:00" },
  },
};
