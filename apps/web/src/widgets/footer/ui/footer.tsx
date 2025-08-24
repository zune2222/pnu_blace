import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="section-padding border-t border-muted-foreground/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-12">
          {/* 브랜드 섹션 */}
          <div className="space-y-8">
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto variable-weight-hover cursor-default">
              부산대학교 도서관 좌석 시스템의
              <br />
              새로운 경험을 만들어갑니다
            </p>
          </div>

          {/* 링크 섹션 */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12">
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-light text-lg group"
            >
              <span className="variable-weight-hover">이용약관</span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-muted-foreground/20"></div>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-light text-lg group"
            >
              <span className="variable-weight-hover">개인정보보호정책</span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-muted-foreground/20"></div>
            <Link
              href="mailto:zun_e@kakao.com"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-light text-lg group"
            >
              <span className="variable-weight-hover">문의하기</span>
            </Link>
          </div>

          {/* 카피라이트 */}
          <div className="pt-8 space-y-4">
            <div className="w-24 h-px bg-muted-foreground/20 mx-auto"></div>
            <p className="text-sm text-muted-foreground font-light">
              © 2025 PNU Blace. 모든 권리 보유.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
