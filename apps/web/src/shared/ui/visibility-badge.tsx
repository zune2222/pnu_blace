"use client";

import React from "react";
import { StudyVisibility } from "@pnu-blace/types";

interface VisibilityBadgeProps {
  visibility: StudyVisibility;
  className?: string;
}

const visibilityConfig = {
  PUBLIC: {
    icon: "🌍",
    label: "공개",
    className: "text-green-600 dark:text-green-400 bg-green-500/10",
  },
  PASSWORD: {
    icon: "🔐",
    label: "비밀번호",
    className: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  PRIVATE: {
    icon: "🔒",
    label: "비공개",
    className: "text-gray-600 dark:text-gray-400 bg-gray-500/10",
  },
} as const;

export const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({
  visibility,
  className = "",
}) => {
  const config = visibilityConfig[visibility];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-light ${config.className} ${className}`}
    >
      {config.icon} {config.label}
    </span>
  );
};
