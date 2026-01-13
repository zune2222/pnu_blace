"use client";

import React, { useState } from "react";
import { ShareButton } from "./share-button";
import { ShareModal } from "./share-modal";
import { useMyRank, usePersonalStats } from "@/entities/dashboard";
import { safeNumber } from "../lib/utils";
import type { StoryCardTemplateProps } from "./story-card-template";

type ButtonVariant = "icon" | "text" | "full";

interface DashboardShareButtonProps {
  buttonVariant?: ButtonVariant;
  className?: string;
}

export function DashboardShareButton({
  buttonVariant = "icon",
  className = "",
}: DashboardShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: rankData } = useMyRank();
  const { data: statsData } = usePersonalStats();

  if (!rankData && !statsData) return null;

  const cardData: StoryCardTemplateProps = {
    cardType: "dashboard",
    todayHours: safeNumber(statsData?.todayHours),
    weeklyHours: safeNumber(rankData?.weeklyUsageHours ?? statsData?.thisWeekHours),
    percentile: rankData?.hoursPercentile,
  };

  return (
    <>
      <ShareButton
        variant={buttonVariant}
        className={className}
        onClick={() => setIsModalOpen(true)}
      />
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardData={cardData}
      />
    </>
  );
}
