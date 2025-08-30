"use client";
import React from "react";
import { AuthGuard } from "@/features/auth";
import { CurrentSeatWidget, FavoriteRoomsSection, QuickInsightsSection } from "./ui";
import { QueueStatusWidget } from "./ui/queue-status-widget";
import { useDashboardData } from "./model";

export const DashboardPage: React.FC = () => {
  const dashboardState = useDashboardData();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6">
          {/* 메인 좌석 섹션 - 전체 너비 */}
          <div className="border-b border-border/20">
            <CurrentSeatWidget {...dashboardState} />
          </div>
          
          {/* 대기열 상태 위젯 */}
          <div className="py-8">
            <div className="max-w-md mx-auto">
              <QueueStatusWidget />
            </div>
          </div>
          
          {/* 하단 섹션들 - 그리드 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div className="border-r-0 lg:border-r border-border/20">
              <FavoriteRoomsSection {...dashboardState} />
            </div>
            <div>
              <QuickInsightsSection {...dashboardState} onRefresh={dashboardState.refresh} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};