import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              <span className="text-primary">PNU Blace</span>
              <br />
              <span className="text-foreground">
                도서관 좌석 예약의 새로운 경험
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              부산대학교 도서관 좌석을 실시간으로 모니터링하고 자동으로
              예약해드립니다. 더 이상 좌석을 찾기 위해 시간을 낭비하지 마세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild>
                <Link href="/register">지금 시작하기</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/features">기능 알아보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 PNU Blace인가요?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              기존의 번거로운 좌석 예약 과정을 혁신적으로 개선했습니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">실시간 모니터링</h3>
              <p className="text-muted-foreground leading-relaxed">
                도서관 좌석 현황을 실시간으로 모니터링하여 빈 좌석을 즉시 확인할
                수 있습니다.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">자동 예약</h3>
              <p className="text-muted-foreground leading-relaxed">
                원하는 좌석이 비면 자동으로 예약해드려서 수동으로 확인할 필요가
                없습니다.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM10 7h10V5H10v2zM10 11h10V9H10v2zM10 15h10v-2H10v2zM10 19h10v-2H10v2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">스마트 알림</h3>
              <p className="text-muted-foreground leading-relaxed">
                예약 완료, 좌석 변경 등 중요한 정보를 실시간으로 알림받을 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-muted-foreground">활성 사용자</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                50,000+
              </div>
              <div className="text-muted-foreground">성공한 예약</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">서비스 가동률</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">실시간 모니터링</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            부산대학교 도서관 좌석 예약의 새로운 경험을 만나보세요. 간단한
            회원가입으로 모든 기능을 무료로 이용할 수 있습니다.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/register">무료로 시작하기</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
