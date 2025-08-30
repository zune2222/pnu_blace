"use client";
import {
  useDashboardData as useRQDashboardData,
  useReturnSeat,
  useExtendSeat,
} from "@/entities/dashboard";
import { useFavoriteRooms, useToggleFavorite } from "@/entities/favorite";

export const useDashboardData = () => {
  const {
    data: dashboardResponse,
    isLoading,
    error,
    refetch,
  } = useRQDashboardData();

  // 새로운 즐겨찾기 서비스 사용
  const {
    data: favoriteRoomsData,
    isLoading: isFavoriteRoomsLoading,
    error: favoriteRoomsError,
  } = useFavoriteRooms();

  const returnSeatMutation = useReturnSeat();
  const extendSeatMutation = useExtendSeat();
  const toggleFavoriteMutation = useToggleFavorite();

  const dashboardData = dashboardResponse?.data;

  // 좌석 반납
  const cancelReservation = async () => {
    await returnSeatMutation.mutateAsync();
  };

  // 좌석 연장
  const extendReservation = async () => {
    await extendSeatMutation.mutateAsync();
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (roomNo: string, isFavorite: boolean) => {
    await toggleFavoriteMutation.mutateAsync({ roomNo, isFavorite });
  };

  // 에러 메시지 처리
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "대시보드 데이터를 불러올 수 없습니다"
        : null;

  return {
    // 데이터 (새로운 구조에 맞춰서)
    dashboardData,
    currentSeat: dashboardData?.currentSeat || null,
    // 새로운 즐겨찾기 서비스에서 데이터 가져오기
    favoriteRooms: favoriteRoomsData || [],
    quickInsights: dashboardData?.insights
      ? {
          items: dashboardData.insights,
          lastUpdated: dashboardData.lastUpdated,
        }
      : null,

    // 상태
    isLoading: isLoading || isFavoriteRoomsLoading,
    error:
      errorMessage ||
      (favoriteRoomsError instanceof Error ? favoriteRoomsError.message : null),
    lastUpdated: dashboardResponse?.timestamp
      ? new Date(dashboardResponse.timestamp)
      : null,

    // 액션
    refresh: () => refetch(),
    cancelReservation, // 실제로는 returnSeat
    extendReservation, // 매개변수 무시하고 백엔드 자동 연장
    toggleFavorite, // roomNo 기반으로 변경

    // 뮤테이션 상태
    isCancelling: returnSeatMutation.isPending,
    isExtending: extendSeatMutation.isPending,
    isTogglingFavorite: toggleFavoriteMutation.isPending,

    // 유틸리티
    isDataStale: false, // React Query가 관리
  };
};
