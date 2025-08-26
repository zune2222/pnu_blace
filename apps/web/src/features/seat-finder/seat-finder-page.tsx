"use client";

import { useRouter } from "next/navigation";
import { useRooms, RoomInfo } from "@/entities/room";
import { RoomList } from "./ui/room-list";

export const SeatFinderPage = () => {
  const router = useRouter();
  const { data: rooms, isLoading, error } = useRooms();

  const handleRoomSelect = (room: RoomInfo) => {
    // 선택한 열람실의 좌석 상세 페이지로 이동
    router.push(`/seats/${room.roomNo}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-b border-border/20">
          <div className="py-10 md:py-10">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-extralight text-foreground leading-tight">
                    좌석 찾기
                  </h1>
                  <p className="text-lg text-muted-foreground/70 font-light leading-relaxed">
                    원하는 열람실을 선택하여 좌석을 예약하세요
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-extralight text-foreground">
                        열람실 현황
                      </h2>
                      <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                        Reading Rooms
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground/60 font-light">
                      {rooms && `총 ${rooms.length}개 열람실`}
                    </div>
                  </div>

                  {/* 범례 */}
                  <div className="bg-background border border-border/20 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-foreground mb-4 tracking-wide uppercase">
                      이용률 기준
                    </h3>
                    <div className="flex flex-wrap gap-6 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
                        <span className="text-green-600 dark:text-green-400 font-light">
                          여유 (30% 미만)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30"></div>
                        <span className="text-amber-600 dark:text-amber-400 font-light">
                          보통 (30-70%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                        <span className="text-red-600 dark:text-red-400 font-light">
                          혼잡 (70% 이상)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 열람실 목록 섹션 */}
        <div className="py-10 md:py-10">
          <div className="max-w-4xl mx-auto">
            <RoomList
              rooms={rooms || []}
              isLoading={isLoading}
              error={error}
              onRoomSelect={handleRoomSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
