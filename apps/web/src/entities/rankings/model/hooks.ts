"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rankingsApi } from "../api";
import { rankingsKeys } from "./queries";
import {
  AllTimeRankingsData,
  WeeklyRankingsData,
  MyRankInfo,
  RankingPrivacySettings,
} from "./types";

// 전체 랭킹 조회
export const useAllTimeRankings = (page: number = 1) => {
  return useQuery({
    queryKey: rankingsKeys.allTime(page),
    queryFn: async (): Promise<AllTimeRankingsData | null> => {
      return await rankingsApi.getAllTimeRankings(page);
    },
    staleTime: 1000 * 60 * 5, // 5분
    placeholderData: (previousData) => previousData,
  });
};

// 주간 랭킹 조회
export const useWeeklyRankings = (page: number = 1) => {
  return useQuery({
    queryKey: rankingsKeys.weekly(page),
    queryFn: async (): Promise<WeeklyRankingsData | null> => {
      return await rankingsApi.getWeeklyRankings(page);
    },
    staleTime: 1000 * 60 * 5, // 5분
    placeholderData: (previousData) => previousData,
  });
};

// 내 랭킹 조회
export const useMyRankInfo = () => {
  return useQuery({
    queryKey: rankingsKeys.myRank(),
    queryFn: async (): Promise<MyRankInfo | null> => {
      return await rankingsApi.getMyRank();
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 프라이버시 설정 조회
export const usePrivacySettings = () => {
  return useQuery({
    queryKey: rankingsKeys.privacySettings(),
    queryFn: async (): Promise<RankingPrivacySettings | null> => {
      return await rankingsApi.getPrivacySettings();
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 닉네임 저장 뮤테이션
export const useSaveNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: string) => rankingsApi.saveNickname(nickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rankingsKeys.privacySettings() });
      queryClient.invalidateQueries({ queryKey: rankingsKeys.myRank() });
    },
  });
};

// 랜덤 닉네임 생성 뮤테이션
export const useGenerateRandomNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rankingsApi.generateRandomNickname(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rankingsKeys.privacySettings() });
      queryClient.invalidateQueries({ queryKey: rankingsKeys.myRank() });
    },
  });
};
