import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="min-h-[85vh] flex items-center justify-center px-6">
      <div className="text-center max-w-7xl mx-auto">
        <h1 className="text-headline dynamic-weight mb-12 cursor-default">
          PNU Blace
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-muted-foreground font-light leading-tight max-w-5xl mx-auto variable-weight-hover cursor-default break-keep">
          빈틈없이, 연결되다
        </p>
      </div>
    </section>
  );
};
