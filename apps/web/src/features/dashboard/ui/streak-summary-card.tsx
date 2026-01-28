"use client";
import React from "react";
import Link from "next/link";
import { StreakStats } from "@/entities/dashboard/model/types";
import { Emoji } from "@/shared/ui";

interface StreakSummaryCardProps {
  streakStats: StreakStats | null;
  isLoading: boolean;
  error?: string | null;
}

export const StreakSummaryCard: React.FC<StreakSummaryCardProps> = ({
  streakStats,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !streakStats) {
    return <ErrorState error={error} />;
  }

  const { currentStreak, longestStreak } = streakStats;

  return (
    <div className="bg-background border border-border/20 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-light text-foreground">
          스터디 스트릭
        </h3>
        <Link 
          href="/stats" 
          className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors font-light"
        >
          자세히 보기 →
        </Link>
      </div>

      <div className="flex items-center justify-between">
        {/* 현재 스트릭 */}
        <div className="flex items-center gap-4">
          <Emoji className="text-4xl">🔥</Emoji>
          <div>
            <div className="text-2xl font-mono font-extralight text-foreground">
              {currentStreak}
            </div>
            <p className="text-sm text-muted-foreground/60 font-light">
              일 스트릭
            </p>
          </div>
        </div>

        {/* 최고 기록 */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground/60 font-light uppercase mb-1">
            최고 스트릭
          </div>
          <div className="text-lg font-mono font-extralight text-foreground">
            {longestStreak}
          </div>
        </div>

        {/* 진행률 표시 */}
        {longestStreak > 0 && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground/60 font-light uppercase mb-1">
              달성률
            </div>
            <div className="text-lg font-mono font-extralight text-foreground">
              {Math.round((currentStreak / longestStreak) * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* 간단한 격려 메시지 */}
      <div className="text-center pt-2 border-t border-border/10">
        <p className="text-sm text-muted-foreground/60 font-light">
          {currentStreak === 0 
            ? "새로운 스트릭을 시작해보세요!" 
            : currentStreak === 1
            ? "좋은 시작이에요! 내일도 화이팅! 🚀"
            : currentStreak < 7
            ? `${currentStreak}일째 연속! 멋진 습관이에요 ✨`
            : currentStreak < 30
            ? `대단한 꾸준함이에요! ${currentStreak}일 달성 🎯`
            : `정말 놀라워요! ${currentStreak}일 연속 스트릭 🏆`
          }
        </p>
      </div>
    </div>
  );
};

// 로딩 스켈레톤
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-background border border-border/20 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-border/20 rounded animate-pulse w-24" />
        <div className="h-4 bg-border/20 rounded animate-pulse w-16" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-border/20 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-border/20 rounded animate-pulse w-8" />
            <div className="h-4 bg-border/20 rounded animate-pulse w-12" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="h-3 bg-border/20 rounded animate-pulse w-16" />
          <div className="h-5 bg-border/20 rounded animate-pulse w-8" />
        </div>
        <div className="text-center space-y-2">
          <div className="h-3 bg-border/20 rounded animate-pulse w-12" />
          <div className="h-5 bg-border/20 rounded animate-pulse w-10" />
        </div>
      </div>
      
      <div className="text-center pt-2 border-t border-border/10">
        <div className="h-4 bg-border/20 rounded animate-pulse w-48 mx-auto" />
      </div>
    </div>
  );
};

// 에러 상태
const ErrorState: React.FC<{ error?: string | null }> = ({ error }) => {
  return (
    <div className="bg-background border border-border/20 rounded-lg p-6">
      <div className="text-center space-y-3">
        <div className="text-2xl">😕</div>
        <h3 className="text-sm font-light text-foreground">
          스트릭 데이터를 불러올 수 없어요
        </h3>
        <p className="text-xs text-muted-foreground/60 font-light">
          {error || "잠시 후 다시 시도해주세요"}
        </p>
        <Link 
          href="/stats" 
          className="inline-block text-xs text-muted-foreground/60 hover:text-foreground transition-colors font-light"
        >
          통계 페이지로 이동 →
        </Link>
      </div>
    </div>
  );
};