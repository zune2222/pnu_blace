import React from "react";
import { Header, Footer } from "@/widgets";
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  CtaSection,
} from "./components";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CtaSection />
      <Footer />
    </div>
  );
};
