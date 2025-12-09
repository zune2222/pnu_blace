"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";

export const CtaSection: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8 md:space-y-12">
          {/* 메인 메시지 */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
              {isAuthenticated ? "지금 시작해보세요" : "지금 시작해보세요"}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed break-keep">
              {isAuthenticated ? (
                <>
                  대시보드에서 좌석 현황을 확인하고
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>
                  스터디 그룹에 참여해보세요
                </>
              ) : (
                <>
                  부산대학교 학번으로 로그인하고
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>
                  더 스마트한 도서관 경험을 만나보세요
                </>
              )}
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="pt-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="group inline-flex items-center justify-center space-x-3 text-xl md:text-2xl font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
            >
              <span>{isAuthenticated ? "시작하기" : "로그인하기"}</span>
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
      </div>
    </section>
  );
};
