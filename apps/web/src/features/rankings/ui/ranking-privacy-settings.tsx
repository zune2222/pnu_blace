"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  usePrivacySettings, 
  useSaveNickname, 
  useGenerateRandomNickname 
} from "@/entities/rankings";

export const RankingPrivacySettings: React.FC = () => {
  const [nickname, setNickname] = useState("");
  const [originalNickname, setOriginalNickname] = useState("");
  
  const { data: settings, isLoading } = usePrivacySettings();
  const saveNicknameMutation = useSaveNickname();
  const generateRandomMutation = useGenerateRandomNickname();

  // 설정 로드 시 닉네임 초기화
  useEffect(() => {
    if (settings?.publicNickname) {
      setNickname(settings.publicNickname);
      setOriginalNickname(settings.publicNickname);
    }
  }, [settings]);

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    try {
      await saveNicknameMutation.mutateAsync(nickname);
      setOriginalNickname(nickname.trim());
      toast.success("닉네임이 변경되었습니다.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '닉네임 저장에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  const handleGenerateRandom = async () => {
    try {
      const newNickname = await generateRandomMutation.mutateAsync();
      if (newNickname) {
        setNickname(newNickname);
        setOriginalNickname(newNickname);
        toast.success("새로운 랜덤 닉네임이 생성되었습니다.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '랜덤 닉네임 생성에 실패했습니다.';
      toast.error(errorMessage);
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
              disabled={generateRandomMutation.isPending}
              className="px-4 py-3 border border-border/40 text-muted-foreground/70 font-light rounded-lg hover:bg-muted/20 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors break-keep sm:min-w-fit"
              title="랜덤 닉네임 생성"
            >
              {generateRandomMutation.isPending ? "생성 중..." : "🎲 랜덤"}
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
              disabled={saveNicknameMutation.isPending || !nickname.trim()}
              className="px-8 py-3 bg-foreground text-background font-light rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saveNicknameMutation.isPending ? "저장 중..." : "닉네임 저장"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
