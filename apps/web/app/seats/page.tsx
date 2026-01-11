import { PrefetchBoundary } from '@/shared/api';
import { prefetchRooms } from '@/entities/room/api/server-prefetch';
import { SeatFinderPage, SeatsSkeleton } from '@/features/seat-finder';

export default function SeatsPage() {
  return (
    <PrefetchBoundary prefetch={prefetchRooms} fallback={<SeatsSkeleton />}>
      <SeatFinderPage />
    </PrefetchBoundary>
  );
}

export const revalidate = 120;
