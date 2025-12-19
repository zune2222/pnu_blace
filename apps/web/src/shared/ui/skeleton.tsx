import React from "react";
import { cn } from "@/shared/lib/utils";

// 기본 Skeleton 컴포넌트
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-muted-foreground/10",
        className
      )}
    />
  );
}

// 텍스트 라인 Skeleton
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

// 카드 Skeleton
interface SkeletonCardProps {
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

export function SkeletonCard({ className, hasHeader = true, hasFooter = false }: SkeletonCardProps) {
  return (
    <div className={cn("border border-border/20 rounded-lg p-6 space-y-4", className)}>
      {hasHeader && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      )}
      <SkeletonText lines={3} />
      {hasFooter && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      )}
    </div>
  );
}

// 리스트 아이템 Skeleton
interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 5, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-border/20 rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

// 테이블 Skeleton
interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted-foreground/5 rounded-lg">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// 통계 카드 Skeleton
export function SkeletonStats({ className }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-2 p-6 border border-border/20 rounded-lg">
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>
  );
}
