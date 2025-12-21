"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Armchair, BookOpen, Trophy } from "lucide-react";

export const BottomNavigation = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "홈",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/dashboard",
      label: "대시보드",
      icon: BarChart2,
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      href: "/seats",
      label: "좌석",
      icon: Armchair,
      isActive: pathname.startsWith("/seats"),
    },
    {
      href: "/study",
      label: "스터디",
      icon: BookOpen,
      isActive: pathname.startsWith("/study"),
    },
    {
      href: "/rankings",
      label: "랭킹",
      icon: Trophy,
      isActive: pathname.startsWith("/rankings"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border border-border/40 pb-safe mb-5 rounded-2xl mx-2">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
              item.isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon
              className={`w-6 h-6 ${item.isActive ? "stroke-[2.5px]" : "stroke-2"}`}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
