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
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
      <button
        onClick={() => onTabChange("all-time")}
        className={`text-lg sm:text-xl font-light pb-3 sm:pb-4 border-b-2 transition-colors min-h-[44px] px-2 rounded-t-md ${
          activeTab === "all-time"
            ? "text-foreground border-foreground bg-muted/10"
            : "text-muted-foreground/60 border-transparent hover:text-foreground hover:border-muted-foreground/30 hover:bg-muted/5"
        }`}
      >
        전체 랭킹
      </button>
      <button
        onClick={() => onTabChange("weekly")}
        className={`text-lg sm:text-xl font-light pb-3 sm:pb-4 border-b-2 transition-colors min-h-[44px] px-2 rounded-t-md ${
          activeTab === "weekly"
            ? "text-foreground border-foreground bg-muted/10"
            : "text-muted-foreground/60 border-transparent hover:text-foreground hover:border-muted-foreground/30 hover:bg-muted/5"
        }`}
      >
        이번주 랭킹
      </button>
    </div>
  );
};