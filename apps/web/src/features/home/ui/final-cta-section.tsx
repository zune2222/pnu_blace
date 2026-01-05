"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import { engagementEvents } from "@/shared/lib/analytics";

export const FinalCtaSection: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const handleCtaClick = () => {
    engagementEvents.ctaClicked(
      isAuthenticated ? "start_dashboard" : "login",
      "final_cta_section"
    );
  };

  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-foreground leading-tight mb-4 break-keep">
          {isAuthenticated
            ? "오늘도 도서관에서 만나요"
            : "더 나은 도서관 경험"}
        </h2>

        <p className="text-sm md:text-base text-muted-foreground/70 font-light mb-8 break-keep">
          {isAuthenticated
            ? "대시보드에서 좌석 현황을 확인하세요"
            : "부산대학교 학번으로 무료 이용"}
        </p>

        <Link
          href={isAuthenticated ? "/dashboard" : "/login"}
          onClick={handleCtaClick}
          className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-3.5 text-sm md:text-base font-light text-background bg-foreground hover:bg-foreground/90 rounded-full transition-colors duration-300"
        >
          {isAuthenticated ? "대시보드" : "시작하기"}
        </Link>

        {!isAuthenticated && (
          <p className="mt-6 text-xs text-muted-foreground/50 font-light">
            부산대학교 구성원 전용
          </p>
        )}
      </div>
    </section>
  );
};
