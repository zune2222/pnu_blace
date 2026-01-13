"use client";

import React from "react";
import { DashboardShareButton } from "./dashboard-share-button";
import { StatsShareButton } from "./stats-share-button";
import { RankingShareButton } from "./ranking-share-button";

type CardVariant = "dashboard" | "stats" | "ranking";
type ButtonVariant = "icon" | "text" | "full";

interface ShareStoryButtonProps {
  cardVariant?: CardVariant;
  buttonVariant?: ButtonVariant;
  className?: string;
}

/**
 * 페이지별 공유 버튼 facade
 * cardVariant에 따라 적절한 내부 컴포넌트를 렌더링
 */
export function ShareStoryButton({
  cardVariant = "dashboard",
  buttonVariant = "icon",
  className = "",
}: ShareStoryButtonProps) {
  switch (cardVariant) {
    case "dashboard":
      return <DashboardShareButton buttonVariant={buttonVariant} className={className} />;
    case "stats":
      return <StatsShareButton buttonVariant={buttonVariant} className={className} />;
    case "ranking":
      return <RankingShareButton buttonVariant={buttonVariant} className={className} />;
  }
}
