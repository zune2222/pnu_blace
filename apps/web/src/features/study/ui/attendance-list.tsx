"use client";

import React from "react";
import { TodayAttendancePublic, AttendanceStatus } from "@pnu-blace/types";

interface AttendanceListProps {
  attendance: TodayAttendancePublic[];
  isLoading?: boolean;
}

const StatusBadge: React.FC<{ status: AttendanceStatus | "NOT_YET" }> = ({
  status,
}) => {
  const config: Record<
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

  const { icon, label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-light ${className}`}
    >
      {icon} {label}
    </span>
  );
};

const formatMinutes = (minutes?: number): string => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
};

export const AttendanceList: React.FC<AttendanceListProps> = ({
  attendance,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted-foreground/10" />
              <div className="h-4 w-24 bg-muted-foreground/10 rounded" />
            </div>
            <div className="h-4 w-16 bg-muted-foreground/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground/60 font-light">
          아직 멤버가 없습니다.
        </p>
      </div>
    );
  }

  // 출근한 사람 먼저, 미출근 나중에 정렬
  const sortedAttendance = [...attendance].sort((a, b) => {
    if (a.status === "NOT_YET" && b.status !== "NOT_YET") return 1;
    if (a.status !== "NOT_YET" && b.status === "NOT_YET") return -1;
    return 0;
  });

  return (
    <div className="space-y-1">
      {sortedAttendance.map((member) => (
        <div
          key={member.memberId}
          className="flex items-center justify-between py-3 border-b border-border/10 last:border-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center text-sm font-light text-muted-foreground/60">
              {member.displayName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-light text-foreground">
                {member.displayName}
              </p>
              {member.checkInTime && (
                <p className="text-xs text-muted-foreground/50 font-light">
                  {member.checkInTime} 출근
                  {member.checkOutTime && ` → ${member.checkOutTime} 퇴근`}
                  {member.isCurrentlyIn && (
                    <span className="ml-2 text-green-500">• 이용 중</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {member.usageMinutes !== undefined && member.usageMinutes > 0 && (
              <span className="text-xs text-muted-foreground/50 font-light">
                {formatMinutes(member.usageMinutes)}
              </span>
            )}
            <StatusBadge status={member.status} />
          </div>
        </div>
      ))}
    </div>
  );
};
