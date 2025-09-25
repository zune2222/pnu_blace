"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Announcement } from "@/entities/announcement";
import { AnnouncementIcon } from "./announcement-icon";
import { AnnouncementContent } from "./announcement-content";

interface AnnouncementModalProps {
  announcement: Announcement;
  isVisible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  isVisible,
  onClose,
  onDismiss,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onClose();
    }
  };

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`
          relative max-w-md w-full mx-4 bg-white border border-border rounded-xl shadow-lg overflow-hidden
          transition-all duration-200 transform
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          ${
            isMobile
              ? `
              fixed bottom-0 left-0 right-0 mx-0 max-w-none rounded-t-xl rounded-b-none
              ${isVisible ? "translate-y-0" : "translate-y-full"}
            `
              : `
              ${isVisible ? "translate-y-0" : "translate-y-4"}
            `
          }
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <AnnouncementIcon type={announcement.type} />
            <h2 className="text-lg font-semibold text-foreground">
              {announcement.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted/50 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4">
          <AnnouncementContent content={announcement.content} />
        </div>

        <div className="flex items-center justify-end space-x-3 px-4 py-3 border-t border-border/50 bg-muted/30">
          {announcement.dismissible && (
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              다시 보지 않기
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-200"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
