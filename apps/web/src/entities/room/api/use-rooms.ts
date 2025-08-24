import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { RoomInfo } from "@pnu-blace/types";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async (): Promise<RoomInfo[]> => {
      return apiClient.getRooms();
    },
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    refetchInterval: 1000 * 60 * 2, // 2분마다 자동 refetch
  });
};