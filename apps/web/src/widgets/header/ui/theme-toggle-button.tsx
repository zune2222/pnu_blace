"use client";

import React from "react";


interface ThemeToggleButtonProps {
  themeMode: "system" | "light" | "dark";
  toggleDarkMode: () => void;
  className?: string; // 모바일 메뉴용 추가 스타일 지원
  showLabel?: boolean; // 모바일 메뉴용 라벨 표시 여부
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  themeMode,
  toggleDarkMode,
  className = "",
  showLabel = false,
}) => {
  const Icon = () => {
    if (themeMode === "system") {
      return (
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
      );
    }
    if (themeMode === "light") {
      return (
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
      );
    }
    return (
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
    );
  };

  if (showLabel) {
    return (
      <button
        onClick={toggleDarkMode}
        className={`flex items-center justify-between w-full px-3 py-3 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors duration-200 ${className}`}
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
          <Icon />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 ${className}`}
      aria-label={`테마 모드: ${themeMode === "system" ? "시스템" : themeMode === "light" ? "라이트" : "다크"}`}
      title={`현재: ${themeMode === "system" ? "시스템 설정" : themeMode === "light" ? "라이트 모드" : "다크 모드"}`}
    >
      <Icon />
    </button>
  );
};
