import { QueryClient } from '@tanstack/react-query';
import { serverPublicFetch } from '@/shared/api/server';
import { RoomInfo } from '@pnu-blace/types';

/**
 * 열람실 목록 prefetch
 */
export async function prefetchRooms(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['rooms'],
    queryFn: () =>
      serverPublicFetch<RoomInfo[]>('/api/v1/rooms', {
        revalidate: 120, // 2분 캐시
        tags: ['rooms'],
      }),
    staleTime: 1000 * 60 * 5,
  });
}
