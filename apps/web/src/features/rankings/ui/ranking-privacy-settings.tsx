"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface PrivacySettings {
  isPublicRanking: boolean;
  publicNickname?: string;
}

export const RankingPrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    isPublicRanking: false,
    publicNickname: undefined,
  });
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get<PrivacySettings>("/api/v1/stats/privacy-settings");
        setSettings(response);
        setNickname(response.publicNickname || "");
      } catch (error) {
        console.error("개인정보 설정 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const newSettings = {
        isPublicRanking: settings.isPublicRanking,
        publicNickname: settings.isPublicRanking ? nickname : undefined,
      };
      
      await apiClient.post("/api/v1/stats/privacy-settings", newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error("개인정보 설정 저장 실패:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-light text-foreground">랭킹 공개 설정</h2>
        <div className="animate-pulse">
          <div className="h-32 bg-muted-foreground/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-light text-foreground">랭킹 공개 설정</h2>
      
      <div className="space-y-6 border border-border/20 rounded-lg p-8">
        <div className="space-y-4">
          <label className="flex items-center space-x-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.isPublicRanking}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  isPublicRanking: e.target.checked 
                }))}
                className="peer sr-only"
              />
              <div
                className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ease-in-out
                  ${settings.isPublicRanking 
                    ? 'bg-foreground border-foreground shadow-lg shadow-foreground/25' 
                    : 'bg-background border-muted-foreground/50 group-hover:border-foreground/60 group-hover:bg-muted/20'
                  }
                  peer-focus:ring-2 peer-focus:ring-foreground/50 peer-focus:ring-offset-1`}
              >
                {settings.isPublicRanking && (
                  <svg 
                    className="w-3 h-3 text-background absolute inset-0 m-auto animate-in zoom-in duration-200" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-lg font-light text-foreground group-hover:text-foreground/80 transition-colors">
              공개 랭킹에 참여하기
            </span>
          </label>
          
          <p className="text-sm text-muted-foreground/60 font-light ml-9">
            체크하면 다른 사용자들이 볼 수 있는 랭킹에 참여합니다.
          </p>
        </div>

        {settings.isPublicRanking && (
          <div className="space-y-4 pt-4 border-t border-border/20">
            <label className="block space-y-2">
              <span className="text-base font-light text-foreground">
                공개 닉네임
              </span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="랭킹에 표시될 닉네임을 입력하세요"
                className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg text-foreground font-light placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
                maxLength={20}
              />
            </label>
            <p className="text-sm text-muted-foreground/60 font-light">
              다른 사용자들에게 표시될 닉네임입니다. (최대 20자)
            </p>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving || (settings.isPublicRanking && !nickname.trim())}
            className="px-8 py-3 bg-foreground text-background font-light rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </div>
    </div>
  );
};