import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="min-h-[85vh] flex items-center justify-center px-6">
      <div className="text-center max-w-7xl mx-auto">
        <h1 className="text-headline dynamic-weight mb-12 cursor-default">
          PNU Blace
        </h1>
        <p className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-light leading-tight max-w-5xl mx-auto variable-weight-hover cursor-default">
          부산대학교 도서관 좌석 예약의 새로운 경험
        </p>
      </div>
    </section>
  );
};
