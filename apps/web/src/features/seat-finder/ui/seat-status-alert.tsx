"use client";

import { AlertCircle } from "lucide-react";

type SeatStatus = "occupied" | "available" | "unavailable";

interface SeatStatusAlertProps {
  status: SeatStatus;
}

const alertConfig = {
  occupied: {
    icon: <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />,
    title: "현재 사용 중인 좌석",
    description: "다른 사용자가 현재 이 좌석을 사용하고 있습니다.",
    colors: {
      bg: "bg-red-50 dark:bg-red-950/50",
      border: "border-red-200 dark:border-red-800",
      title: "text-red-900 dark:text-red-100",
      desc: "text-red-700 dark:text-red-300",
    },
  },
  available: {
    icon: <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse" />,
    title: "이용 가능한 좌석",
    description: "지금 바로 예약할 수 있습니다.",
    colors: {
      bg: "bg-green-50 dark:bg-green-950/50",
      border: "border-green-200 dark:border-green-800",
      title: "text-green-900 dark:text-green-100",
      desc: "text-green-700 dark:text-green-300",
    },
  },
  unavailable: {
    icon: <AlertCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />,
    title: "사용 불가능한 좌석",
    description: "고정석 또는 점검 중인 좌석입니다.",
    colors: {
      bg: "bg-gray-50 dark:bg-gray-900/50",
      border: "border-gray-200 dark:border-gray-800",
      title: "text-gray-900 dark:text-gray-100",
      desc: "text-gray-700 dark:text-gray-300",
    },
  },
};

export const SeatStatusAlert: React.FC<SeatStatusAlertProps> = ({ status }) => {
  const config = alertConfig[status];

  return (
    <div
      className={`flex items-start space-x-3 p-4 ${config.colors.bg} border ${config.colors.border} rounded-xl animate-in slide-in-from-top-2 duration-300`}
    >
      {config.icon}
      <div>
        <h3 className={`text-sm font-medium ${config.colors.title}`}>
          {config.title}
        </h3>
        <p className={`text-sm ${config.colors.desc} mt-1`}>
          {config.description}
        </p>
      </div>
    </div>
  );
};
