"use client";

import React from "react";
import { useAnnouncementStore } from "@/entities/announcement";
import { AnnouncementModal } from "./announcement-modal";
import { AnnouncementInitializer } from "./announcement-initializer";

interface AnnouncementProviderProps {
  children: React.ReactNode;
}

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({
  children,
}) => {
  const {
    isAnnouncementVisible,
    activeAnnouncement,
    hideAnnouncement,
    dismissAnnouncement,
  } = useAnnouncementStore();

  const handleClose = () => {
    hideAnnouncement();
  };

  const handleDismiss = () => {
    if (activeAnnouncement) {
      dismissAnnouncement(activeAnnouncement.id);
    }
  };

  return (
    <>
      <AnnouncementInitializer />
      {children}
      {activeAnnouncement && (
        <AnnouncementModal
          announcement={activeAnnouncement}
          isVisible={isAnnouncementVisible}
          onClose={handleClose}
          onDismiss={activeAnnouncement.dismissible ? handleDismiss : undefined}
        />
      )}
    </>
  );
};