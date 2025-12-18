import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "inline" | "card";
}

export function ErrorState({
  title = "오류가 발생했습니다",
  message = "데이터를 불러올 수 없습니다.",
  onRetry,
  className,
  variant = "default",
}: ErrorStateProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-sm", className)}>
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            aria-label="데이터 다시 불러오기"
            className="text-foreground hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            다시 시도
          </button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "border border-border/20 rounded-lg p-8 text-center space-y-4",
        className
      )}>
        <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-light text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground/70 font-light">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            aria-label="데이터 다시 불러오기"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            다시 시도
          </button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("text-center py-12 space-y-4", className)}>
      <div className="w-16 h-16 mx-auto rounded-full bg-muted-foreground/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground/70 font-light">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          aria-label="데이터 다시 불러오기"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border/40 rounded-lg text-sm font-light hover:bg-muted-foreground/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          다시 시도
        </button>
      )}
    </div>
  );
}

// 네트워크 에러 상태
interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <div className={cn("text-center py-12 space-y-4", className)}>
      <div className="w-16 h-16 mx-auto rounded-full bg-muted-foreground/10 flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-light text-foreground">네트워크 연결 오류</h3>
        <p className="text-sm text-muted-foreground/70 font-light">
          인터넷 연결을 확인해주세요.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          aria-label="다시 연결 시도"
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          다시 시도
        </button>
      )}
    </div>
  );
}

// 데이터 없음 상태
interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "데이터가 없습니다",
  message,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 space-y-4", className)}>
      {icon && (
        <div className="w-16 h-16 mx-auto rounded-full bg-muted-foreground/10 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-muted-foreground/70 font-light">{title}</p>
        {message && (
          <p className="text-sm text-muted-foreground/50 font-light">{message}</p>
        )}
      </div>
      {action}
    </div>
  );
}
