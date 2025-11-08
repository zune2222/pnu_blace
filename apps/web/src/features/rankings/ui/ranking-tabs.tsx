"use client";
import React from "react";

interface RankingTabsProps {
  activeTab: "all-time" | "weekly";
  onTabChange: (tab: "all-time" | "weekly") => void;
}

export const RankingTabs: React.FC<RankingTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex space-x-8">
      <button
        onClick={() => onTabChange("all-time")}
        className={`text-xl font-light pb-4 border-b-2 transition-colors ${
          activeTab === "all-time"
            ? "text-foreground border-foreground"
            : "text-muted-foreground/60 border-transparent hover:text-foreground hover:border-muted-foreground/30"
        }`}
      >
        전체 랭킹
      </button>
      <button
        onClick={() => onTabChange("weekly")}
        className={`text-xl font-light pb-4 border-b-2 transition-colors ${
          activeTab === "weekly"
            ? "text-foreground border-foreground"
            : "text-muted-foreground/60 border-transparent hover:text-foreground hover:border-muted-foreground/30"
        }`}
      >
        이번주 랭킹
      </button>
    </div>
  );
};