"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import {
  CurrentSeatWidget,
  FavoriteRoomsSection,
  QuickInsightsSection,
} from "./ui";
import { useDashboardData } from "./model";

// 로그인 유도 UI 컴포넌트
const LoginPrompt: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-extralight text-foreground">
            대시보드
          </h1>
          <p className="text-lg text-muted-foreground/70 font-light max-w-xl mx-auto">
            로그인하면 현재 좌석 정보, 즐겨찾기 열람실, 빠른 통계 등을 한눈에
            확인할 수 있어요.
          </p>

          {/* 미리보기 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
              <div className="text-2xl">🪑</div>
              <h3 className="text-lg font-light text-foreground">현재 좌석</h3>
              <p className="text-sm text-muted-foreground/60 font-light">
                예약한 좌석 정보와 남은 시간을 실시간으로 확인
              </p>
            </div>
            <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
              <div className="text-2xl">⭐</div>
              <h3 className="text-lg font-light text-foreground">
                즐겨찾기 열람실
              </h3>
              <p className="text-sm text-muted-foreground/60 font-light">
                자주 가는 열람실의 현황을 빠르게 확인
              </p>
            </div>
            <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
              <div className="text-2xl">📊</div>
              <h3 className="text-lg font-light text-foreground">빠른 통계</h3>
              <p className="text-sm text-muted-foreground/60 font-light">
                이번 주 이용 시간과 방문 횟수
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-foreground text-background rounded-lg font-light hover:bg-foreground/90 transition-colors"
            >
              로그인하고 시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// 로그인된 사용자용 대시보드 콘텐츠 (훅 호출은 여기서만)
const AuthenticatedDashboard: React.FC = () => {
  const dashboardState = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* 메인 좌석 섹션 - 전체 너비 */}
        <div className="border-b border-border/20">
          <CurrentSeatWidget {...dashboardState} />
        </div>

        {/* 하단 섹션들 - 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="border-r-0 lg:border-r border-border/20">
            <FavoriteRoomsSection
              favoriteRooms={dashboardState.favoriteRooms}
              isLoading={dashboardState.isLoading}
              error={dashboardState.error}
              toggleFavorite={dashboardState.toggleFavorite}
            />
          </div>
          <div>
            <QuickInsightsSection
              {...dashboardState}
              onRefresh={dashboardState.refresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // 비로그인 시 로그인 유도 UI (API 호출 없음)
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  // 로그인 시에만 훅이 있는 컴포넌트 렌더링
  return <AuthenticatedDashboard />;
};
