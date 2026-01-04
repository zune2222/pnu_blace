"use client";
import React from "react";
import { useSeatHistory } from "@/entities/dashboard";
import { SkeletonStats, ErrorState } from "@/shared/ui";

export const SeatHistoryWidget: React.FC = () => {
  const { data, isLoading, error } = useSeatHistory();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonStats />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        message="데이터를 불러올 수 없습니다"
        variant="card"
      />
    );
  }

  return (
    <div className="space-y-12 md:space-y-24">
      {/* 헤더 섹션 */}
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-extralight text-foreground leading-tight mb-3 md:mb-4">
            내 도서관 이용 통계
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/70 font-light">
            지금까지의 도서관 이용 현황을 한눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* 주요 지표 - 모바일에서 2열 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
        <div className="text-center space-y-2 md:space-y-3">
          <div className="font-mono text-3xl md:text-5xl font-extralight text-foreground">
            {data.totalUsageHours}h
          </div>
          <p className="text-xs md:text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Total Hours
          </p>
        </div>
        <div className="text-center space-y-2 md:space-y-3">
          <div className="font-mono text-3xl md:text-5xl font-extralight text-foreground">
            {data.totalSessions}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Visits
          </p>
        </div>
        <div className="text-center space-y-2 md:space-y-3">
          <div className="font-mono text-3xl md:text-5xl font-extralight text-foreground">
            {data.totalDays}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Days
          </p>
        </div>
        <div className="text-center space-y-2 md:space-y-3">
          <div className="font-mono text-3xl md:text-5xl font-extralight text-foreground">
            {data.averageSessionHours.toFixed(1)}h
          </div>
          <p className="text-xs md:text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Average
          </p>
        </div>
      </div>
    </div>
  );
};
