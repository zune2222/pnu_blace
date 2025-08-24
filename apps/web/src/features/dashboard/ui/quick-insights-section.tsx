"use client";
import React from "react";

interface InsightData {
  type: "tip" | "stat" | "prediction";
  title: string;
  content: string;
  icon: string;
  color: string;
}

export const QuickInsightsSection: React.FC = () => {
  // TODO: 실제 데이터는 API나 상태 관리에서 가져와야 함
  const insights: InsightData[] = [
    {
      type: "prediction",
      title: "지금 가장 한산한 열람실",
      content: "4F 제3열람실-A (40% 사용중)",
      icon: "📊",
      color: "bg-blue-50 border-blue-200"
    },
    {
      type: "tip",
      title: "시험 기간 꿀팁",
      content: "새벽별당 창가 자리가 가장 먼저 차요!",
      icon: "💡",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      type: "stat",
      title: "오늘의 인기 시간대",
      content: "오후 2-4시가 가장 붐벼요",
      icon: "⏰",
      color: "bg-green-50 border-green-200"
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">빠른 예측 & 꿀팁</h2>
        <span className="text-sm text-muted-foreground">실시간 업데이트</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${insight.color} transition-all hover:shadow-sm cursor-pointer`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed border-border">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm">
            AI가 분석한 실시간 인사이트를 제공합니다
          </span>
        </div>
      </div>
    </div>
  );
};