"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface PrivacySettings {
  isPublicRanking: boolean;
  publicNickname?: string;
}

export const RankingPrivacySettings: React.FC = () => {
  const [nickname, setNickname] = useState("");
  const [originalNickname, setOriginalNickname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get<PrivacySettings>(
          "/api/v1/stats/privacy-settings"
        );
        setNickname(response.publicNickname || "");
        setOriginalNickname(response.publicNickname || "");
      } catch (error) {
        console.error("닉네임 설정 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.post("/api/v1/stats/privacy-settings", {
        publicNickname: nickname.trim(),
      });
      setOriginalNickname(nickname.trim());
      toast.success("닉네임이 변경되었습니다.");
    } catch (error: any) {
      toast.error(error.message || "닉네임 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateRandom = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post<{
        success: boolean;
        nickname?: string;
      }>(
        "/api/v1/stats/privacy-settings",
        {} // 빈 객체 전송하면 랜덤 닉네임 생성
      );
      if (response.nickname) {
        setNickname(response.nickname);
        setOriginalNickname(response.nickname);
        toast.success("새로운 랜덤 닉네임이 생성되었습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "랜덤 닉네임 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-light text-foreground">내 닉네임</h2>
        <div className="animate-pulse">
          <div className="h-24 bg-muted-foreground/10 rounded"></div>
        </div>
      </div>
    );
  }

  const hasChanges = nickname.trim() !== originalNickname;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-light text-foreground">내 닉네임</h2>

      <div className="space-y-6 border border-border/20 rounded-lg p-8">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground/60 font-light break-keep">
            랭킹에 표시될 닉네임입니다. 모든 사용자는 자동으로 랭킹에
            참여합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="flex-1 px-4 py-3 bg-background border border-border/40 rounded-lg text-foreground font-light placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
              maxLength={20}
            />
            <button
              onClick={handleGenerateRandom}
              disabled={isGenerating}
              className="px-4 py-3 border border-border/40 text-muted-foreground/70 font-light rounded-lg hover:bg-muted/20 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors break-keep sm:min-w-fit"
              title="랜덤 닉네임 생성"
            >
              {isGenerating ? "생성 중..." : "🎲 랜덤"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground/50 font-light break-keep">
            최대 20자 • 다른 사용자와 중복 불가
          </p>
        </div>

        {hasChanges && (
          <div className="pt-4 border-t border-border/20">
            <button
              onClick={handleSaveNickname}
              disabled={isSaving || !nickname.trim()}
              className="px-8 py-3 bg-foreground text-background font-light rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "저장 중..." : "닉네임 저장"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
