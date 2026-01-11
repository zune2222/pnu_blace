import { SkeletonCard } from '@/shared/ui';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* 현재 좌석 위젯 스켈레톤 */}
          <SkeletonCard className="h-48" />

          {/* 그리드 스켈레톤 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
