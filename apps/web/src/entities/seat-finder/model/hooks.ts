"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SeatDetailDto, SeatPredictionDto, ReserveSeatRequestDto } from "@pnu-blace/types";
import { seatFinderApi } from "../api";
import { seatFinderKeys } from "./queries";
import { useAuth } from "@/entities/auth";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logger";
import { getSeatReservationErrorMessage, isExpectedApiError } from "@/shared/lib/error-utils";

// 좌석 상세 데이터 조회
export const useSeatDetail = (roomNo: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: seatFinderKeys.detail(roomNo),
    queryFn: async (): Promise<SeatDetailDto | null> => {
      return await seatFinderApi.getSeatDetail(roomNo);
    },
    enabled: !!roomNo && isAuthenticated,
    staleTime: 30 * 1000, // 30초
    retry: 1,
  });
};

// 좌석 예측 정보 조회
export const useSeatPrediction = (roomNo: string, seatNo: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: seatFinderKeys.prediction(roomNo, seatNo),
    queryFn: async (): Promise<SeatPredictionDto | null> => {
      return await seatFinderApi.getSeatPrediction(roomNo, seatNo);
    },
    enabled: enabled && !!roomNo && !!seatNo,
    staleTime: 60 * 1000, // 1분
  });
};

// 좌석 예약 뮤테이션
export const useReserveSeatMutation = (roomNo: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ seatNo, autoExtensionEnabled }: { seatNo: string; autoExtensionEnabled?: boolean }) => {
      const request: ReserveSeatRequestDto = {
        roomNo,
        seatNo,
        autoExtensionEnabled,
      };
      return await seatFinderApi.reserveSeat(request);
    },
    onSuccess: (response) => {
      // 좌석 데이터 캐시 무효화
      queryClient.invalidateQueries({ queryKey: seatFinderKeys.detail(roomNo) });

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
    },
    onError: (err: unknown) => {
      const errorMessage = getSeatReservationErrorMessage(err);

      if (!isExpectedApiError(err)) {
        logger.error("Unexpected reservation error:", err);
      }

      toast.error("좌석 발권 실패", {
        description: errorMessage,
        duration: 4000,
      });
    },
  });
};
