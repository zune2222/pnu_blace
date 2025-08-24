import { ProgressBarProps } from "@/entities/room";

export const ProgressBar = ({ rate }: ProgressBarProps) => {
  const getProgressColor = (rate: number) => {
    if (rate < 30) return "bg-green-500";
    if (rate < 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-12 h-1 bg-muted/50 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 rounded-full ${getProgressColor(rate)}`}
        style={{ width: `${rate}%` }}
      />
    </div>
  );
};
