"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../api";
import { dashboardKeys } from "./queries";
import {
  ApiResponse,
  DashboardData,
  CurrentSeat,
  ReadingRoomInfo,
  InsightItem,
  SeatHistoryData,
  StreakHeatmapData,
  MyRankData,
  MyStatsData,
  SeatHistoryTableData,
} from "./types";

// 대시보드 전체 데이터 조회
export const useDashboardData = () => {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: async (): Promise<ApiResponse<DashboardData>> => {
      return await dashboardApi.getDashboardData();
    },
    staleTime: 1000 * 30, // 30초
    refetchInterval: 1000 * 60, // 1분마다 자동 새로고침
  });
};

// 현재 좌석 정보만 조회
export const useCurrentSeat = () => {
  return useQuery({
    queryKey: dashboardKeys.currentSeat(),
    queryFn: async (): Promise<CurrentSeat | null> => {
      return await dashboardApi.getCurrentSeat();
    },
    staleTime: 1000 * 30, // 30초
    refetchInterval: 1000 * 60, // 1분
  });
};

// 즐겨찾기 열람실 조회
export const useFavoriteRooms = () => {
  return useQuery({
    queryKey: dashboardKeys.favoriteRooms(),
    queryFn: async (): Promise<ReadingRoomInfo[]> => {
      return await dashboardApi.getFavoriteRooms();
    },
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 60 * 2, // 2분
  });
};

// 인사이트 조회
export const useInsights = () => {
  return useQuery({
    queryKey: dashboardKeys.insights(),
    queryFn: async (): Promise<InsightItem[]> => {
      return await dashboardApi.generateInsights();
    },
    staleTime: 1000 * 60 * 5, // 5분
    refetchInterval: 1000 * 60 * 10, // 10분
  });
};

// 좌석 내역 조회
export const useSeatHistory = () => {
  return useQuery({
    queryKey: dashboardKeys.seatHistory(),
    queryFn: async (): Promise<SeatHistoryData | null> => {
      return await dashboardApi.getSeatHistory();
    },
    staleTime: 1000 * 60 * 5, // 5분
    refetchInterval: 1000 * 60 * 10, // 10분
  });
};

// 스트릭 히트맵 조회
export const useStreakHeatmap = () => {
  return useQuery({
    queryKey: dashboardKeys.streakHeatmap(),
    queryFn: async (): Promise<StreakHeatmapData | null> => {
      return await dashboardApi.getStreakHeatmap();
    },
    staleTime: 1000 * 60 * 15, // 15분
    refetchInterval: 1000 * 60 * 30, // 30분
  });
};

// 내 랭킹 조회
export const useMyRank = () => {
  return useQuery({
    queryKey: dashboardKeys.myRank(),
    queryFn: async (): Promise<MyRankData | null> => {
      return await dashboardApi.getMyRank();
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 개인 통계 조회
export const usePersonalStats = () => {
  return useQuery({
    queryKey: dashboardKeys.myStats(),
    queryFn: async () => {
      return await dashboardApi.getPersonalStats();
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 좌석 이용 내역 테이블 조회 (페이지네이션)
export const useSeatHistoryTable = (
  page: number = 1,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: dashboardKeys.seatHistoryTable(page, startDate, endDate),
    queryFn: async (): Promise<SeatHistoryTableData | null> => {
      return await dashboardApi.getSeatHistoryTable(page, 10, startDate, endDate);
    },
    staleTime: 1000 * 60 * 5, // 5분
    placeholderData: (previousData) => previousData, // 페이지 전환 시 이전 데이터 유지 (v5 방식)
  });
};

// 좌석 예약 뮤테이션
export const useReserveSeat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomNo, seatNo }: { roomNo: string; seatNo: string }) =>
      dashboardApi.reserveSeat(roomNo, seatNo),
    onSuccess: () => {
      // 성공 시 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

// 좌석 반납 뮤테이션
export const useReturnSeat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dashboardApi.returnSeat(),
    onSuccess: () => {
      // 성공 시 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

// 좌석 연장 뮤테이션
export const useExtendSeat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dashboardApi.extendSeat(),
    onSuccess: () => {
      // 성공 시 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

// 즐겨찾기 토글 뮤테이션
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomNo,
      isFavorite,
    }: {
      roomNo: string;
      isFavorite: boolean;
    }) => dashboardApi.toggleFavorite(roomNo, isFavorite),
    onSuccess: () => {
      // 성공 시 즐겨찾기 데이터 무효화
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.favoriteRooms(),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.data() });
    },
  });
};
