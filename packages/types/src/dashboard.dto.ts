/**
 * 대시보드 관련 타입 정의
 */

export interface CurrentSeatWidgetProps {
  currentSeat: any | null;
  isLoading: boolean;
  error: string | null;
  cancelReservation: () => Promise<void>;
  extendReservation: () => Promise<void>;
  isExtending: boolean;
  isCancelling: boolean;
}