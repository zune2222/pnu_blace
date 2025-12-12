"use client";
import React from "react";
import { QueueStatusWidget } from "./queue-status-widget";

// TODO: 인사이트 기능 재활성화 시 복원 필요
// - InsightItem, dashboardApi, toast imports
// - InsightType, QuickInsights types
// - getInsightIcon, getInsightBadgeStyle functions
// - handleCancelQueue, sortedInsights logic

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

        {/* 대기열 상태 위젯 */}
        <QueueStatusWidget />
        {/* TODO: 인사이트 기능 재활성화 시 복원 필요 */}
      </div>
    </section>
  );
};
