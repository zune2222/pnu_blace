"use client";

import React, { useState } from "react";
import { TodayAttendancePublic } from "@pnu-blace/types";
import { MemberStreakStats } from "@/entities/study/api/study-api";
import { AttendanceStatusBadge, Emoji } from "@/shared/ui";
import { MemberUsageHistoryModal } from "./member-usage-history-modal";

interface AttendanceListProps {
  groupId: string;
  attendance: TodayAttendancePublic[];
  streakStats?: MemberStreakStats[];
  isLoading?: boolean;
}

const formatMinutes = (minutes?: number): string => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
};


// 연속성 표시 컴포넌트
const StreakBadge: React.FC<{ currentStreak: number }> = ({ currentStreak }) => {
  if (currentStreak === 0) return null;

  return (
    <span className="text-xs text-orange-500 font-light ml-2 inline-flex items-center gap-1">
      <Emoji>🔥</Emoji> {currentStreak}일 스트릭
    </span>
  );
};

export const AttendanceList: React.FC<AttendanceListProps> = ({
  groupId,
  attendance,
  streakStats,
  isLoading,
}) => {
  const [selectedMember, setSelectedMember] = useState<{
    memberId: string;
    displayName: string;
  } | null>(null);
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
      {sortedAttendance.map((member) => {
        // 해당 멤버의 연속성 정보 찾기 (memberId로 매칭, 없으면 displayName으로 매칭)
        const memberStreak = streakStats?.find(
          (streak) => 
            streak.memberId === member.memberId || 
            streak.displayName === member.displayName
        );

        return (
          <div
            key={member.memberId}
            className="flex items-center justify-between py-3 border-b border-border/10 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center text-sm font-light text-muted-foreground/60">
                {member.displayName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-sm font-light text-foreground">
                    {member.displayName}
                  </p>
                  {memberStreak && (
                    <StreakBadge currentStreak={memberStreak.currentStreak} />
                  )}
                </div>
                {member.checkInTime && (
                  <p className="text-xs text-muted-foreground/50 font-light">
                    {member.checkInTime} 출근
                    {member.checkOutTime && ` → ${member.checkOutTime} 퇴근`}
                    {member.isCurrentlyIn && (
                      <span className="ml-2 text-green-500">• 이용 중</span>
                    )}
                  </p>
                )}
                {memberStreak && memberStreak.longestStreak > memberStreak.currentStreak && (
                  <p className="text-xs text-muted-foreground/40 font-light">
                    최고 스트릭: {memberStreak.longestStreak}일
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
              <button
                onClick={() => setSelectedMember({ 
                  memberId: member.memberId, 
                  displayName: member.displayName 
                })}
                className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded"
                title="출석 이력 보기"
              >
                <Emoji>📊</Emoji>
              </button>
              <AttendanceStatusBadge status={member.status} />
            </div>
          </div>
        );
      })}
      
      {/* Member Usage History Modal */}
      {selectedMember && (
        <MemberUsageHistoryModal
          groupId={groupId}
          memberId={selectedMember.memberId}
          displayName={selectedMember.displayName}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};
