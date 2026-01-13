"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import { SeatHistoryWidget, StudyContinuitySection, SeatHistoryTable } from "@/features/dashboard/ui";
import { useDashboardData } from "@/features/dashboard/model";
import { ShareStoryButton } from "@/features/share";

// 비로그인 시 로그인 유도 UI
const StatsLoginPrompt: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-extralight text-foreground">
              내 통계
            </h1>
            <p className="text-lg text-muted-foreground/70 font-light max-w-xl mx-auto">
              로그인하면 나의 도서관 이용 통계를 확인할 수 있어요.
            </p>

            {/* 미리보기 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
                <div className="text-2xl">🔥</div>
                <h3 className="text-lg font-light text-foreground">
                  스터디 스트릭
                </h3>
                <p className="text-sm text-muted-foreground/60 font-light">
                  연속으로 공부한 날을 확인하고 동기부여 받기
                </p>
              </div>
              <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
                <div className="text-2xl">📊</div>
                <h3 className="text-lg font-light text-foreground">
                  총 이용 시간
                </h3>
                <p className="text-sm text-muted-foreground/60 font-light">
                  도서관을 얼마나 이용했는지 한눈에 확인
                </p>
              </div>
              <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
                <div className="text-2xl">📅</div>
                <h3 className="text-lg font-light text-foreground">
                  이용 일수
                </h3>
                <p className="text-sm text-muted-foreground/60 font-light">
                  얼마나 꾸준히 도서관을 방문했는지
                </p>
              </div>
              <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
                <div className="text-2xl">🏠</div>
                <h3 className="text-lg font-light text-foreground">
                  자주 가는 열람실
                </h3>
                <p className="text-sm text-muted-foreground/60 font-light">
                  가장 많이 이용한 열람실 확인
                </p>
              </div>
              <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
                <div className="text-2xl">📈</div>
                <h3 className="text-lg font-light text-foreground">
                  이용 패턴
                </h3>
                <p className="text-sm text-muted-foreground/60 font-light">
                  시간대별, 요일별 이용 패턴 분석
                </p>
              </div>
              <div className="p-6 border border-border/20 rounded-lg text-left space-y-3">
                <div className="text-2xl">📊</div>
                <h3 className="text-lg font-light text-foreground">
                  활동 히트맵
                </h3>
                <p className="text-sm text-muted-foreground/60 font-light">
                  최근 30일간의 공부 활동을 시각적으로 확인
                </p>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/login"
                className="inline-block px-8 py-3 bg-foreground text-background rounded-lg font-light hover:bg-foreground/90 transition-colors"
              >
                로그인하고 통계 보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// 로그인된 사용자용 통계 페이지 컴포넌트
const AuthenticatedStatsPage: React.FC = () => {
  const dashboardState = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          {/* 헤더 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-extralight text-foreground">
                내 통계
              </h1>
              <ShareStoryButton cardVariant="stats" buttonVariant="text" />
            </div>
            <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              My Statistics
            </p>
          </div>

          <SeatHistoryWidget />
          <StudyContinuitySection
            streakStats={dashboardState.dashboardData?.streakStats || null}
            isLoading={dashboardState.isLoading}
            error={dashboardState.error}
          />
          <SeatHistoryTable />
        </div>
      </section>
    </div>
  );
};

export default function StatsPage() {
  const { isAuthenticated } = useAuth();

  // 비로그인 시 로그인 유도 UI
  if (!isAuthenticated) {
    return <StatsLoginPrompt />;
  }

  return <AuthenticatedStatsPage />;
}
