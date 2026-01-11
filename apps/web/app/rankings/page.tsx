import { PrefetchBoundary } from '@/shared/api';
import { prefetchRankingsPage } from '@/entities/rankings/api/server-prefetch';
import { RankingsPage, RankingsSkeleton } from '@/features/rankings';

export default function Rankings() {
  return (
    <PrefetchBoundary prefetch={prefetchRankingsPage} fallback={<RankingsSkeleton />}>
      <RankingsPage />
    </PrefetchBoundary>
  );
}

export const revalidate = 60;
