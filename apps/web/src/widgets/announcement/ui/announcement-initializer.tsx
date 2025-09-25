"use client";

import { useEffect } from "react";
import { useAnnouncementStore } from "@/entities/announcement";

export const AnnouncementInitializer = () => {
  const { setAnnouncements } = useAnnouncementStore();

  useEffect(() => {
    // 테스트용 공지사항들
    setAnnouncements([
      // {
      //   id: "welcome-2024",
      //   title: "🎉 PNU Blace에 오신 것을 환영합니다!",
      //   content:
      //     "부산대학교 도서관을 더욱 편리하게 이용할 수 있도록 도와드리겠습니다.\\n\\n새로운 기능들을 확인해보세요:\\n• 실시간 좌석 현황\\n• 자동 연장 기능\\n• 즐겨찾기 방 관리",
      //   type: "info",
      //   priority: "medium",
      //   startDate: "2025-01-01T00:00:00Z",
      //   endDate: "2025-12-31T23:59:59Z",
      //   isActive: true,
      //   dismissible: true,
      //   showOnce: false,
      // },
    ]);
  }, [setAnnouncements]);

  return null;
};
