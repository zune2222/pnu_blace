"use client";
import React, { useState, useEffect } from "react";
import { useStreakHeatmap, StreakHeatmapData } from "@/entities/dashboard";

interface StreakHeatmapProps {
  className?: string;
}

// 최근 N주 데이터 생성 (모바일용)
const generateRecentWeeksData = (streakData?: StreakHeatmapData, weekCount: number = 12) => {
  const weeks = [];
  const today = new Date();
  
  // API 데이터에서 도서관 이용 기록 사용
  const historyMap = new Map();
  if (streakData?.streakHistory) {
    streakData.streakHistory.forEach(item => {
      historyMap.set(item.date, {
        hasActivity: item.hasActivity,
        level: item.level,
        usageHours: item.usageHours,
      });
    });
  }
  
  // 오늘이 속한 주의 일요일 계산
  const todayDayOfWeek = today.getDay();
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - todayDayOfWeek);
  
  // 시작 일요일 계산 (weekCount주 전)
  const startSunday = new Date(currentSunday);
  startSunday.setDate(currentSunday.getDate() - (weekCount - 1) * 7);
  
  for (let week = 0; week < weekCount; week++) {
    const weekData = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startSunday);
      currentDate.setDate(startSunday.getDate() + (week * 7) + day);
      
      // 미래 날짜면 빈 칸
      if (currentDate > today) {
        weekData.push({
          date: "",
          hasActivity: false,
          level: 0,
          usageHours: 0,
          isToday: false,
          dayOfWeek: day,
          isFuture: true,
        });
        continue;
      }
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = historyMap.get(dateStr) || { hasActivity: false, level: 0, usageHours: 0 };
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      weekData.push({
        date: dateStr,
        hasActivity: dayData.hasActivity,
        level: dayData.level,
        usageHours: dayData.usageHours,
        isToday,
        dayOfWeek: day,
        isFuture: false,
      });
    }
    
    weeks.push(weekData);
  }
  
  return weeks;
};

// 년 단위 히트맵 데이터 생성 (데스크톱용)
const generateYearlyHeatmapData = (streakData?: StreakHeatmapData) => {
  const weeks = [];
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  const startDayOfWeek = startOfYear.getDay();
  const firstSunday = new Date(startOfYear);
  firstSunday.setDate(startOfYear.getDate() - startDayOfWeek);
  
  const historyMap = new Map();
  if (streakData?.streakHistory) {
    streakData.streakHistory.forEach(item => {
      historyMap.set(item.date, {
        hasActivity: item.hasActivity,
        level: item.level,
        usageHours: item.usageHours,
      });
    });
  }
  
  for (let week = 0; week < 53; week++) {
    const weekData = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(firstSunday);
      currentDate.setDate(firstSunday.getDate() + (week * 7) + day);
      
      if (currentDate.getFullYear() > today.getFullYear()) break;
      if (currentDate > today) break;
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = historyMap.get(dateStr) || { hasActivity: false, level: 0, usageHours: 0 };
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      weekData.push({
        date: dateStr,
        hasActivity: dayData.hasActivity,
        level: dayData.level,
        usageHours: dayData.usageHours,
        isToday,
        dayOfWeek: day,
        isFuture: false,
      });
    }
    
    if (weekData.length > 0) {
      weeks.push(weekData);
    }
  }
  
  return weeks;
};

// 월별 라벨 생성 (데스크톱용)
const getMonthLabels = () => {
  const months = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const month = new Date(today.getFullYear(), i, 1);
    months.push({
      name: month.toLocaleDateString('ko-KR', { month: 'short' }),
      index: i
    });
  }
  
  return months;
};

// 최근 주의 월 라벨 생성 (모바일용)
const getRecentMonthLabels = (weekCount: number = 12) => {
  const labels: string[] = [];
  const today = new Date();
  const todayDayOfWeek = today.getDay();
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - todayDayOfWeek);
  
  const startSunday = new Date(currentSunday);
  startSunday.setDate(currentSunday.getDate() - (weekCount - 1) * 7);
  
  let lastMonth = -1;
  
  for (let week = 0; week < weekCount; week++) {
    const weekStart = new Date(startSunday);
    weekStart.setDate(startSunday.getDate() + (week * 7));
    const month = weekStart.getMonth();
    
    if (month !== lastMonth) {
      labels.push(weekStart.toLocaleDateString('ko-KR', { month: 'short' }));
      lastMonth = month;
    } else {
      labels.push("");
    }
  }
  
  return labels;
};

// 레벨에 따른 색상 클래스 반환
const getLevelColorClass = (level: number, isToday: boolean) => {
  if (isToday && level > 0) {
    return "ring-1 ring-orange-300 " + getLevelBgClass(level);
  }
  
  return getLevelBgClass(level);
};

const getLevelBgClass = (level: number) => {
  switch (level) {
    case 0: return "bg-background border border-border/20 dark:bg-muted/20";
    case 1: return "bg-orange-200 dark:bg-orange-900/30";
    case 2: return "bg-orange-400 dark:bg-orange-800/50";
    case 3: return "bg-orange-500 dark:bg-orange-700/70";
    case 4: return "bg-orange-600 dark:bg-orange-600/80";
    default: return "bg-background border border-border/20 dark:bg-muted/20";
  }
};

// 요일 라벨
const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  className = "",
}) => {
  const { data: streakData, isLoading } = useStreakHeatmap();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mobileWeekCount = 12; // 약 3개월
  const mobileHeatmapData = generateRecentWeeksData(streakData || undefined, mobileWeekCount);
  const desktopHeatmapData = generateYearlyHeatmapData(streakData || undefined);
  const mobileMonthLabels = getRecentMonthLabels(mobileWeekCount);
  const desktopMonthLabels = getMonthLabels();
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-light text-foreground">
            {isMobile ? "최근 활동" : `${new Date().getFullYear()}년 스터디 활동`}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-background border border-border/20 dark:bg-muted/20 rounded-sm" />
              <div className="w-2 h-2 bg-orange-200 dark:bg-orange-900/30 rounded-sm" />
              <div className="w-2 h-2 bg-orange-400 dark:bg-orange-800/50 rounded-sm" />
              <div className="w-2 h-2 bg-orange-500 dark:bg-orange-700/70 rounded-sm" />
              <div className="w-2 h-2 bg-orange-600 dark:bg-orange-600/80 rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </div>
        
        {/* 모바일 스켈레톤 */}
        <div className="md:hidden">
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-1">
              {dayLabels.map((_, i) => (
                <div key={i} className="w-4 h-3 bg-muted-foreground/10 animate-pulse rounded-sm" />
              ))}
            </div>
            {Array.from({ length: 12 }, (_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm bg-muted-foreground/10 animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* 데스크톱 스켈레톤 */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[800px] space-y-1">
            <div className="flex gap-1 text-xs text-muted-foreground/60 mb-2">
              {desktopMonthLabels.map((month) => (
                <div key={month.index} className="w-12 text-left">
                  {month.name}
                </div>
              ))}
            </div>
            
            <div className="flex gap-1">
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/10 animate-pulse"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-light text-foreground">
          {isMobile ? "최근 활동" : `${new Date().getFullYear()}년 스터디 활동`}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-background border border-border/20 dark:bg-muted/20 rounded-sm" />
            <div className="w-2 h-2 bg-orange-200 dark:bg-orange-900/30 rounded-sm" />
            <div className="w-2 h-2 bg-orange-400 dark:bg-orange-800/50 rounded-sm" />
            <div className="w-2 h-2 bg-orange-500 dark:bg-orange-700/70 rounded-sm" />
            <div className="w-2 h-2 bg-orange-600 dark:bg-orange-600/80 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      {/* 모바일 히트맵 - 최근 12주만 표시, 가로 스크롤 없음 */}
      <div className="md:hidden">
        <div className="flex gap-0.5">
          {/* 요일 라벨 */}
          <div className="flex flex-col gap-0.5 pr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="w-4 h-3 text-[8px] text-muted-foreground/60 flex items-center">
                {i % 2 === 1 ? label : ""}
              </div>
            ))}
          </div>
          
          {/* 히트맵 그리드 */}
          {mobileHeatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((dayData, dayIndex) => (
                <div
                  key={dayData.date || `${weekIndex}-${dayIndex}`}
                  className={`
                    w-3 h-3 rounded-sm transition-colors
                    ${dayData.isFuture 
                      ? "bg-transparent" 
                      : getLevelColorClass(dayData.level, dayData.isToday)
                    }
                  `}
                  title={dayData.date ? `${dayData.date}${dayData.hasActivity ? ` - ${dayData.usageHours}시간 이용` : " - 이용 없음"}` : ""}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* 모바일 월 라벨 */}
        <div className="flex gap-0.5 mt-1 pl-5">
          {mobileMonthLabels.map((label, i) => (
            <div key={i} className="w-3 text-[8px] text-muted-foreground/60">
              {label}
            </div>
          ))}
        </div>
      </div>
      
      {/* 데스크톱 히트맵 - 전체 연도 표시 */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[800px] space-y-1">
          <div className="flex gap-1 text-xs text-muted-foreground/60 mb-2">
            {desktopMonthLabels.map((month) => (
              <div key={month.index} className="w-12 text-left">
                {month.name}
              </div>
            ))}
          </div>
          
          <div className="flex gap-1">
            {desktopHeatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week.find(day => day.dayOfWeek === dayIndex);
                  
                  if (!dayData) {
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="w-2.5 h-2.5"
                      />
                    );
                  }
                  
                  return (
                    <div
                      key={dayData.date}
                      className={`
                        w-2.5 h-2.5 rounded-sm transition-colors cursor-pointer hover:scale-110
                        ${getLevelColorClass(dayData.level, dayData.isToday)}
                      `}
                      title={`${dayData.date}${dayData.hasActivity ? ` - ${dayData.usageHours}시간 이용` : " - 이용 없음"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};