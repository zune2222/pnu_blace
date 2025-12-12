"use client";
import React from "react";

// TODO: 인사이트 기능 재활성화 시 복원 필요
// - InsightItem, dashboardApi, toast imports
// - InsightType, QuickInsights types
// - getInsightIcon, getInsightBadgeStyle functions

interface QuickInsightsSectionProps {
  // 향후 인사이트 기능 재활성화 시 사용될 props
  quickInsights?: { items: unknown[]; lastUpdated: string } | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const QuickInsightsSection: React.FC<QuickInsightsSectionProps> = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="space-y-12">
        {/* 섹션 헤더 */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            실시간 인사이트
          </h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Live Insights
          </p>
        </div>

        {/* TODO: 인사이트 기능 재활성화 시 복원 필요 */}
        <div className="text-center py-8">
          <p className="text-muted-foreground/50 font-light">
            인사이트 기능 준비 중...
          </p>
        </div>
      </div>
    </section>
  );
};
