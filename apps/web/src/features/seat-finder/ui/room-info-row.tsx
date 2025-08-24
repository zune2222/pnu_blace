import { RoomInfoRowProps } from "@/entities/room";
import { UtilizationBadge } from "@/features/seat-finder/ui";

export const RoomInfoRow = ({
  timeStart,
  timeEnd,
  totalSeats,
  usedSeats,
  utilizationRate,
}: RoomInfoRowProps) => {
  return (
    <div className="flex items-center space-x-3 flex-wrap">
      <span className="text-sm text-muted-foreground/70 font-light">
        {timeStart} - {timeEnd}
      </span>
      <span className="text-sm text-muted-foreground/70 font-light">
        {usedSeats}/{totalSeats}
      </span>
      <UtilizationBadge rate={utilizationRate} />
    </div>
  );
};
