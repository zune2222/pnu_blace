"use client";

import React from "react";
import Link from "next/link";
import { StudyGroupListItem } from "@pnu-blace/types";
import { VisibilityBadge, Emoji } from "@/shared/ui";

interface StudyCardProps {
  study: StudyGroupListItem;
}

export const StudyCard: React.FC<StudyCardProps> = ({ study }) => {
  const memberRatio = study.maxMembers
    ? `${study.memberCount}/${study.maxMembers}명`
    : `${study.memberCount}명`;


  return (
    <Link href={`/study/${study.groupId}`}>
      <div className="group bg-background border border-border/20 rounded-lg p-6 hover:border-border/40 transition-all duration-200 cursor-pointer">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <VisibilityBadge visibility={study.visibility} />
            </div>
            <h3 className="text-lg font-light text-foreground group-hover:text-foreground/80 transition-colors break-keep">
              {study.name}
            </h3>
          </div>
        </div>

        {/* 설명 */}
        {study.description && (
          <p className="text-sm text-muted-foreground/60 font-light mb-4 line-clamp-2 break-keep">
            {study.description}
          </p>
        )}

        {/* 출퇴근 시간 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground/50 font-light mb-4">
          <span>
            출근 {study.checkInStartTime}~{study.checkInEndTime}
          </span>
          <span>퇴근 {study.checkOutMinTime}~</span>
        </div>

        {/* 태그 */}
        {study.tags && study.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {study.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-muted-foreground/5 rounded text-xs text-muted-foreground/60 font-light"
              >
                #{tag}
              </span>
            ))}
            {study.tags.length > 3 && (
              <span className="text-xs text-muted-foreground/40 font-light">
                +{study.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 푸터 */}
        <div className="flex items-center justify-between pt-4 border-t border-border/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/60 font-light">
            <span>👥</span>
            <span>{memberRatio}</span>
          </div>

          {study.todayAttendanceRate !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground/60 font-light">
              <Emoji>📊</Emoji>
              <span>오늘 출석률 {study.todayAttendanceRate}%</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
