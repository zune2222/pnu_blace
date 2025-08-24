import React from "react";
import { HeroSection, FeaturesSection, StatsSection, CtaSection } from "./ui";

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <CtaSection />
      <FeaturesSection />
      <StatsSection />
    </>
  );
};
