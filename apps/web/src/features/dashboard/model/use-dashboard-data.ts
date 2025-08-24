"use client";
import { 
  useDashboardData as useRQDashboardData,
  useReturnSeat,
  useExtendSeat,
  useToggleFavorite
} from "@/entities/dashboard";

export const useDashboardData = () => {
  const { 
    data: dashboardResponse, 
    isLoading, 
    error, 
    refetch 
  } = useRQDashboardData();

  const returnSeatMutation = useReturnSeat();
  const extendSeatMutation = useExtendSeat();
  const toggleFavoriteMutation = useToggleFavorite();

  const dashboardData = dashboardResponse?.data;

  // 좌석 반납 (기존 cancelReservation 대신)
  const cancelReservation = async (reservationId?: string) => {
    try {
      await returnSeatMutation.mutateAsync();
    } catch (err) {
      throw err;
    }
  };

  // 좌석 연장 (연장 시간 매개변수 없음 - 백엔드에서 자동 연장)
  const extendReservation = async (reservationId?: string, duration?: number) => {
    try {
      const result = await extendSeatMutation.mutateAsync();
      return result;
    } catch (err) {
      throw err;
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (roomNo: string, isFavorite: boolean) => {
    try {
      await toggleFavoriteMutation.mutateAsync({ roomNo, isFavorite });
    } catch (err) {
      throw err;
    }
  };

  // 에러 메시지 처리
  const errorMessage = error instanceof Error 
    ? error.message 
    : error 
      ? '대시보드 데이터를 불러올 수 없습니다' 
      : null;

  return {
    // 데이터 (새로운 구조에 맞춰서)
    dashboardData,
    currentSeat: dashboardData?.currentSeat || null,
    favoriteRooms: dashboardData?.favoriteRooms ? { 
      rooms: dashboardData.favoriteRooms, 
      lastUpdated: dashboardData.lastUpdated 
    } : null,
    quickInsights: dashboardData?.insights ? { 
      items: dashboardData.insights, 
      lastUpdated: dashboardData.lastUpdated 
    } : null,
    
    // 상태
    isLoading,
    error: errorMessage,
    lastUpdated: dashboardResponse?.timestamp ? new Date(dashboardResponse.timestamp) : null,
    
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