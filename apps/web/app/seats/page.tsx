import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { SeatFinderPage } from "@/features/seat-finder";
import { SkeletonCard } from "@/shared/ui";

// 좌석 찾기 스켈레톤 컴포넌트
function SeatsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="space-y-8">
          {/* 헤더 스켈레톤 */}
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded w-48 animate-pulse" />
            <div className="h-6 bg-muted rounded w-72 animate-pulse" />
          </div>
          
          {/* 열람실 목록 스켈레톤 */}
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Server Component - 데이터 prefetch
export default async function SeatsPage() {
  const queryClient = getQueryClient();
  
  // dehydrate로 클라이언트에 캐시 상태 전달
  const dehydratedState = dehydrate(queryClient);
  
  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<SeatsSkeleton />}>
        <SeatFinderPage />
      </Suspense>
    </HydrationBoundary>
  );
}