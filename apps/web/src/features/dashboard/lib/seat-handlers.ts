import { toast } from "sonner";
import type { SeatInfo, SeatHandlerFunction } from "./types";

export const createSeatCancelHandler = (
  currentSeat: SeatInfo | null,
  cancelReservationFn: SeatHandlerFunction
): SeatHandlerFunction => {
  return async () => {
    if (!currentSeat) return;

    try {
      await cancelReservationFn();
      toast.success("좌석이 성공적으로 반납되었습니다.", {
        description: `${currentSeat.roomName} ${currentSeat.seatDisplayName}`,
      });
    } catch (err) {
      console.error("예약 취소 실패:", err);
      const errorMessage =
        err instanceof Error ? err.message : "좌석 반납에 실패했습니다.";
      toast.error("좌석 반납 실패", {
        description: errorMessage,
      });
    }
  };
};

export const createSeatExtendHandler = (
  currentSeat: SeatInfo | null,
  extendReservationFn: SeatHandlerFunction
): SeatHandlerFunction => {
  return async () => {
    if (!currentSeat) return;

    try {
      await extendReservationFn();
      toast.success("좌석 이용시간이 연장되었습니다.", {
        description: "4시간이 추가로 연장되었습니다.",
      });
    } catch (err) {
      console.error("좌석 연장 실패:", err);
      const errorMessage =
        err instanceof Error ? err.message : "좌석 연장에 실패했습니다.";
      toast.error("좌석 연장 실패", {
        description: errorMessage,
      });
    }
  };
};