"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ReserveSeatRequestDto, SeatActionResponseDto } from "@pnu-blace/types";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logger";
import { getSeatReservationErrorMessage, isExpectedApiError } from "@/shared/lib/error-utils";

interface UseSeatReservationOptions {
  roomNo: string;
  onSuccess?: () => void;
}

/**
 * 좌석 예약 처리를 위한 훅
 */
export function useSeatReservation({ roomNo, onSuccess }: UseSeatReservationOptions) {
  const [isReserving, setIsReserving] = useState(false);
  const queryClient = useQueryClient();

  const reserveSeat = async (seatNo: string, autoExtensionEnabled?: boolean) => {
    try {
      setIsReserving(true);

      const reserveRequest: ReserveSeatRequestDto = {
        roomNo,
        seatNo,
        autoExtensionEnabled,
      };

      const response = await apiClient.post<SeatActionResponseDto>(
        "/api/v1/seats/reserve",
        reserveRequest
      );

      if (response.success) {
        // 좌석 데이터 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["seatDetail", roomNo] });

        // 성공 메시지 표시
        if (response.requiresGateEntry) {
          toast.success("좌석이 성공적으로 발권되었습니다!", {
            description: "15분 이내에 출입게이트를 통과해주세요.",
            duration: 5000,
          });
        } else {
          toast.success(response.message || "좌석이 성공적으로 발권되었습니다!");
        }

        onSuccess?.();
      }
    } catch (err: unknown) {
      const errorMessage = getSeatReservationErrorMessage(err);

      if (!isExpectedApiError(err)) {
        logger.error("Unexpected reservation error:", err);
      }

      toast.error("좌석 발권 실패", {
        description: errorMessage,
        duration: 4000,
      });
      throw err;
    } finally {
      setIsReserving(false);
    }
  };

  return {
    reserveSeat,
    isReserving,
  };
}
