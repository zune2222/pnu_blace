"use client";
import React from "react";
import { StreakStats } from "@/entities/dashboard/model/types";
import { StreakHeatmap } from "./streak-heatmap";

interface StudyContinuitySectionProps {
  streakStats: StreakStats | null;
  isLoading: boolean;
  error?: string | null;
}

export const StudyContinuitySection: React.FC<StudyContinuitySectionProps> = ({
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

  const { currentStreak, longestStreak, streakStartDate } = streakStats;

  // 연속 출석일에 따른 격려 메시지
  const getEncouragementMessage = (streak: number) => {
    if (streak === 0) return "오늘부터 새로운 연속성을 시작해보세요!";
    if (streak === 1) return "좋은 시작이에요! 내일도 화이팅!";
    if (streak < 7) return "멋진 시작이에요! 꾸준히 이어가세요!";
    if (streak < 30) return "대단한 집중력이에요! 한 달까지 조금 더!";
    if (streak < 100) return "정말 대단해요! 백일까지 달려보세요!";
    return "완벽한 루틴이에요! 계속 유지하세요!";
  };

  // 연속성 달성도 (%)
  const getStreakProgress = (current: number, longest: number) => {
    if (longest === 0) return 0;
    return Math.min((current / longest) * 100, 100);
  };

  const progressPercentage = getStreakProgress(currentStreak, longestStreak);
  const encouragementMessage = getEncouragementMessage(currentStreak);

  // 연속성 시작일 포맷팅
  const formatStreakStartDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "오늘부터";
      if (diffDays === 1) return "어제부터";
      if (diffDays < 7) return `${diffDays}일 전부터`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전부터`;
      return `${Math.floor(diffDays / 30)}개월 전부터`;
    } catch {
      return null;
    }
  };

  const streakDuration = formatStreakStartDate(streakStartDate);

  return (
    <section className="py-16 md:py-20">
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            스터디 스트릭
          </h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Study Streak
          </p>
        </div>

        {/* 메트릭 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* 현재 스트릭 */}
          <div className="text-center space-y-4">
            <div className="text-5xl">🔥</div>
            <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              현재 스트릭
            </p>
            <div className="space-y-2">
              <div className="font-mono text-4xl md:text-5xl font-extralight text-foreground">
                {currentStreak}
              </div>
              <p className="text-sm text-muted-foreground/60 font-light">
                {currentStreak === 1 ? "일 스트릭" : "일 스트릭"}
              </p>
            </div>
          </div>

          {/* 최고 스트릭 */}
          <div className="text-center space-y-4">
            <div className="text-5xl">🏆</div>
            <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              최고 스트릭
            </p>
            <div className="space-y-2">
              <div className="font-mono text-4xl md:text-5xl font-extralight text-foreground">
                {longestStreak}
              </div>
              <p className="text-sm text-muted-foreground/60 font-light">
                일 스트릭 달성
              </p>
            </div>
          </div>

          {/* 스트릭 진행도 */}
          <div className="text-center space-y-4">
            <div className="text-5xl">⭐</div>
            <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              목표 달성도
            </p>
            <div className="space-y-2">
              <div className="font-mono text-4xl md:text-5xl font-extralight text-foreground">
                {Math.round(progressPercentage)}%
              </div>
              <p className="text-sm text-muted-foreground/60 font-light">
                최고 스트릭 대비
              </p>
            </div>
          </div>
        </div>

        {/* 스트릭 진행바와 메시지 */}
        <div className="border border-border/20 rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-light text-foreground">
                스트릭 진행상황
              </h3>
              {streakDuration && (
                <span className="text-sm text-muted-foreground/60 font-light">
                  {streakDuration} 지속
                </span>
              )}
            </div>
            
            {/* 진행바 */}
            {longestStreak > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-border/20 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground/60">
                  <span>0일</span>
                  <span>{longestStreak}일</span>
                </div>
              </div>
            )}
          </div>

          {/* 격려 메시지 */}
          <div className="text-center space-y-3">
            <p className="text-base text-foreground font-light leading-relaxed">
              {encouragementMessage}
            </p>
            {currentStreak > 0 && (
              <p className="text-sm text-muted-foreground/60 font-light">
                {currentStreak === 1 
                  ? "첫 걸음을 시작했어요!" 
                  : `${currentStreak}일 동안 꾸준히 해왔어요!`
                }
              </p>
            )}
          </div>

          {/* 히트맵 */}
          <div className="pt-4 border-t border-border/10">
            <StreakHeatmap
              currentStreak={currentStreak}
              lastStudyDate={streakStats.lastStudyDate}
            />
          </div>

          {/* 추가 통계 */}
          {longestStreak > currentStreak && currentStreak > 0 && (
            <div className="text-center pt-4 border-t border-border/10">
              <p className="text-sm text-muted-foreground/60 font-light">
                최고 스트릭까지 {longestStreak - currentStreak}일 남았어요!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// 로딩 스켈레톤
const LoadingSkeleton: React.FC = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-10 bg-border/20 rounded animate-pulse" />
          <div className="h-4 bg-border/20 rounded animate-pulse w-32" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-4">
              <div className="h-16 bg-border/20 rounded animate-pulse" />
              <div className="h-4 bg-border/20 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-12 bg-border/20 rounded animate-pulse" />
                <div className="h-4 bg-border/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="border border-border/20 rounded-lg p-6">
          <div className="h-6 bg-border/20 rounded animate-pulse mb-4" />
          <div className="h-2 bg-border/20 rounded animate-pulse mb-4" />
          <div className="h-16 bg-border/20 rounded animate-pulse" />
        </div>
      </div>
    </section>
  );
};

// 에러 상태
const ErrorState: React.FC<{ error?: string | null }> = ({ error }) => {
  return (
    <section className="py-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            스터디 스트릭
          </h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Study Streak
          </p>
        </div>

        <div className="border border-border/20 rounded-lg p-8 text-center space-y-4">
          <div className="text-4xl">😕</div>
          <h3 className="text-lg font-light text-foreground">
            스트릭 데이터를 불러올 수 없어요
          </h3>
          <p className="text-sm text-muted-foreground/60 font-light max-w-md mx-auto leading-relaxed">
            {error || "연결에 문제가 있거나 아직 스터디 기록이 없을 수 있어요. 잠시 후 다시 시도해주세요."}
          </p>
        </div>
      </div>
    </section>
  );
};