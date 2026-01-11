import { Suspense, ReactNode } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/lib/query-client';

interface PrefetchBoundaryProps {
  /** prefetch 함수 (queryClient를 받아서 데이터를 미리 가져옴) */
  prefetch: (queryClient: QueryClient) => Promise<void>;
  /** 로딩 중 보여줄 fallback UI */
  fallback: ReactNode;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

/**
 * Server Component용 Prefetch + Hydration 래퍼
 *
 * @example
 * ```tsx
 * export default function Page() {
 *   return (
 *     <PrefetchBoundary
 *       prefetch={prefetchRankingsPage}
 *       fallback={<RankingsSkeleton />}
 *     >
 *       <RankingsPage />
 *     </PrefetchBoundary>
 *   );
 * }
 * ```
 */
export async function PrefetchBoundary({
  prefetch,
  fallback,
  children,
}: PrefetchBoundaryProps) {
  const queryClient = getQueryClient();

  await prefetch(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </HydrationBoundary>
  );
}
