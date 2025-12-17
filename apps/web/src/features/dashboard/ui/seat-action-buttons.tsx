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
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 pt-4">
        <button
          onClick={isExtendDisabled ? onExtendDisabledClick : onExtend}
          disabled={isExtending}
          className={`group inline-flex items-center space-x-3 text-lg font-light transition-colors duration-300 disabled:cursor-not-allowed min-h-[44px] px-2 py-2 rounded-md ${
            isExtendDisabled
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-foreground hover:text-muted-foreground hover:bg-muted/20 disabled:text-muted-foreground/50 active:scale-95"
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
          className="group inline-flex items-center space-x-3 text-base text-muted-foreground/50 font-light hover:text-muted-foreground hover:bg-muted/10 transition-colors duration-300 disabled:text-muted-foreground/30 disabled:cursor-not-allowed min-h-[44px] px-2 py-2 rounded-md active:scale-95"
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
    </>
  );
};
