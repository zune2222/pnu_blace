"use client";

import React, { useState } from "react";
import { useGroupStreakStats } from "@/entities/study";
import { useAuth } from "@/entities/auth";
import { MemberUsageHistoryModal } from "./member-usage-history-modal";
import { Emoji } from "@/shared/ui";

interface StudyOverallStatsProps {
  groupId: string;
}

const StreakRankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank > 3) return null;
  const medals = ["🥇", "🥈", "🥉"];
  return <Emoji className="ml-1">{medals[rank - 1]!}</Emoji>;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
};

export const StudyOverallStats: React.FC<StudyOverallStatsProps> = ({
  groupId,
}) => {
  const { isAuthenticated } = useAuth();
  const { data: streakStats, isLoading } = useGroupStreakStats(
    groupId,
    isAuthenticated
  );
  const [selectedMember, setSelectedMember] = useState<{
    memberId: string;
    displayName: string;
  } | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="py-8 border-b border-border/20">
        <h2 className="text-lg font-light text-foreground mb-4">
          <Emoji>📊</Emoji> 스터디 전체 통계
        </h2>
        <div className="bg-muted-foreground/5 rounded-lg p-6 text-center">
          <p className="text-muted-foreground/60 font-light">
            로그인하면 전체 통계를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-8 border-b border-border/20">
        <h2 className="text-lg font-light text-foreground mb-4">
          <Emoji>📊</Emoji> 스터디 전체 통계
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
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
      </div>
    );
  }

  if (!streakStats || streakStats.length === 0) {
    return (
      <div className="py-8 border-b border-border/20">
        <h2 className="text-lg font-light text-foreground mb-4">
          <Emoji>📊</Emoji> 스터디 전체 통계
        </h2>
        <div className="bg-muted-foreground/5 rounded-lg p-6 text-center">
          <p className="text-muted-foreground/60 font-light">
            아직 출석 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  // 연속 출석 기준 정렬 (현재 스트릭 → 최장 스트릭)
  const sortedMembers = [...streakStats].sort((a, b) => {
    if (b.currentStreak !== a.currentStreak) {
      return b.currentStreak - a.currentStreak;
    }
    return b.longestStreak - a.longestStreak;
  });

  // 통계 요약
  const totalMembers = streakStats.length;
  const avgCurrentStreak =
    streakStats.reduce((sum, m) => sum + m.currentStreak, 0) / totalMembers;
  const maxStreak = Math.max(...streakStats.map((m) => m.longestStreak));
  const activeMembers = streakStats.filter((m) => m.currentStreak > 0).length;

  return (
    <div className="py-8 border-b border-border/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-base md:text-lg font-light text-foreground">
          <Emoji>📊</Emoji> 스터디 전체 통계
        </h2>
        <div className="text-sm text-muted-foreground/60 font-light">
          활성 멤버 {activeMembers}/{totalMembers}명
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-muted-foreground/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-light text-orange-500">
            {avgCurrentStreak.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground/50 font-light mt-1">
            평균 스트릭
          </p>
        </div>
        <div className="bg-muted-foreground/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-light text-foreground">{maxStreak}</p>
          <p className="text-xs text-muted-foreground/50 font-light mt-1">
            최장 스트릭
          </p>
        </div>
        <div className="bg-muted-foreground/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-light text-green-500">{activeMembers}</p>
          <p className="text-xs text-muted-foreground/50 font-light mt-1">
            연속 출석 중
          </p>
        </div>
        <div className="bg-muted-foreground/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-light text-foreground">{totalMembers}</p>
          <p className="text-xs text-muted-foreground/50 font-light mt-1">
            전체 멤버
          </p>
        </div>
      </div>

      {/* 멤버별 스트릭 랭킹 */}
      <div className="bg-background border border-border/20 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted-foreground/5 text-xs text-muted-foreground/60 font-light border-b border-border/10">
          <div className="col-span-1">#</div>
          <div className="col-span-4">멤버</div>
          <div className="col-span-2 text-center"><Emoji>🔥</Emoji> 현재</div>
          <div className="col-span-2 text-center"><Emoji>🏆</Emoji> 최장</div>
          <div className="col-span-3 text-center hidden sm:block">마지막 출석</div>
        </div>

        <div className="divide-y divide-border/10">
          {sortedMembers.map((member, index) => (
            <button
              key={member.studentId}
              onClick={() =>
                setSelectedMember({
                  memberId: member.memberId || member.studentId,
                  displayName: member.displayName,
                })
              }
              className="w-full grid grid-cols-12 gap-2 px-4 py-3 hover:bg-muted-foreground/5 transition-colors text-left"
            >
              <div className="col-span-1 text-sm text-muted-foreground/60 font-light flex items-center">
                {index + 1}
                <StreakRankBadge rank={index + 1} />
              </div>
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-muted-foreground/10 flex items-center justify-center text-xs font-light text-muted-foreground/60">
                  {member.displayName.charAt(0)}
                </div>
                <span className="text-sm font-light text-foreground truncate">
                  {member.displayName}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span
                  className={`text-sm font-light ${
                    member.currentStreak > 0
                      ? "text-orange-500"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {member.currentStreak}일
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-light text-foreground">
                  {member.longestStreak}일
                </span>
              </div>
              <div className="col-span-3 text-center hidden sm:block">
                <span className="text-xs text-muted-foreground/50 font-light">
                  {formatDate(member.lastAttendanceDate)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 상세 이력 모달 */}
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
