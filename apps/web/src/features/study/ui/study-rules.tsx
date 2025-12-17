"use client";

import React from "react";

interface StudyRulesProps {
  operatingDays: number[];
  checkInStartTime: string;
  checkInEndTime: string;
  checkOutMinTime: string;
  minUsageMinutes: number;
}

const formatDays = (days: number[]): string => {
  const dayNames = ["", "월", "화", "수", "목", "금", "토", "일"];
  return days.map((d) => dayNames[d]).join(", ");
};

export const StudyRules: React.FC<StudyRulesProps> = ({
  operatingDays,
  checkInStartTime,
  checkInEndTime,
  checkOutMinTime,
  minUsageMinutes,
}) => {
  return (
    <div className="py-8 border-b border-border/20">
      <h2 className="text-lg font-light text-foreground mb-4">출퇴근 규칙</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div>
          <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
            운영 요일
          </p>
          <p className="text-sm text-foreground font-light">
            {formatDays(operatingDays)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
            출근 시간
          </p>
          <p className="text-sm text-foreground font-light">
            {checkInStartTime} ~ {checkInEndTime}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
            최소 퇴근 시간
          </p>
          <p className="text-sm text-foreground font-light">
            {checkOutMinTime} 이후
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
            최소 이용 시간
          </p>
          <p className="text-sm text-foreground font-light">
            {Math.floor(minUsageMinutes / 60)}시간{" "}
            {minUsageMinutes % 60 > 0 && `${minUsageMinutes % 60}분`}
          </p>
        </div>
      </div>
    </div>
  );
};
