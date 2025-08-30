import { RoomCardProps } from "@/entities/room";
import {
  RoomHeader,
  RoomInfoRow,
  RoomStatusIndicator,
} from "@/features/seat-finder/ui";
import { useIsFavorite, useToggleFavorite } from "@/entities/favorite";
import { FavoriteHeart } from "@/shared/ui";

export const RoomCard = ({ room, onSelect }: RoomCardProps) => {
  const { data: isFavorite = false } = useIsFavorite(room.roomNo);
  const toggleFavoriteMutation = useToggleFavorite();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    try {
      await toggleFavoriteMutation.mutateAsync({
        roomNo: room.roomNo,
        isFavorite: !isFavorite,
      });
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
    }
  };

  return (
    <div
      className="group cursor-pointer py-6 border-b border-border/10 last:border-b-0 hover:bg-muted/5 transition-colors duration-300"
      onClick={() => onSelect?.(room)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <RoomHeader roomName={room.roomName} />
          <RoomInfoRow
            timeStart={room.timeStart}
            timeEnd={room.timeEnd}
            totalSeats={room.totalSeat}
            usedSeats={room.totalSeat - room.remainSeat}
            utilizationRate={room.useRate}
          />
        </div>
        <div className="flex items-center space-x-4">
          <RoomStatusIndicator
            utilizationRate={room.useRate}
            remainingSeats={room.remainSeat}
          />
          <FavoriteHeart
            isFavorite={isFavorite}
            onClick={handleToggleFavorite}
            size="md"
          />
        </div>
      </div>
    </div>
  );
};
