import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { dashboardKeys } from "@/entities/dashboard/model/queries";
import { DashboardPage } from "@/features/dashboard";
import { SkeletonCard } from "@/shared/ui";

// 대시보드 스켈레톤 컴포넌트
function DashboardSkeleton() {
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

// Server Component - 데이터 prefetch
export default async function Dashboard() {
  const queryClient = getQueryClient();
  
  // 비로그인 사용자는 prefetch 스킵 (쿠키 기반 인증 시 여기서 체크 가능)
  // 현재는 클라이언트에서 인증 체크하므로 빈 상태로 hydrate
  // 추후 서버 사이드 인증 체크 추가 가능
  
  // dehydrate로 클라이언트에 캐시 상태 전달
  const dehydratedState = dehydrate(queryClient);
  
  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPage />
      </Suspense>
    </HydrationBoundary>
  );
}