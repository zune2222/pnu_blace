import React from "react";

interface FavoriteHeartProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FavoriteHeart: React.FC<FavoriteHeartProps> = ({
  isFavorite,
  onClick,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const colorClasses = isFavorite
    ? "text-red-500 hover:text-red-600"
    : "text-muted-foreground/50 hover:text-red-500";

  return (
    <button
      onClick={onClick}
      aria-label={isFavorite ? "즐겨찾기에서 제거" : "즐겨찾기에 추가"}
      aria-pressed={isFavorite}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${colorClasses} ${className}`}
      title={isFavorite ? "즐겨찾기에서 제거" : "즐겨찾기에 추가"}
    >
      <svg
        className={sizeClasses[size]}
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};
