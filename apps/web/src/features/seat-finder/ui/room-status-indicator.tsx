import { RoomStatusIndicatorProps } from "@/entities/room";
import { ProgressBar, AvailabilityBadge } from "@/features/seat-finder/ui";

export const RoomStatusIndicator = ({
  utilizationRate,
  remainingSeats,
}: RoomStatusIndicatorProps) => {
  return (
    <div className="text-right flex items-center space-x-3">
      <ProgressBar rate={utilizationRate} />
      <AvailabilityBadge remainingSeats={remainingSeats} />
    </div>
  );
};
