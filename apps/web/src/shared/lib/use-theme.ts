"use client";

import { useState, useEffect } from "react";

type ThemeMode = "system" | "light" | "dark";

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const html = document.documentElement;

    const syncThemeState = () => {
      const saved = localStorage.getItem("theme") as ThemeMode | null;
      const currentMode: ThemeMode = saved || "system";
      setThemeMode(currentMode);
    };

    syncThemeState();

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("theme");
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

  const toggleDarkMode = () => {
    const html = document.documentElement;
    let newMode: ThemeMode;
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

    if (newDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    html.style.colorScheme = newDarkMode ? "dark" : "light";

    localStorage.setItem("theme", newMode);
  };

  return { themeMode, toggleDarkMode };
}
