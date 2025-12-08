"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import { SeatHistoryWidget } from "@/features/dashboard/ui";

// 비로그인 시 로그인 유도 UI
const StatsLoginPrompt: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-extralight text-foreground">
              내 통계
            </h1>
            <p className="text-lg text-muted-foreground/70 font-light max-w-xl mx-auto">
              로그인하면 나의 도서관 이용 통계를 확인할 수 있어요.
            </p>

            {/* 미리보기 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
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

export default function StatsPage() {
  const { isAuthenticated } = useAuth();

  // 비로그인 시 로그인 유도 UI
  if (!isAuthenticated) {
    return <StatsLoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <SeatHistoryWidget />
        </div>
      </section>
    </div>
  );
}
