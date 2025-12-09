import React from "react";
import Link from "next/link";

export const NoSeatMessage: React.FC = () => {
  return (
    <div className="text-center space-y-12">
      <div className="space-y-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight text-foreground leading-tight break-keep">
          내 좌석
        </h1>

        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extralight text-foreground break-keep">
            예약한 좌석이 없습니다
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground/70 font-light leading-relaxed max-w-2xl mx-auto break-keep">
            새로운 학습 공간을 찾아보세요
          </p>
        </div>
      </div>

      <div>
        <Link
          href="/seats"
          className="group inline-flex items-center space-x-4 text-xl font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
        >
          <span>좌석 찾기</span>
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
  );
};