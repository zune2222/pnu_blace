"use client";

import React from "react";

export const HeroSection: React.FC = () => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="min-h-[80vh] md:min-h-[85vh] flex flex-col items-center justify-center px-6 relative">
      <div className="text-center max-w-7xl mx-auto">
        <h1 className="text-headline dynamic-weight mb-8 md:mb-12 cursor-default">
          PNU Blace
        </h1>
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-muted-foreground font-light leading-tight max-w-5xl mx-auto variable-weight-hover cursor-default break-keep">
          빈틈없이, 연결되다
        </p>
      </div>

      {/* Scroll Indicator */}
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
