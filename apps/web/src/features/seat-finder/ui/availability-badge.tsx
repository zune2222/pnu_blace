import { AvailabilityBadgeProps } from "@/entities/room";

export const AvailabilityBadge = ({
  remainingSeats,
}: AvailabilityBadgeProps) => {
  const getAvailabilityColor = (remainingSeats: number) => {
    if (remainingSeats === 0)
      return "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
    if (remainingSeats < 10)
      return "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400";
    return "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
  };

  const getAvailabilityStatus = (remainingSeats: number) => {
    if (remainingSeats === 0) return "만석";
    if (remainingSeats < 10) return "여유석 부족";
    return "여유석 있음";
  };

  return (
    <div
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${getAvailabilityColor(remainingSeats)}`}
    >
      {getAvailabilityStatus(remainingSeats)}
    </div>
  );
};
