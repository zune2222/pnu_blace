import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import type { Announcement } from "@/entities/announcement";

interface AnnouncementIconProps {
  type: Announcement['type'];
  className?: string;
}

export const AnnouncementIcon = ({ type, className = "w-5 h-5" }: AnnouncementIconProps) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className={`${className} text-amber-500`} />;
    case 'success':
      return <CheckCircle className={`${className} text-green-500`} />;
    case 'error':
      return <XCircle className={`${className} text-red-500`} />;
    default:
      return <Info className={`${className} text-blue-500`} />;
  }
};