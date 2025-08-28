import React from "react";

export interface StatusBadgeProps {
  color: string;
  text: string;
  bgClass: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  color,
  text,
  bgClass,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 bg-${color}-500 rounded-full animate-pulse`}></div>
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium tracking-wide ${bgClass}`}
      >
        {text}
      </span>
    </div>
  );
};

export const getStatusBadge = (): StatusBadgeProps => {
  return {
    color: "green",
    text: "ACTIVE",
    bgClass:
      "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
  };
};