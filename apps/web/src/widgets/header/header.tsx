"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";
import { useTheme } from "@/shared/lib/use-theme";
import { ThemeToggleButton } from "./ui/theme-toggle-button";

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { themeMode, toggleDarkMode } = useTheme();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black text-primary variable-weight-hover">
                PNU Blace
              </span>
            </Link>
          </div>

          {/* 데스크톱 액션 버튼 */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggleButton
              themeMode={themeMode}
              toggleDarkMode={toggleDarkMode}
            />

            <Button variant="outline" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          </div>

          {/* 모바일 메뉴 및 로그인 버튼 */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>

            <button
              onClick={toggleMobileMenu}
              className="flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              aria-label="메뉴 토글"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background/80 backdrop-blur-sm border-t border-border/40">
            {/* 모바일 테마 토글 */}
            <div
              className={`transform transition-all duration-200 ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
              style={{ transitionDelay: "100ms" }}
            >
              <ThemeToggleButton
                themeMode={themeMode}
                toggleDarkMode={toggleDarkMode}
                showLabel={true}
              />
            </div>

            {/* 모바일 액션 버튼 */}
            <div
              className={`pt-4 space-y-3 transform transition-all duration-200 ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
              style={{ transitionDelay: "200ms" }}
            >
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  로그인
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
