import { QueryClient } from '@tanstack/react-query';
import { serverPublicFetch } from '@/shared/api/server';
import { rankingsKeys } from '../model/queries';
import { AllTimeRankingsData, WeeklyRankingsData } from '../model/types';

/**
 * 전체 랭킹 prefetch
 */
export async function prefetchAllTimeRankings(
  queryClient: QueryClient,
  page: number = 1,
  limit: number = 20
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: rankingsKeys.allTime(page),
    queryFn: () =>
      serverPublicFetch<AllTimeRankingsData>(
        `/api/v1/stats/rankings/all-time?page=${page}&limit=${limit}`,
        { revalidate: 60, tags: ['rankings', 'all-time'] }
      ),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 주간 랭킹 prefetch
 */
export async function prefetchWeeklyRankings(
  queryClient: QueryClient,
  page: number = 1,
  limit: number = 20
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: rankingsKeys.weekly(page),
    queryFn: () =>
      serverPublicFetch<WeeklyRankingsData>(
        `/api/v1/stats/rankings/weekly?page=${page}&limit=${limit}`,
        { revalidate: 60, tags: ['rankings', 'weekly'] }
      ),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 랭킹 페이지 전체 prefetch (병렬 실행)
 */
export async function prefetchRankingsPage(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    prefetchAllTimeRankings(queryClient),
    prefetchWeeklyRankings(queryClient),
  ]);
}
