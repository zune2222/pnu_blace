import { SkeletonCard } from '@/shared/ui';

export function RankingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">
          {/* 헤더 스켈레톤 */}
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded w-48 animate-pulse" />
            <div className="h-6 bg-muted rounded w-72 animate-pulse" />
          </div>

          {/* 내 랭킹 카드 스켈레톤 */}
          <SkeletonCard className="h-32" />

          {/* 탭 스켈레톤 */}
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded w-24 animate-pulse" />
            <div className="h-10 bg-muted rounded w-24 animate-pulse" />
          </div>

          {/* 랭킹 리스트 스켈레톤 */}
          <SkeletonCard className="h-96" />
        </div>
      </div>
    </div>
  );
}
