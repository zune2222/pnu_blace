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
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8 md:space-y-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight break-keep">
            {isAuthenticated
              ? "오늘도 도서관에서 만나요"
              : "더 나은 도서관 경험을 시작하세요"}
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed break-keep">
            {isAuthenticated ? (
              <>
                대시보드에서 좌석 현황을 확인하고
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                스터디 그룹에 참여해보세요.
              </>
            ) : (
              <>
                부산대학교 학번으로 로그인하면
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                모든 기능을 무료로 이용할 수 있습니다.
              </>
            )}
          </p>

          <div className="pt-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-light text-background bg-foreground hover:bg-foreground/90 rounded-full transition-colors duration-300"
            >
              {isAuthenticated ? "대시보드로 이동" : "지금 시작하기"}
            </Link>
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground/60 font-light">
              부산대학교 구성원만 이용 가능합니다
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
