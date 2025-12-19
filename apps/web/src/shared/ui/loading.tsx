import React from "react";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)} />
  );
}

// 풀 페이지 로딩
interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message = "로딩 중..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground font-light">{message}</p>
      </div>
    </div>
  );
}

// 인라인 로딩
interface InlineLoaderProps {
  message?: string;
  className?: string;
}

export function InlineLoader({ message, className }: InlineLoaderProps) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
      <LoadingSpinner size="sm" />
      {message && <span className="text-sm font-light">{message}</span>}
    </div>
  );
}

// 버튼 내부 로딩 상태
interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function ButtonLoader({ isLoading, children, loadingText }: ButtonLoaderProps) {
  if (isLoading) {
    return (
      <span className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        {loadingText || children}
      </span>
    );
  }
  return <>{children}</>;
}

// 섹션 로딩 오버레이
interface SectionLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SectionLoader({ isLoading, children, className }: SectionLoaderProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
}
