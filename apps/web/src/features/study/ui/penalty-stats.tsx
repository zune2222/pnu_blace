"use client";

import React from "react";
import { StudyGroupDetail } from "@pnu-blace/types";

interface PenaltyStatsProps {
  study: StudyGroupDetail;
}

// 임시로 members에서 벌점 데이터를 가져옴 (실제로는 별도 API 필요할 수 있음)
// study.members에 벌점 필드가 없으므로, 이 컴포넌트는 추후 백엔드에 벌점 조회 API가 노출되면 수정해야 함

export const PenaltyStats: React.FC<PenaltyStatsProps> = ({ study }) => {
  // 현재 members에 벌점 정보가 없으므로 placeholder 표시
  // 실제 구현 시 penalty.service.ts의 getGroupPenaltyStats를 호출하는 API 및 hook 필요

  return (
    <div className="py-8 border-b border-border/20">
      <h2 className="text-lg font-light text-foreground mb-4">
        ⚠️ 벌점 현황
      </h2>

      <div className="bg-background border border-border/20 rounded-lg overflow-hidden">
        {/* 벌점 규칙 안내 */}
        <div className="px-4 py-3 bg-muted-foreground/5 border-b border-border/10">
          <p className="text-xs text-muted-foreground/60 font-light">
            지각 1점 · 결석 2점 · 조퇴 1점 | 매월 1일 리셋
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {study.members.map((member) => (
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
                  <span className="text-sm font-light text-muted-foreground/50">
                    0점
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground/50 font-light text-center">
            💡 벌점 데이터는 출석 동기화 시 자동으로 업데이트됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
