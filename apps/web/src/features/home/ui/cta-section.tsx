"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import { engagementEvents } from "@/shared/lib/analytics";

const bridgePoints = [
  {
    gap: "복잡한 좌석 조회",
    solution: "한눈에 보는 실시간 현황",
  },
  {
    gap: "기록되지 않는 학습 시간",
    solution: "자동 누적되는 이용 통계",
  },
  {
    gap: "혼자만의 공부",
    solution: "함께하는 스터디 그룹",
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
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Bridge 컨셉 설명 */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-sm md:text-base text-muted-foreground/70 font-mono tracking-widest uppercase mb-6">
            Bridge + Place
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-8 break-keep">
            도서관과 당신 사이,
            <br />
            가장 빠른 다리
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed break-keep">
            기존 시스템이 채워주지 못했던 빈틈을 연결합니다.
            <br className="hidden md:block" />
            <span className="md:hidden"> </span>
            PNU BLACE는 더 나은 도서관 경험을 위한 가교입니다.
          </p>
        </div>

        {/* Gap → Solution 시각화 */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 mb-16 md:mb-20">
          {bridgePoints.map((point, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="space-y-3">
                <p className="text-base text-muted-foreground/60 font-light line-through decoration-muted-foreground/30">
                  {point.gap}
                </p>
                <div className="flex justify-center">
                  <svg
                    className="w-4 h-4 text-muted-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
                <p className="text-lg md:text-xl text-foreground font-light">
                  {point.solution}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <div className="text-center">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            onClick={handleCtaClick}
            className="group inline-flex items-center justify-center space-x-3 text-xl md:text-2xl font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
          >
            <span>{isAuthenticated ? "대시보드로 이동" : "시작하기"}</span>
            <div className="w-8 h-px bg-foreground group-hover:w-12 group-hover:bg-muted-foreground transition-all duration-300"></div>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
          </Link>
        </div>
      </div>
    </section>
  );
};
