"use client";

import React from "react";
import { AttendanceStatus } from "@pnu-blace/types";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus | "NOT_YET";
  className?: string;
}

const statusConfig: Record<
  AttendanceStatus | "NOT_YET",
  { icon: string; label: string; className: string }
> = {
  PRESENT: {
    icon: "✅",
    label: "출근",
    className: "text-green-600 dark:text-green-400",
  },
  LATE: {
    icon: "⚠️",
    label: "지각",
    className: "text-amber-600 dark:text-amber-400",
  },
  EARLY_LEAVE: {
    icon: "🚪",
    label: "조퇴",
    className: "text-orange-600 dark:text-orange-400",
  },
  ABSENT: {
    icon: "❌",
    label: "결석",
    className: "text-red-600 dark:text-red-400",
  },
  VACATION: {
    icon: "🏖️",
    label: "휴가",
    className: "text-blue-600 dark:text-blue-400",
  },
  NOT_YET: {
    icon: "⏳",
    label: "미출근",
    className: "text-muted-foreground/50",
  },
};

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-light ${config.className} ${className}`}
    >
      {config.icon} {config.label}
    </span>
  );
};
