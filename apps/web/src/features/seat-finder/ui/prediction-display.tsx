"use client";

import { Clock } from "lucide-react";

interface PredictionDisplayProps {
  isLoading: boolean;
  predictionText: string;
  currentPeriod?: string;
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  isLoading,
  predictionText,
  currentPeriod,
}) => {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl animate-in slide-in-from-top-2 duration-300 delay-100">
      <div className="flex items-center space-x-3">
        <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-pulse" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            사용 패턴 분석
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {isLoading ? "분석 중..." : predictionText}
          </p>
          {currentPeriod && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              현재 기간: {currentPeriod}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
