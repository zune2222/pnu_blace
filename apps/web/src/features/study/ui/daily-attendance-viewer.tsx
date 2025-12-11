"use client";

import React, { useState } from "react";
import {
  useOperatingDates,
  useAttendanceByDate,
} from "@/entities/study/model/hooks";
import { TodayAttendancePublic } from "@pnu-blace/types";

interface DailyAttendanceViewerProps {
  groupId: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "정상 출석", color: "text-green-500" },
  LATE: { label: "지각", color: "text-yellow-500" },
  EARLY_LEAVE: { label: "조퇴", color: "text-orange-500" },
  ABSENT: { label: "결석", color: "text-red-500" },
  VACATION: { label: "휴가", color: "text-blue-500" },
  NOT_YET: { label: "미출석", color: "text-muted-foreground/50" },
};

const formatTime = (time?: string): string => {
  if (!time) return "-";
  return time;
};

const formatMinutes = (minutes?: number): string => {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
};

const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

export const DailyAttendanceViewer: React.FC<DailyAttendanceViewerProps> = ({
  groupId,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data: operatingDates, isLoading: isLoadingDates } = useOperatingDates(
    groupId,
    60
  );
  const { data: attendance, isLoading: isLoadingAttendance } =
    useAttendanceByDate(groupId, selectedDate || "", !!selectedDate);

  if (isLoadingDates) {
    return (
      <div className="py-8 border-b border-border/20">
        <h2 className="text-lg font-light text-foreground mb-4">
          📅 날짜별 출결 현황
        </h2>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted-foreground/10 rounded" />
          <div className="h-40 bg-muted-foreground/10 rounded" />
        </div>
      </div>
    );
  }

  if (!operatingDates || operatingDates.length === 0) {
    return (
      <div className="py-8 border-b border-border/20">
        <h2 className="text-lg font-light text-foreground mb-4">
          📅 날짜별 출결 현황
        </h2>
        <div className="bg-muted-foreground/5 rounded-lg p-6 text-center">
          <p className="text-muted-foreground/60 font-light">
            아직 출결 기록이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 border-b border-border/20">
      <h2 className="text-lg font-light text-foreground mb-4">
        📅 날짜별 출결 현황
      </h2>

      {/* 날짜 선택 그리드 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {operatingDates.map((date) => {
            const isSelected = selectedDate === date;
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`px-3 py-2 rounded-lg text-sm font-light transition-all ${
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-muted-foreground/5 hover:bg-muted-foreground/10"
                } ${isWeekend ? "text-orange-500" : ""}`}
              >
                {dateObj.toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
                <span className="ml-1 text-xs opacity-60">
                  ({["일", "월", "화", "수", "목", "금", "토"][dayOfWeek]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜의 상세 출결 현황 */}
      {selectedDate && (
        <div className="bg-background border border-border/20 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted-foreground/5 border-b border-border/10">
            <p className="text-sm font-light text-foreground">
              {formatDateDisplay(selectedDate)}
            </p>
          </div>

          {isLoadingAttendance ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted-foreground/10" />
                  <div className="flex-1 h-8 bg-muted-foreground/10 rounded" />
                </div>
              ))}
            </div>
          ) : attendance && attendance.length > 0 ? (
            <div className="divide-y divide-border/10">
              {/* 헤더 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground/60 font-light bg-muted-foreground/5">
                <div className="col-span-3">멤버</div>
                <div className="col-span-2 text-center">상태</div>
                <div className="col-span-2 text-center">출근</div>
                <div className="col-span-2 text-center">퇴근</div>
                <div className="col-span-3 text-center">이용 시간</div>
              </div>

              {/* 멤버별 출결 */}
              {attendance.map((record) => {
                const recordStatus = record.status || "NOT_YET";
                const status = statusLabels[recordStatus] || statusLabels.NOT_YET;
                return (
                  <div
                    key={record.memberId}
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted-foreground/5"
                  >
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted-foreground/10 flex items-center justify-center text-xs font-light text-muted-foreground/60">
                        {record.displayName.charAt(0)}
                      </div>
                      <span className="text-sm font-light text-foreground truncate">
                        {record.displayName}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`text-sm font-light ${status?.color ?? "text-muted-foreground/50"}`}>
                        {status?.label ?? "미출석"}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-light text-muted-foreground/70">
                        {formatTime(record.checkInTime)}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-light text-muted-foreground/70">
                        {formatTime(record.checkOutTime)}
                      </span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-sm font-light text-foreground">
                        {formatMinutes(record.usageMinutes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground/60 font-light text-sm">
                해당 날짜에 출결 기록이 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="bg-muted-foreground/5 rounded-lg p-6 text-center">
          <p className="text-muted-foreground/60 font-light">
            날짜를 선택하면 상세 출결 현황을 볼 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};
