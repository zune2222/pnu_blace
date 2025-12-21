import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api";
import { RoomInfo } from "@pnu-blace/types";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async (): Promise<RoomInfo[]> => {
      // 공개 API - 비로그인 상태에서도 조회 가능
      return apiClient.publicGet<RoomInfo[]>("/api/v1/rooms");
    },
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    refetchInterval: 1000 * 60 * 2, // 2분마다 자동 refetch
  });
};
