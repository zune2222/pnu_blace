import { LoadingSkeletonProps } from "@/entities/room";

export const LoadingSkeleton = ({ count = 6 }: LoadingSkeletonProps) => {
  return (
    <div className="space-y-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-muted/20 rounded-lg h-32 border border-border/10"></div>
        </div>
      ))}
    </div>
  );
};
