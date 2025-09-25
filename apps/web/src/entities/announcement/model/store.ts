import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  dismissible: boolean;
  showOnce?: boolean;
}

interface AnnouncementState {
  announcements: Announcement[];
  dismissedAnnouncements: string[];
  isAnnouncementVisible: boolean;
  activeAnnouncement: Announcement | null;
  
  setAnnouncements: (announcements: Announcement[]) => void;
  dismissAnnouncement: (id: string) => void;
  showAnnouncement: (announcement: Announcement) => void;
  hideAnnouncement: () => void;
  getActiveAnnouncement: () => Announcement | null;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set, get) => ({
      announcements: [],
      dismissedAnnouncements: [],
      isAnnouncementVisible: false,
      activeAnnouncement: null,
      
      setAnnouncements: (announcements) => {
        set({ announcements });
        
        const activeAnnouncement = get().getActiveAnnouncement();
        if (activeAnnouncement && !get().isAnnouncementVisible) {
          get().showAnnouncement(activeAnnouncement);
        }
      },
      
      dismissAnnouncement: (id) => {
        const { dismissedAnnouncements } = get();
        set({
          dismissedAnnouncements: [...dismissedAnnouncements, id],
          isAnnouncementVisible: false,
          activeAnnouncement: null,
        });
      },
      
      showAnnouncement: (announcement) => {
        const { dismissedAnnouncements } = get();
        
        if (dismissedAnnouncements.includes(announcement.id)) {
          return;
        }
        
        set({
          isAnnouncementVisible: true,
          activeAnnouncement: announcement,
        });
      },
      
      hideAnnouncement: () => {
        set({
          isAnnouncementVisible: false,
          activeAnnouncement: null,
        });
      },
      
      getActiveAnnouncement: () => {
        const { announcements, dismissedAnnouncements } = get();
        const now = new Date().toISOString();
        
        const activeAnnouncements = announcements.filter(announcement => {
          const isInTimeRange = announcement.startDate <= now && 
            (!announcement.endDate || announcement.endDate >= now);
          const isNotDismissed = !dismissedAnnouncements.includes(announcement.id);
          
          return announcement.isActive && isInTimeRange && isNotDismissed;
        });
        
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        activeAnnouncements.sort((a, b) => 
          priorityOrder[b.priority] - priorityOrder[a.priority]
        );
        
        return activeAnnouncements[0] || null;
      },
    }),
    {
      name: 'announcement-storage',
      partialize: (state) => ({
        dismissedAnnouncements: state.dismissedAnnouncements,
      }),
    }
  )
);