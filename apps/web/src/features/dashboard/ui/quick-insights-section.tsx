"use client";
import React from "react";

interface InsightData {
  type: "tip" | "stat" | "prediction";
  title: string;
  content: string;
  icon: React.ReactNode;
}

export const QuickInsightsSection: React.FC = () => {
  // TODO: 실제 데이터는 API나 상태 관리에서 가져와야 함
  const insights: InsightData[] = [
    {
      type: "prediction",
      title: "지금 가장 한산한 열람실",
      content: "4F 제3열람실-A (40% 사용중)",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      type: "tip",
      title: "시험 기간 꿀팁",
      content: "새벽별당 창가 자리가 가장 먼저 차요!",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      type: "stat",
      title: "오늘의 인기 시간대",
      content: "오후 2-4시가 가장 붐벼요",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

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

        {/* 인사이트 목록 */}
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div key={index} className="py-6 border-b border-border/10 last:border-b-0">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground/70">
                        {insight.icon}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium tracking-wide ${
                        insight.type === "prediction" 
                          ? "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400" 
                          : insight.type === "tip"
                            ? "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
                            : "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                      }`}>
                        {insight.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-light text-foreground">
                      {insight.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-base text-muted-foreground/80 font-light leading-relaxed pl-8">
                  {insight.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* AI 설명 */}
        <div className="pt-6">
          <p className="text-sm text-muted-foreground/50 font-light">
            AI 분석 기반 예측 정보
          </p>
        </div>
      </div>
    </section>
  );
};