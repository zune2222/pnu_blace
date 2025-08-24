import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";

export const CtaSection: React.FC = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center">
          <Button
            size="lg"
            className="group relative text-xl font-semibold px-8 py-4 border-0 bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            asChild
          >
            <Link href="/login" className="flex items-center gap-3">
              <span>시작하기</span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
