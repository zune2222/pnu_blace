"use client";
import React from "react";
import { AuthGuard } from "@/features/auth";
import { CurrentSeatWidget, FavoriteRoomsSection, QuickInsightsSection } from "./ui";

export const DashboardPage: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <CurrentSeatWidget />
            <FavoriteRoomsSection />
            <QuickInsightsSection />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};