import { PrefetchBoundary } from '@/shared/api';
import { prefetchDashboardPage } from '@/entities/dashboard/api/server-prefetch';
import { DashboardPage, DashboardSkeleton } from '@/features/dashboard';

export default function Dashboard() {
  return (
    <PrefetchBoundary prefetch={prefetchDashboardPage} fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </PrefetchBoundary>
  );
}

export const dynamic = 'force-dynamic';
