"use client";

import { AlertCircle, Calendar } from "lucide-react";

interface ReserveButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ReserveButton: React.FC<ReserveButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`w-full py-4 px-4 min-h-[48px] rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
        isLoading || disabled
          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          : "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 shadow-lg hover:shadow-xl dark:shadow-blue-500/25"
      }`}
    >
      {isLoading ? "발권 중..." : "좌석 발권하기"}
    </button>
  );
};

export const OccupiedNotice: React.FC = () => {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          빈자리 예약 기능 일시 중단
        </p>
      </div>
      <p className="text-xs mt-2 text-amber-700 dark:text-amber-300">
        빈자리 예약 기능은 점검 중입니다. 좌석이 비면 직접 발권해주세요.
      </p>
    </div>
  );
};

export const UnavailableNotice: React.FC = () => {
  return (
    <div className="text-center py-4 animate-in fade-in duration-300 delay-300">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        이 좌석은 현재 예약할 수 없습니다.
      </p>
    </div>
  );
};

export const SeatInfoFooter: React.FC = () => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-2 duration-300 delay-300">
      <div className="flex items-start space-x-2">
        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <p>• 좌석 발권: 즉시 사용 가능한 좌석을 발권합니다.</p>
          <p>
            • 빈자리 발권 예약: 현재 사용 중인 좌석이 비워지면 자동으로
            발권됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
