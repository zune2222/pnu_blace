"use client";

import React, { useState } from "react";
import { ShareButton } from "./share-button";
import { ShareModal } from "./share-modal";
import { useSeatHistory, useStreakHeatmap } from "@/entities/dashboard";
import { safeNumber } from "../lib/utils";
import type { StoryCardTemplateProps } from "./story-card-template";

type ButtonVariant = "icon" | "text" | "full";

interface StatsShareButtonProps {
  buttonVariant?: ButtonVariant;
  className?: string;
}

export function StatsShareButton({
  buttonVariant = "icon",
  className = "",
}: StatsShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: seatHistoryData } = useSeatHistory();
  const { data: streakData } = useStreakHeatmap();

  if (!seatHistoryData) return null;

  const cardData: StoryCardTemplateProps = {
    cardType: "stats",
    totalHours: safeNumber(seatHistoryData?.totalUsageHours),
    totalDays: safeNumber(seatHistoryData?.totalDays),
    currentStreak: safeNumber(streakData?.currentStreak),
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
