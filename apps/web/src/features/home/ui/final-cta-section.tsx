"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useAuth } from "@/entities/auth";
import { engagementEvents } from "@/shared/lib/analytics";

export const FinalCtaSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  const handleCtaClick = () => {
    engagementEvents.ctaClicked(
      isAuthenticated ? "start_dashboard" : "login",
      "final_cta_section"
    );
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-6 bg-muted/20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-foreground leading-tight mb-4 break-keep">
          {isAuthenticated
            ? "오늘도 도서관에서 만나요"
            : "지금 바로 시작하세요"}
        </h2>

        <p className="text-sm md:text-base text-muted-foreground/70 font-light mb-8 break-keep">
          {isAuthenticated
            ? "대시보드에서 좌석 현황을 확인하세요"
            : "1분 회원가입, 바로 사용 가능"}
        </p>

        <Link
          href={isAuthenticated ? "/dashboard" : "/login"}
          onClick={handleCtaClick}
          className="inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-4 text-base md:text-lg font-medium text-background bg-foreground hover:bg-foreground/90 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isAuthenticated ? "대시보드" : "무료로 시작하기"}
        </Link>

        {!isAuthenticated && (
          <p className="mt-6 text-xs text-muted-foreground/50 font-light">
            부산대학교 구성원 전용 · 학번으로 즉시 로그인
          </p>
        )}
      </motion.div>
    </section>
  );
};
