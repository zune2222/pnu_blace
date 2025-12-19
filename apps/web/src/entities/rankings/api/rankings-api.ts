import { apiClient } from "@/shared/lib/api";
import {
  AllTimeRankingsData,
  WeeklyRankingsData,
  MyRankInfo,
  RankingPrivacySettings,
} from "../model/types";

class RankingsApi {
  // 전체 랭킹 조회 (공개 API)
  async getAllTimeRankings(page: number = 1, limit: number = 20): Promise<AllTimeRankingsData | null> {
    try {
      return await apiClient.publicGet<AllTimeRankingsData>(
        `/api/v1/stats/rankings/all-time?page=${page}&limit=${limit}`
      );
    } catch (error) {
      console.warn("전체 랭킹 조회 실패:", error);
      return null;
    }
  }

  // 주간 랭킹 조회 (공개 API)
  async getWeeklyRankings(page: number = 1, limit: number = 20): Promise<WeeklyRankingsData | null> {
    try {
      return await apiClient.publicGet<WeeklyRankingsData>(
        `/api/v1/stats/rankings/weekly?page=${page}&limit=${limit}`
      );
    } catch (error) {
      console.warn("주간 랭킹 조회 실패:", error);
      return null;
    }
  }

  // 내 랭킹 정보 조회
  async getMyRank(): Promise<MyRankInfo | null> {
    try {
      return await apiClient.get<MyRankInfo>("/api/v1/stats/my-rank");
    } catch (error) {
      console.warn("내 랭킹 조회 실패:", error);
      return null;
    }
  }

  // 프라이버시 설정 조회
  async getPrivacySettings(): Promise<RankingPrivacySettings | null> {
    try {
      return await apiClient.get<RankingPrivacySettings>("/api/v1/stats/privacy-settings");
    } catch (error) {
      console.warn("프라이버시 설정 조회 실패:", error);
      return null;
    }
  }

  // 닉네임 저장
  async saveNickname(nickname: string): Promise<void> {
    await apiClient.post("/api/v1/stats/privacy-settings", {
      publicNickname: nickname.trim(),
    });
  }

  // 랜덤 닉네임 생성
  async generateRandomNickname(): Promise<string | null> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        nickname?: string;
      }>("/api/v1/stats/privacy-settings", {});
      return response.nickname || null;
    } catch (error) {
      console.warn("랜덤 닉네임 생성 실패:", error);
      return null;
    }
  }
}

export const rankingsApi = new RankingsApi();
