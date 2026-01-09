"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/entities/auth";
import { engagementEvents } from "@/shared/lib/analytics";

export const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: "smooth",
    });
  };

  const handleCtaClick = () => {
    engagementEvents.ctaClicked(
      isAuthenticated ? "start_dashboard" : "login",
      "hero_section"
    );
  };

  return (
    <section className="min-h-[80vh] md:min-h-[85vh] flex flex-col items-center justify-center px-6 relative">
      <motion.div
        className="text-center max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-headline dynamic-weight mb-6 md:mb-8 cursor-default">
          PNU Blace
        </h1>
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-muted-foreground font-light leading-tight max-w-5xl mx-auto variable-weight-hover cursor-default break-keep mb-8 md:mb-12">
          빈틈없이, 연결되다
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            onClick={handleCtaClick}
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-background bg-foreground hover:bg-foreground/90 rounded-full transition-colors duration-200"
          >
            {isAuthenticated ? "대시보드" : "무료로 시작하기"}
          </Link>
          {!isAuthenticated && (
            <span className="text-sm text-muted-foreground/60">
              부산대 학번으로 바로 로그인
            </span>
          )}
        </div>
      </motion.div>

      <button
        onClick={scrollToContent}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-300 cursor-pointer"
        aria-label="아래로 스크롤"
      >
        <span className="text-xs font-light tracking-widest uppercase">
          Scroll
        </span>
        <svg
          className="w-5 h-5 animate-bounce"
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
      </button>
    </section>
  );
};
