"use client";

import React from "react";
import { Share2 } from "lucide-react";

type ButtonVariant = "icon" | "text" | "full";

interface ShareButtonProps {
  variant: ButtonVariant;
  className?: string;
  onClick: () => void;
}

export function ShareButton({ variant, className = "", onClick }: ShareButtonProps) {
  const baseStyles = "inline-flex items-center justify-center transition-all active:scale-95";
  const variantStyles: Record<ButtonVariant, string> = {
    icon: "p-2 rounded-lg hover:bg-muted-foreground/10",
    text: "gap-2 px-3 py-2 rounded-lg hover:bg-muted-foreground/10 text-sm font-light",
    full: "gap-2 px-6 py-3 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label="공부 기록 공유하기"
    >
      <Share2 className={variant === "full" ? "w-5 h-5" : "w-4 h-4"} />
      {variant !== "icon" && <span>공유하기</span>}
    </button>
  );
}
