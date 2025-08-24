import { UtilizationBadgeProps } from "@/entities/room";

export const UtilizationBadge = ({ rate }: UtilizationBadgeProps) => {
  const getUtilizationColor = (rate: number) => {
    if (rate < 30)
      return "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
    if (rate < 70)
      return "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400";
    return "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
  };

  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium tracking-wide ${getUtilizationColor(rate)}`}
    >
      {rate}%
    </span>
  );
};
