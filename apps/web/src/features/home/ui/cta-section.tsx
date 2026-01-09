"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import { engagementEvents } from "@/shared/lib/analytics";

const bridgePoints = [
  {
    gap: "매일 얼마나 했는지 모름",
    solution: "자동으로 쌓이는 기록",
  },
  {
    gap: "혼자라서 지침",
    solution: "함께라서 지속",
  },
  {
    gap: "의지만으론 부족함",
    solution: "친구들과 선의의 경쟁",
  },
];

export const CtaSection: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const handleCtaClick = () => {
    engagementEvents.ctaClicked(
      isAuthenticated ? "start_dashboard" : "login",
      "cta_section"
    );
  };

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Bridge 컨셉 설명 */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm text-muted-foreground/50 font-mono tracking-widest uppercase mb-4">
            Bridge + Place
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight break-keep">
            기록하고, 함께하고, 성장하다
          </h2>
        </div>

        {/* Gap → Solution 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 md:mb-16">
          {bridgePoints.map((point, index) => (
            <div
              key={index}
              className="relative p-5 md:p-6 bg-muted/30 rounded-2xl border border-transparent hover:border-border transition-colors duration-300"
            >
              {/* Gap - 취소선 */}
              <p className="text-sm text-muted-foreground/50 font-light line-through decoration-muted-foreground/30 mb-3">
                {point.gap}
              </p>

              {/* 화살표 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-gradient-to-r from-muted-foreground/20 to-transparent"></div>
                <svg
                  className="w-4 h-4 text-muted-foreground/40 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>

              {/* Solution */}
              <p className="text-base md:text-lg text-foreground font-light">
                {point.solution}
              </p>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <div className="text-center">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            onClick={handleCtaClick}
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-background bg-foreground hover:bg-foreground/90 rounded-full transition-colors duration-200"
          >
            {isAuthenticated ? "대시보드로 이동" : "시작하기"}
          </Link>
        </div>
      </div>
    </section>
  );
};
