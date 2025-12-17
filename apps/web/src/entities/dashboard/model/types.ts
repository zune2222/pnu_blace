// 실제 백엔드 API와 매칭되는 타입 정의
import {
  MySeatDto,
  SeatStatusDto,
  MyUsageStatsDto,
} from "@pnu-blace/types";

// 좌석 상태 (백엔드와 동일)
export type SeatStatus = "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";

// 현재 내 좌석 (백엔드 API 기반)
export interface CurrentSeat extends MySeatDto {
  roomName?: string; // 열람실 이름 (별도 매핑 필요)
  seatDisplayName?: string; // 좌석 표시명 (seatNo 기반)
  remainingMinutes?: number; // 남은 시간 (분)
  isActive?: boolean; // 좌석 활성 상태
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

// 연속성 통계
export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: string;
  lastStudyDate?: string;
}

// 대시보드 데이터 (조합)
export interface DashboardData {
  currentSeat: CurrentSeat | null;
  favoriteRooms: ReadingRoomInfo[];
  personalStats: MyUsageStatsDto | null;
  streakStats: StreakStats | null;
  insights: InsightItem[];
  lastUpdated: string;
}

export interface StreakHeatmapData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  streakHistory: Array<{
    date: string;
    hasActivity: boolean;
    usageHours: number;
    level: number;
  }>;
}

export interface MyStatsData {
  totalUsageHours: number;
  totalSessions: number;
  averageSessionHours: number;
  mostUsedRoom: string;
  mostUsedRoomName: string;
  thisWeekHours: number;
  thisMonthHours: number;
  favoriteTimeSlots: Array<{
    hour: number;
    count: number;
    totalHours: number;
  }>;
  tier: string;
}

export interface MyRankData {
  studentId: string;
  totalUsageHours: number;
  totalSessions: number;
  totalDays: number;
  averageSessionHours: number;
  favoriteRoomName?: string;
  favoriteRoomVisits: number;
  favoriteRoomHours: number;
  weeklyUsageHours: number;
  weeklySessions: number;
  weeklyDays: number;
  weekStartDate?: string;
  tier: string;
  isPublicRanking: boolean;
  publicNickname?: string;
  createdAt: string;
  updatedAt: string;
  lastDataSyncAt?: string;
  totalUsers: number;
  hoursRank: number;
  sessionsRank: number;
  daysRank: number;
  hoursPercentile?: number;
  sessionsPercentile?: number;
  daysPercentile?: number;
}

export interface SeatHistoryData {
  totalSessions: number;
  totalUsageHours: number;
  totalDays: number;
  averageSessionHours: number;
  favoriteRoom: {
    name: string;
    count: number;
    totalHours: number;
  } | null;
}

export interface SeatActivity {
  id: string;
  date: string;
  roomName: string;
  seatNo: string;
  startTime: string;
  endTime: string;
  duration: string;
  usageHours: number;
}

export interface SeatHistoryTableData {
  activities: SeatActivity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
