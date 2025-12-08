"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteApi } from "../api/favorite-api";
import { ReadingRoomInfo } from "@/entities/dashboard";

// 쿼리 키 정의
export const favoriteKeys = {
  all: ["favorites"] as const,
  favoriteRooms: () => [...favoriteKeys.all, "rooms"] as const,
  isFavorite: (roomNo: string) =>
    [...favoriteKeys.all, "isFavorite", roomNo] as const,
};

/**
 * 즐겨찾기 열람실 목록 조회 훅
 */
export const useFavoriteRooms = () => {
  return useQuery({
    queryKey: favoriteKeys.favoriteRooms(),
    queryFn: async (): Promise<ReadingRoomInfo[]> => {
      return await favoriteApi.getFavoriteRooms();
    },
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 60 * 2, // 2분
  });
};

/**
 * 특정 열람실의 즐겨찾기 상태 확인 훅
 * @param roomNo 열람실 번호
 * @param enabled 쿼리 활성화 여부 (기본값: true)
 */
export const useIsFavorite = (roomNo: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: favoriteKeys.isFavorite(roomNo),
    queryFn: async () => await favoriteApi.isFavorite(roomNo),
    staleTime: 1000 * 60 * 5, // 5분
    enabled, // 비로그인 시 API 호출 방지
  });
};

/**
 * 즐겨찾기 토글 뮤테이션 훅
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomNo,
      isFavorite,
    }: {
      roomNo: string;
      isFavorite: boolean;
    }) => favoriteApi.toggleFavorite(roomNo, isFavorite),
    onSuccess: (_, variables) => {
      // 성공 시 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.favoriteRooms(),
      });
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.isFavorite(variables.roomNo),
      });
    },
    onError: (error) => {
      console.error("즐겨찾기 토글 실패:", error);
    },
  });
};
