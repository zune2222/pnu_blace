"use client";

import React, { useState, useMemo } from "react";
import {
  useOperatingDates,
  useAttendanceByDate,
} from "@/entities/study/model/hooks";
import { Emoji } from "@/shared/ui";

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

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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

// 해당 월의 캘린더 데이터 생성
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (number | null)[] = [];

  // 이전 달 빈 칸
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // 현재 달 날짜
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateKey = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const DailyAttendanceViewer: React.FC<DailyAttendanceViewerProps> = ({
  groupId,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: operatingDates, isLoading: isLoadingDates } = useOperatingDates(
    groupId,
    90 // 3개월치
  );
  const { data: attendance, isLoading: isLoadingAttendance } =
    useAttendanceByDate(groupId, selectedDate || "", !!selectedDate);

  // 운영일 Set으로 변환 (빠른 조회용)
  const operatingDatesSet = useMemo(() => {
    return new Set(operatingDates || []);
  }, [operatingDates]);

  // 캘린더 데이터 생성
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // 월 이동
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    if (operatingDatesSet.has(dateKey)) {
      setSelectedDate(selectedDate === dateKey ? null : dateKey);
    }
  };

  if (isLoadingDates) {
    return (
      <div className="py-8 border-b border-border/20">
        <h2 className="text-lg font-light text-foreground mb-4">
          <Emoji>📅</Emoji> 날짜별 출결 현황
        </h2>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted-foreground/10 rounded" />
          <div className="h-64 bg-muted-foreground/10 rounded" />
        </div>
      </div>
    );
  }

  if (!operatingDates || operatingDates.length === 0) {
    return (
      <div className="py-8 border-b border-border/20">
        <h2 className="text-lg font-light text-foreground mb-4">
          <Emoji>📅</Emoji> 날짜별 출결 현황
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
        <Emoji>📅</Emoji> 날짜별 출결 현황
      </h2>

      {/* 캘린더 */}
      <div className="bg-background border border-border/20 rounded-lg overflow-hidden mb-4">
        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted-foreground/5 border-b border-border/10">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-muted-foreground/10 rounded-lg transition-colors"
            aria-label="이전 달"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-base font-light text-foreground">
              {currentYear}년 {currentMonth + 1}월
            </span>
            <button
              onClick={goToToday}
              className="text-xs px-2 py-1 bg-muted-foreground/10 hover:bg-muted-foreground/20 rounded transition-colors font-light"
            >
              오늘
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-muted-foreground/10 rounded-lg transition-colors"
            aria-label="다음 달"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-border/10">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={`py-2 text-center text-xs font-light ${
                index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-muted-foreground/60"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-12 md:h-14" />;
            }

            const dateKey = formatDateKey(currentYear, currentMonth, day);
            const hasRecord = operatingDatesSet.has(dateKey);
            const isSelected = selectedDate === dateKey;
            const isToday =
              today.getFullYear() === currentYear &&
              today.getMonth() === currentMonth &&
              today.getDate() === day;
            const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;

            return (
              <button
                key={dateKey}
                onClick={() => handleDateClick(day)}
                disabled={!hasRecord}
                className={`h-12 md:h-14 flex flex-col items-center justify-center relative transition-colors ${
                  hasRecord
                    ? isSelected
                      ? "bg-foreground text-background"
                      : "hover:bg-muted-foreground/10 cursor-pointer"
                    : "cursor-default opacity-40"
                } ${isToday && !isSelected ? "ring-1 ring-inset ring-foreground/30" : ""}`}
              >
                <span
                  className={`text-sm font-light ${
                    isSelected
                      ? ""
                      : isSunday
                        ? "text-red-400"
                        : isSaturday
                          ? "text-blue-400"
                          : ""
                  }`}
                >
                  {day}
                </span>
                {hasRecord && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="px-4 py-2 border-t border-border/10 flex items-center gap-4 text-xs text-muted-foreground/50">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>출결 기록 있음</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 ring-1 ring-inset ring-foreground/30 rounded" />
            <span>오늘</span>
          </div>
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
              {/* 헤더 - 모바일에서는 간소화 */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground/60 font-light bg-muted-foreground/5">
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
                    className="px-4 py-3 hover:bg-muted-foreground/5"
                  >
                    {/* 모바일 레이아웃 */}
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted-foreground/10 flex items-center justify-center text-xs font-light text-muted-foreground/60">
                            {record.displayName.charAt(0)}
                          </div>
                          <span className="text-sm font-light text-foreground">
                            {record.displayName}
                          </span>
                        </div>
                        <span className={`text-sm font-light ${status?.color ?? "text-muted-foreground/50"}`}>
                          {status?.label ?? "미출석"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground/60 pl-9">
                        <span>출근 {formatTime(record.checkInTime)}</span>
                        <span>퇴근 {formatTime(record.checkOutTime)}</span>
                        <span className="text-foreground">{formatMinutes(record.usageMinutes)}</span>
                      </div>
                    </div>

                    {/* 데스크탑 레이아웃 */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
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
        <div className="bg-muted-foreground/5 rounded-lg p-4 text-center">
          <p className="text-muted-foreground/60 font-light text-sm">
            날짜를 선택하면 상세 출결 현황을 볼 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
};
