import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";

export const CtaSection: React.FC = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-foreground variable-weight-hover mb-12 cursor-default">
          지금 시작하세요
        </h2>
        <div className="space-y-6">
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <Link href="/register">시작하기</Link>
          </Button>
          <div>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4"
              asChild
            >
              <Link href="/login">로그인</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
