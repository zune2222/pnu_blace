"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface StreakHeatmapProps {
  className?: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  streakHistory: Array<{
    date: string;
    hasActivity: boolean;
    usageHours: number;
    level: number; // 0-4 색상 강도 레벨
  }>;
}

// 년 단위 히트맵 데이터 생성 (GitHub 스타일)
const generateYearlyHeatmapData = (streakData?: StreakData) => {
  const weeks = [];
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  // 올해 첫날이 몇 번째 요일인지 계산 (일요일 = 0)
  const startDayOfWeek = startOfYear.getDay();
  
  // 첫 주 시작일 계산 (일요일부터 시작)
  const firstSunday = new Date(startOfYear);
  firstSunday.setDate(startOfYear.getDate() - startDayOfWeek);
  
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
  
  // 53주 계산 (최대)
  for (let week = 0; week < 53; week++) {
    const weekData = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(firstSunday);
      currentDate.setDate(firstSunday.getDate() + (week * 7) + day);
      
      // 올해 범위를 벗어나면 중단
      if (currentDate.getFullYear() > today.getFullYear()) {
        break;
      }
      
      // 미래 날짜면 중단
      if (currentDate > today) {
        break;
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
      });
    }
    
    if (weekData.length > 0) {
      weeks.push(weekData);
    }
  }
  
  return weeks;
};

// 월별 라벨 생성
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

// 레벨에 따른 색상 클래스 반환
const getLevelColorClass = (level: number, isToday: boolean) => {
  if (isToday && level > 0) {
    return "ring-1 ring-orange-300 " + getLevelBgClass(level);
  }
  
  return getLevelBgClass(level);
};

const getLevelBgClass = (level: number) => {
  switch (level) {
    case 0: return "bg-background border border-border/20 dark:bg-muted/20";      // 이용 없음
    case 1: return "bg-orange-200 dark:bg-orange-900/30";                         // 1-2시간
    case 2: return "bg-orange-400 dark:bg-orange-800/50";                         // 3-5시간
    case 3: return "bg-orange-500 dark:bg-orange-700/70";                         // 6-8시간
    case 4: return "bg-orange-600 dark:bg-orange-600/80";                         // 9시간 이상
    default: return "bg-background border border-border/20 dark:bg-muted/20";
  }
};

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  className = "",
}) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<StreakData>('/api/v1/stats/streak/heatmap');
        setStreakData(response);
      } catch (error) {
        console.error('스트릭 데이터 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  const yearlyHeatmapData = generateYearlyHeatmapData(streakData || undefined);
  const monthLabels = getMonthLabels();
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-light text-foreground">{new Date().getFullYear()}년 스터디 활동</h4>
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
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px] space-y-1">
            <div className="flex gap-1 text-xs text-muted-foreground/60 mb-2">
              {monthLabels.map((month) => (
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
        <h4 className="text-sm font-light text-foreground">{new Date().getFullYear()}년 스터디 활동</h4>
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
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-1">
          <div className="flex gap-1 text-xs text-muted-foreground/60 mb-2">
            {monthLabels.map((month) => (
              <div key={month.index} className="w-12 text-left">
                {month.name}
              </div>
            ))}
          </div>
          
          <div className="flex gap-1">
            {yearlyHeatmapData.map((week, weekIndex) => (
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