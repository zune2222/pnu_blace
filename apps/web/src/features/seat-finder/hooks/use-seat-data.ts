"use client";

import { useSeatDetail, seatFinderKeys } from "@/entities/seat-finder";
import { useQueryClient } from "@tanstack/react-query";

/**
 * 좌석 상세 데이터를 가져오는 훅
 * @param roomNo 열람실 번호
 */
export function useSeatData(roomNo: string) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useSeatDetail(roomNo);

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: seatFinderKeys.detail(roomNo) });
  };

  return {
    seatData: data ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "좌석 정보를 불러오는데 실패했습니다.") : null,
    refetch,
  };
}
