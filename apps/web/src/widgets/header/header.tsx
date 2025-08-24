import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">PNU Blace</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              홈
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              기능
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              소개
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">로그인</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">회원가입</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
