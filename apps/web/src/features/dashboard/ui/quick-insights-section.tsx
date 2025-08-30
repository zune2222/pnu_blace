"use client";
import React, { useState } from "react";
import { InsightItem } from "@/entities/dashboard";
import { dashboardApi } from "@/entities/dashboard/api";
import { toast } from "sonner";
import { X } from "lucide-react";

type InsightType = "prediction" | "tip" | "statistic" | "usage" | "recommendation";
type QuickInsights = {
  items: InsightItem[];
  lastUpdated: string;
};

// 인사이트 타입별 아이콘
const getInsightIcon = (type: InsightType) => {
  switch (type) {
    case 'prediction':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'tip':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'statistic':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'recommendation':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
  }
};

// 인사이트 타입별 배지 스타일
const getInsightBadgeStyle = (type: InsightType) => {
  switch (type) {
    case 'prediction':
      return "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400";
    case 'tip':
      return "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400";
    case 'statistic':
      return "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
    case 'recommendation':
      return "bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400";
  }
};

interface QuickInsightsSectionProps {
  quickInsights: QuickInsights | null;
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export const QuickInsightsSection: React.FC<QuickInsightsSectionProps> = ({
  quickInsights,
  isLoading,
  error,
  onRefresh
}) => {
  const insights = quickInsights?.items || [];
  const [isCancelling, setIsCancelling] = useState(false);

  // 대기열 요청 취소
  const handleCancelQueue = async () => {
    try {
      setIsCancelling(true);
      await dashboardApi.cancelQueueRequest();
      toast.success("빈자리 예약 대기열에서 취소되었습니다");
      onRefresh?.(); // 데이터 새로고침
    } catch (error: any) {
      toast.error("취소 요청에 실패했습니다: " + error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  // 우선순위별 정렬
  const sortedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

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

        {/* 로딩 및 에러 상태 */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg text-muted-foreground font-light">인사이트를 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-lg text-red-600 font-light">{error}</div>
          </div>
        ) : (
          /* 인사이트 목록 */
          <div className="space-y-6">
            {sortedInsights.map((insight) => (
              <div key={insight.id} className="py-6 border-b border-border/10 last:border-b-0">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-muted-foreground/70">
                          {getInsightIcon(insight.type)}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium tracking-wide ${getInsightBadgeStyle(insight.type)}`}>
                          {insight.type.toUpperCase()}
                        </span>
                        {insight.isNew && (
                          <span className="text-xs px-2 py-1 bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400 rounded-full font-medium tracking-wide">
                            NEW
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-light text-foreground">
                        {insight.title}
                      </h3>
                    </div>
                    {/* 대기열 인사이트에 대해서만 취소 버튼 표시 */}
                    {insight.id === 'queue-waiting' && (
                      <button
                        onClick={handleCancelQueue}
                        disabled={isCancelling}
                        className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        title="대기열 취소"
                      >
                        {isCancelling ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">취소</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <p className="text-base text-muted-foreground/80 font-light leading-relaxed pl-8">
                    {insight.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && insights.length === 0 && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-light text-foreground">
                인사이트가 없습니다
              </h3>
              <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
                새로운 정보가 업데이트되면 여기에 표시됩니다
              </p>
            </div>
          </div>
        )}

        {/* AI 설명 및 마지막 업데이트 시간 */}
        {!isLoading && !error && quickInsights && (
          <div className="pt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground/50 font-light">
              AI 분석 기반 예측 정보
            </p>
            <p className="text-xs text-muted-foreground/40 font-light">
              마지막 업데이트: {new Date(quickInsights.lastUpdated).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};