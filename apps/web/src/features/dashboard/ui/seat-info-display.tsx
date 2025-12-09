import React from "react";
import { StatusBadge, StatusBadgeProps } from "./status-badge";
import { formatRemainingTime } from "../lib/formatRemainingTime";

export interface SeatInfoDisplayProps {
  roomName: string;
  seatDisplayName: string;
  remainingMinutes?: number;
  remainingSeconds?: number;
  statusBadge: StatusBadgeProps;
}

export const SeatInfoDisplay: React.FC<SeatInfoDisplayProps> = ({
  roomName,
  seatDisplayName,
  remainingMinutes,
  remainingSeconds = 0,
  statusBadge,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center">
      {/* 왼쪽: 좌석 정보 */}
      <div className="space-y-6 lg:space-y-8">
        <div className="space-y-4">
          <StatusBadge {...statusBadge} />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight text-foreground leading-tight">
            내 좌석
          </h1>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extralight text-foreground mb-2 break-words">
              {roomName}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground/70 font-light break-words">
              {seatDisplayName}
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽: 시간 정보 */}
      <div className="text-center lg:text-right space-y-4 lg:space-y-6">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground/60 font-light mb-3 lg:mb-4 tracking-wide uppercase">
            Time Remaining
          </p>
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extralight text-foreground leading-none break-all overflow-hidden">
            {remainingMinutes ? formatRemainingTime(remainingMinutes, remainingSeconds) : "0:00:00"}
          </div>
        </div>
      </div>
    </div>
  );
};