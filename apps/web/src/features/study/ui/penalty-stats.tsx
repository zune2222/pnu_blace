"use client";

import React from "react";
import { useGroupPenalties } from "@/entities/study";

interface PenaltyStatsProps {
  groupId: string;
}

export const PenaltyStats: React.FC<PenaltyStatsProps> = ({ groupId }) => {
  const { data: penaltyStats, isLoading } = useGroupPenalties(groupId);

  // 벌점 수에 따른 색상 결정
  const getPenaltyColor = (points: number) => {
    if (points === 0) return "text-muted-foreground/50";
    if (points < 5) return "text-yellow-500";
    if (points < 10) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="py-8 border-b border-border/20">
      <h2 className="text-lg font-light text-foreground mb-4">
        벌점 현황
      </h2>

      <div className="bg-background border border-border/20 rounded-lg overflow-hidden">
        {/* 벌점 규칙 안내 */}
        <div className="px-4 py-3 bg-muted-foreground/5 border-b border-border/10">
          <p className="text-xs text-muted-foreground/60 font-light">
            지각 1점 · 결석 2점 · 조퇴 1점 | 매월 1일 리셋
          </p>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted-foreground/5 rounded-lg animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted-foreground/20" />
                    <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
                  </div>
                  <div className="h-4 w-8 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
          ) : penaltyStats && penaltyStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {penaltyStats.map((member) => (
                <div
                  key={member.memberId}
                  className="flex items-center justify-between p-3 bg-muted-foreground/5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted-foreground/10 flex items-center justify-center text-xs font-light text-muted-foreground/60">
                      {member.displayName.charAt(0)}
                    </div>
                    <span className="text-sm font-light text-foreground">
                      {member.displayName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getPenaltyColor(member.currentPenaltyPoints)}`}>
                      {member.currentPenaltyPoints}점
                    </span>
                    {member.totalPenaltyPoints > 0 && (
                      <span className="text-xs text-muted-foreground/40 ml-1">
                        (누적 {member.totalPenaltyPoints})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground/50 text-sm py-4">
              벌점 데이터가 없습니다.
            </p>
          )}

          <p className="mt-4 text-xs text-muted-foreground/50 font-light text-center">
            벌점 데이터는 출석 동기화 시 자동으로 업데이트됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
