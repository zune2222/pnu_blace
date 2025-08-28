import React from "react";
import { StatusBadge, StatusBadgeProps } from "./status-badge";
import { formatRemainingTime } from "../lib/formatRemainingTime";

export interface SeatInfoDisplayProps {
  roomName: string;
  seatDisplayName: string;
  remainingMinutes?: number;
  statusBadge: StatusBadgeProps;
}

export const SeatInfoDisplay: React.FC<SeatInfoDisplayProps> = ({
  roomName,
  seatDisplayName,
  remainingMinutes,
  statusBadge,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
      {/* 왼쪽: 좌석 정보 */}
      <div className="space-y-8">
        <div className="space-y-4">
          <StatusBadge {...statusBadge} />

          <h1 className="text-4xl md:text-5xl font-extralight text-foreground leading-tight">
            내 좌석
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extralight text-foreground mb-2">
              {roomName}
            </h2>
            <p className="text-xl text-muted-foreground/70 font-light">
              {seatDisplayName}
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽: 시간 정보 */}
      <div className="text-center lg:text-right space-y-6">
        <div>
          <p className="text-sm text-muted-foreground/60 font-light mb-4 tracking-wide uppercase">
            Time Remaining
          </p>
          <div className="font-mono text-6xl md:text-7xl font-extralight text-foreground leading-none">
            {remainingMinutes ? formatRemainingTime(remainingMinutes) : "0:00:00"}
          </div>
        </div>
      </div>
    </div>
  );
};