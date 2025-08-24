import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-t from-secondary to-background border-t border-border">
      <div className="container mx-auto px-6 py-16">
        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 브랜드 섹션 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-foreground">PNU Blace</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              부산대학교 학생들을 위한 스마트한 도서관 좌석 관리 솔루션입니다.
            </p>
            <div className="flex space-x-4">
              <Link
                href="mailto:zun_e@kakao.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 정책 섹션 */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              정책 & 정보
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-blue-600 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-blue-600 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  개인정보보호정책
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                © 2025 PNU Blace. All rights reserved.
              </p>
              <div className="hidden md:block w-px h-4 bg-border"></div>
            </div>
            <div className="flex items-center space-x-6 text-xs text-muted-foreground">
              <span>버전 1.0.0</span>
              <span>•</span>
              <span>최종 업데이트: 2025년 8월</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
