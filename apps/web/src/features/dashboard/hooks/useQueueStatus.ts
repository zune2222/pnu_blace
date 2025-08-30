"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueueStatusDto } from "@pnu-blace/types";
import { dashboardApi } from "@/entities/dashboard/api";
import { toast } from "sonner";

export const useQueueStatus = () => {
  const queryClient = useQueryClient();

  const queueQuery = useQuery({
    queryKey: ["queueStatus"],
    queryFn: async (): Promise<QueueStatusDto | null> => {
      try {
        const status = await dashboardApi.getQueueStatus();
        return status;
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message?.includes("찾을 수 없습니다")
        ) {
          return null;
        } else {
          console.warn("대기열 상태 로드 실패:", error);
          throw error;
        }
      }
    },
    refetchInterval: 10000,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await dashboardApi.cancelQueueRequest();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queueStatus"] });
      toast.success("빈자리 예약 대기열에서 취소되었습니다");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "알 수 없는 오류";
      toast.error("취소 요청에 실패했습니다: " + message);
    },
  });

  return {
    queueStatus: queueQuery.data,
    isLoading: queueQuery.isLoading,
    error: queueQuery.error,
    cancelQueue: () => cancelMutation.mutate(),
    isCanceling: cancelMutation.isPending,
  };
};
