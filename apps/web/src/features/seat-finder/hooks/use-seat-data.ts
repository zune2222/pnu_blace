"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SeatDetailDto } from "@pnu-blace/types";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/entities/auth";
import { logger } from "@/shared/lib/logger";

/**
 * 좌석 상세 데이터를 가져오는 훅
 * @param roomNo 열람실 번호
 */
export function useSeatData(roomNo: string) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["seatDetail", roomNo],
    queryFn: async () => {
      const data = await apiClient.get<SeatDetailDto>(
        `/api/v1/seats/${roomNo}/detail`
      );
      return data;
    },
    enabled: !!roomNo && isAuthenticated,
    staleTime: 30 * 1000, // 30초
    retry: 1,
    meta: {
      onError: (error: unknown) => {
        logger.error("Error fetching seat data:", error);
      },
    },
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["seatDetail", roomNo] });
  };

  return {
    seatData: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error instanceof Error ? query.error.message : "좌석 정보를 불러오는데 실패했습니다.") : null,
    refetch,
  };
}
