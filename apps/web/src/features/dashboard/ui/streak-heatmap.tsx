"use client";
import React from "react";

interface StreakHeatmapProps {
  currentStreak: number;
  lastStudyDate?: string;
  className?: string;
}

// 최근 30일간의 히트맵 데이터 생성 (시뮬레이션)
const generateHeatmapData = (currentStreak: number, lastStudyDate?: string) => {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 현재 연속일 기간 내에 있는지 확인
    const isInCurrentStreak = i < currentStreak;
    
    // 간단한 시뮬레이션: 현재 연속성 기간에는 활동, 그 외에는 랜덤
    const hasActivity = isInCurrentStreak || Math.random() > 0.7;
    
    days.push({
      date: date.toISOString().split('T')[0],
      hasActivity,
      isToday: i === 0,
    });
  }
  
  return days;
};

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  currentStreak,
  lastStudyDate,
  className = "",
}) => {
  const heatmapData = generateHeatmapData(currentStreak, lastStudyDate);
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-light text-foreground">최근 30일 활동</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-border/20 rounded-sm" />
            <div className="w-2 h-2 bg-orange-200 rounded-sm" />
            <div className="w-2 h-2 bg-orange-400 rounded-sm" />
            <div className="w-2 h-2 bg-orange-500 rounded-sm" />
            <div className="w-2 h-2 bg-orange-600 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="grid grid-cols-10 gap-1">
        {heatmapData.map((day, index) => (
          <div
            key={day.date}
            className={`
              w-3 h-3 rounded-sm transition-colors
              ${day.hasActivity 
                ? day.isToday 
                  ? "bg-orange-600 ring-1 ring-orange-300" 
                  : "bg-orange-500 hover:bg-orange-600" 
                : "bg-border/20 hover:bg-border/40"
              }
            `}
            title={`${day.date}${day.hasActivity ? " - 스터디 활동" : " - 활동 없음"}`}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground/60">
        <span>{heatmapData[0]?.date}</span>
        <span>오늘</span>
      </div>
    </div>
  );
};