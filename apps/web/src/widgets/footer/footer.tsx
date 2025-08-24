import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">PNU Blace</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              부산대학교 도서관 좌석을 실시간으로 모니터링하고 자동 예약하는
              서비스입니다.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/features"
                  className="hover:text-foreground transition-colors"
                >
                  좌석 모니터링
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="hover:text-foreground transition-colors"
                >
                  자동 예약
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="hover:text-foreground transition-colors"
                >
                  알림 서비스
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/help"
                  className="hover:text-foreground transition-colors"
                >
                  도움말
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-foreground transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">법적 고지</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 PNU Blace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
