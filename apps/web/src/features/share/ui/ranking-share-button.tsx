"use client";

import React, { useState } from "react";
import { ShareButton } from "./share-button";
import { ShareModal } from "./share-modal";
import { useMyRankInfo } from "@/entities/rankings";
import { safeNumber } from "../lib/utils";
import type { StoryCardTemplateProps } from "./story-card-template";

type ButtonVariant = "icon" | "text" | "full";

interface RankingShareButtonProps {
  buttonVariant?: ButtonVariant;
  className?: string;
}

export function RankingShareButton({
  buttonVariant = "icon",
  className = "",
}: RankingShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: rankInfoData } = useMyRankInfo();

  if (!rankInfoData) return null;

  const rank = safeNumber(rankInfoData?.hoursRank);

  // rank가 0이면 아직 랭킹에 없는 것
  if (rank === 0) return null;

  const cardData: StoryCardTemplateProps = {
    cardType: "ranking",
    rank,
    percentile: rankInfoData?.hoursPercentile,
    totalUsers: safeNumber(rankInfoData?.totalUsers) || 1,
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
