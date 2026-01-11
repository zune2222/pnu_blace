import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { serverFetch } from '@/shared/api/server';
import { AUTH_COOKIE_KEY } from '@/shared/lib/cookie-token';
import { dashboardKeys } from '../model/queries';
import { CurrentSeat, MyStatsData, MyRankData } from '../model/types';

/**
 * 인증 토큰 존재 여부 확인
 */
async function hasAuthToken(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get(AUTH_COOKIE_KEY)?.value;
}

/**
 * 현재 좌석 prefetch (인증 필요)
 */
export async function prefetchCurrentSeat(queryClient: QueryClient): Promise<void> {
  if (!(await hasAuthToken())) return;

  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.currentSeat(),
    queryFn: () =>
      serverFetch<CurrentSeat>('/api/v1/seats/my-seat', {
        revalidate: 30,
        tags: ['dashboard', 'my-seat'],
      }),
    staleTime: 1000 * 30,
  });
}

/**
 * 개인 통계 prefetch (인증 필요)
 */
export async function prefetchMyStats(queryClient: QueryClient): Promise<void> {
  if (!(await hasAuthToken())) return;

  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.myStats(),
    queryFn: () =>
      serverFetch<MyStatsData>('/api/v1/stats/me', {
        revalidate: 300,
        tags: ['dashboard', 'my-stats'],
      }),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 내 랭킹 prefetch (인증 필요)
 */
export async function prefetchMyRank(queryClient: QueryClient): Promise<void> {
  if (!(await hasAuthToken())) return;

  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.myRank(),
    queryFn: () =>
      serverFetch<MyRankData>('/api/v1/stats/my-rank', {
        revalidate: 300,
        tags: ['dashboard', 'my-rank'],
      }),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 대시보드 페이지 전체 prefetch (병렬 실행)
 * 인증되지 않은 사용자는 자동으로 스킵됨
 */
export async function prefetchDashboardPage(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    prefetchCurrentSeat(queryClient),
    prefetchMyStats(queryClient),
    prefetchMyRank(queryClient),
  ]);
}
