"use client";

import React from "react";
import { Users } from "lucide-react";

export const QueueEmptyState: React.FC = () => {
  return (
    <div className="py-6 border-b border-border/10">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="text-muted-foreground/70">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400">
            QUEUE
          </span>
        </div>

        <h3 className="text-lg font-light text-foreground">
          빈자리 예약 대기열
        </h3>

        <p className="text-base text-muted-foreground/80 font-light leading-relaxed pl-8">
          현재 대기열에 등록된 요청이 없습니다
        </p>
      </div>
    </div>
  );
};