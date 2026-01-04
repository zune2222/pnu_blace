"use client";
import React from "react";
import { useMyRankInfo } from "@/entities/rankings";
import { SkeletonStats, EmptyState } from "@/shared/ui";
import Link from "next/link";

export const MyRankingCard: React.FC = () => {
  const { data: rankInfo, isLoading } = useMyRankInfo();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-light text-foreground">내 랭킹</h2>
        <SkeletonStats />
      </div>
    );
  }

  if (!rankInfo) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-light text-foreground">내 랭킹</h2>
        <EmptyState
          title="아직 통계 데이터가 없습니다"
          message="통계 페이지를 먼저 방문해서 데이터를 생성해주세요"
          action={
            <Link
              href="/stats"
              className="text-foreground hover:underline font-medium"
            >
              통계 페이지로 이동 →
            </Link>
          }
        />
      </div>
    );
  }

  const getTierDisplay = (tier: string) => {
    const tierIcons: Record<string, React.ReactElement> = {
      Explorer: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      ),
      Student: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
        </svg>
      ),
      Scholar: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      ),
      Master: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4V2c0-0.55-0.45-1-1-1S5 1.45 5 2v2C3.34 4.56 2.56 6.33 2.56 8.5S3.34 12.44 5 13v7c0 0.55 0.45 1 1 1s1-0.45 1-1v-7c1.66-0.56 2.44-2.33 2.44-4.5S8.66 4.56 7 4zm5-2v2c0 0.55 0.45 1 1 1s1-0.45 1-1V2c1.66 0.56 2.44 2.33 2.44 4.5S16.66 10.44 15 11v9c0 0.55 0.45 1 1 1s1-0.45 1-1v-9c1.66-0.56 2.44-2.33 2.44-4.5S18.66 2.56 17 2c0-0.55-0.45-1-1-1s-1 0.45-1 1z"/>
        </svg>
      ),
      Legend: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.4L12 8l-3.1 2L6.8 8.6L7.7 14z"/>
        </svg>
      ),
      Myth: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
        </svg>
      ),
    };
    
    return (
      <span className="flex items-center">
        {tierIcons[tier] || tierIcons.Student}
        {tier}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-light text-foreground">내 랭킹</h2>
      
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        {/* 이용시간 랭킹 */}
        <div className="text-center space-y-2 md:space-y-4">
          <div className="space-y-1 md:space-y-2">
            <p className="text-[10px] md:text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              Usage Hours
            </p>
            <div className="font-mono text-2xl md:text-3xl font-extralight text-foreground">
              #{rankInfo.hoursRank || "—"}
            </div>
            {rankInfo.hoursPercentile != null && (
              <p className="text-[10px] md:text-sm text-muted-foreground/60 font-light">
                상위 {Math.max(0, 100 - rankInfo.hoursPercentile)}%
              </p>
            )}
          </div>
        </div>

        {/* 방문횟수 랭킹 */}
        <div className="text-center space-y-2 md:space-y-4">
          <div className="space-y-1 md:space-y-2">
            <p className="text-[10px] md:text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              Visits
            </p>
            <div className="font-mono text-2xl md:text-3xl font-extralight text-foreground">
              #{rankInfo.sessionsRank || "—"}
            </div>
            {rankInfo.sessionsPercentile != null && (
              <p className="text-[10px] md:text-sm text-muted-foreground/60 font-light">
                상위 {Math.max(0, 100 - rankInfo.sessionsPercentile)}%
              </p>
            )}
          </div>
        </div>

        {/* 이용일수 랭킹 */}
        <div className="text-center space-y-2 md:space-y-4">
          <div className="space-y-1 md:space-y-2">
            <p className="text-[10px] md:text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              Days
            </p>
            <div className="font-mono text-2xl md:text-3xl font-extralight text-foreground">
              #{rankInfo.daysRank || "—"}
            </div>
            {rankInfo.daysPercentile != null && (
              <p className="text-[10px] md:text-sm text-muted-foreground/60 font-light">
                상위 {Math.max(0, 100 - rankInfo.daysPercentile)}%
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pt-8 border-t border-border/20 space-y-2">
        <p className="text-lg font-light text-foreground">
          {getTierDisplay(rankInfo.tier)}
        </p>
        <p className="text-sm text-muted-foreground/60 font-light">
          전체 {rankInfo.totalUsers}명 중
        </p>
      </div>
    </div>
  );
};