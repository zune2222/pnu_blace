"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">(
    "system"
  );

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // 다크 모드 상태 동기화 및 시스템 설정 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const html = document.documentElement;

    const syncThemeState = () => {
      const saved = localStorage.getItem("theme") as
        | "system"
        | "light"
        | "dark"
        | null;
      const currentMode: "system" | "light" | "dark" = saved || "system";

      setThemeMode(currentMode);
    };

    // 초기 상태 동기화
    syncThemeState();

    // 시스템 다크모드 변경 감지
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("theme");
      // system 모드일 때만 시스템 설정을 따름
      if (!saved || saved === "system") {
        if (e.matches) {
          html.classList.add("dark");
        } else {
          html.classList.remove("dark");
        }
        html.style.colorScheme = e.matches ? "dark" : "light";
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  // 테마 토글 (system → light → dark → system 순환)
  const toggleDarkMode = () => {
    const html = document.documentElement;
    let newMode: "system" | "light" | "dark";
    let newDarkMode: boolean;

    if (themeMode === "system") {
      newMode = "light";
      newDarkMode = false;
    } else if (themeMode === "light") {
      newMode = "dark";
      newDarkMode = true;
    } else {
      newMode = "system";
      newDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    setThemeMode(newMode);

    // DOM 클래스와 colorScheme 업데이트
    if (newDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    html.style.colorScheme = newDarkMode ? "dark" : "light";

    localStorage.setItem("theme", newMode);
  };

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

          {/* 데스크톱 네비게이션 */}

          {/* 데스크톱 액션 버튼 */}
          <div className="hidden md:flex items-center space-x-3">
            {/* 테마 토글 */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              aria-label={`테마 모드: ${themeMode === "system" ? "시스템" : themeMode === "light" ? "라이트" : "다크"}`}
              title={`현재: ${themeMode === "system" ? "시스템 설정" : themeMode === "light" ? "라이트 모드" : "다크 모드"}`}
            >
              {themeMode === "system" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              ) : themeMode === "light" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          </div>

          {/* 모바일 메뉴 및 로그인 버튼 */}
          <div className="md:hidden flex items-center space-x-2">
            {/* 모바일 로그인 버튼 */}
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>

            {/* 햄버거 메뉴 버튼 */}
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
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-between w-full px-3 py-3 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors duration-200"
              >
                <span>
                  테마:{" "}
                  {themeMode === "system"
                    ? "시스템"
                    : themeMode === "light"
                      ? "라이트"
                      : "다크"}
                </span>
                <div className="flex items-center">
                  {themeMode === "system" ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  ) : themeMode === "light" ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </div>
              </button>
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
