import React from "react";

export interface SeatActionButtonsProps {
  onExtend: () => void;
  onCancel: () => void;
  isExtending: boolean;
  isCancelling: boolean;
  isExtendDisabled?: boolean;
  onExtendDisabledClick?: () => void;
}

export const SeatActionButtons: React.FC<SeatActionButtonsProps> = ({
  onExtend,
  onCancel,
  isExtending,
  isCancelling,
  isExtendDisabled = false,
  onExtendDisabledClick,
}) => {
  return (
    <div className="flex items-center space-x-6 pt-4">
      <button
        onClick={isExtendDisabled ? onExtendDisabledClick : onExtend}
        disabled={isExtending}
        className={`group inline-flex items-center space-x-3 text-lg font-light transition-colors duration-300 disabled:cursor-not-allowed ${
          isExtendDisabled 
            ? 'text-muted-foreground/50 cursor-not-allowed' 
            : 'text-foreground hover:text-muted-foreground disabled:text-muted-foreground/50'
        }`}
      >
        <span>{isExtending ? "연장 중..." : "시간 연장"}</span>
        {!isExtending && (
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        )}
        {isExtending && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>

      <button
        onClick={onCancel}
        disabled={isCancelling}
        className="group inline-flex items-center space-x-3 text-base text-muted-foreground/50 font-light hover:text-muted-foreground transition-colors duration-300 disabled:text-muted-foreground/30 disabled:cursor-not-allowed"
      >
        <span>{isCancelling ? "반납 중..." : "반납"}</span>
        {!isCancelling && (
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        )}
        {isCancelling && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>
    </div>
  );
};