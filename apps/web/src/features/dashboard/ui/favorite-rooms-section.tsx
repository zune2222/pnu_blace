"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ReadingRoomInfo } from "@/entities/dashboard";
import { useFavoriteRooms, useToggleFavorite } from "@/entities/favorite";
import { FavoriteHeart } from "@/shared/ui";

interface FavoriteRoomsSectionProps {
  // 의존성 주입을 위한 선택적 props
  favoriteRooms?: ReadingRoomInfo[] | null;
  isLoading?: boolean;
  error?: string | null;
  toggleFavorite?: (roomId: string, isFavorite: boolean) => Promise<void>;
}

export const FavoriteRoomsSection: React.FC<FavoriteRoomsSectionProps> = ({
  favoriteRooms: injectedFavoriteRooms,
  isLoading: injectedIsLoading,
  error: injectedError,
  toggleFavorite: injectedToggleFavorite,
}) => {
  const router = useRouter();
  
  // 의존성 주입된 데이터가 없으면 내부 훅 사용
  const {
    data: hookFavoriteRooms,
    isLoading: hookIsLoading,
    error: hookError,
  } = useFavoriteRooms();

  const toggleFavoriteMutation = useToggleFavorite();

  // 의존성 주입된 값이 있으면 사용, 없으면 훅에서 가져온 값 사용
  const favoriteRooms = injectedFavoriteRooms || hookFavoriteRooms || [];
  const isLoading = injectedIsLoading ?? hookIsLoading;
  const error =
    injectedError || (hookError instanceof Error ? hookError.message : null);

  // 즐겨찾기 토글 핸들러 (roomNo 기반)
  const handleToggleFavorite = async (
    roomNo: string,
    currentFavorite: boolean
  ) => {
    try {
      if (injectedToggleFavorite) {
        // 의존성 주입된 함수 사용
        await injectedToggleFavorite(roomNo, !currentFavorite);
      } else {
        // 내부 뮤테이션 사용
        await toggleFavoriteMutation.mutateAsync({
          roomNo,
          isFavorite: !currentFavorite,
        });
      }
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
    }
  };

  const handleRoomClick = (roomNo: string) => {
    router.push(`/seats/${roomNo}`);
  };

  const getOccupancyText = (rate: number) => {
    if (rate < 50) return "여유";
    if (rate < 75) return "보통";
    return "혼잡";
  };

  return (
    <section className="py-16 md:py-20 lg:pr-12">
      <div className="space-y-12">
        {/* 섹션 헤더 */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            즐겨찾는 열람실
          </h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Favorites
          </p>
        </div>

        {/* 로딩 및 에러 상태 */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg text-muted-foreground font-light">
              즐겨찾기 열람실을 불러오는 중...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-lg text-red-600 font-light">{error}</div>
          </div>
        ) : (
          /* 열람실 목록 */
          <div className="space-y-8">
            {favoriteRooms.map((room) => (
              <div
                key={room.roomNo}
                className="group cursor-pointer py-4 border-b border-border/10 last:border-b-0"
                onClick={() => handleRoomClick(room.roomNo)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-light text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                      {room.roomName}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground/70 font-light">
                        {room.totalSeats - room.availableSeats}/
                        {room.totalSeats}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium tracking-wide ${
                          room.occupancyRate < 50
                            ? "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                            : room.occupancyRate < 75
                              ? "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
                              : "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                        }`}
                      >
                        {getOccupancyText(room.occupancyRate)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-4">
                    <div className="w-16 h-1 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          room.occupancyRate < 50
                            ? "bg-green-500"
                            : room.occupancyRate < 75
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${room.occupancyRate}%` }}
                      />
                    </div>
                    <FavoriteHeart
                      isFavorite={room.isFavorite || false}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(
                          room.roomNo,
                          room.isFavorite || false
                        );
                      }}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && favoriteRooms.length === 0 && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-light text-foreground">
                즐겨찾는 열람실이 없습니다
              </h3>
              <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
                자주 이용하는 열람실을 즐겨찾기에 추가해보세요
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
