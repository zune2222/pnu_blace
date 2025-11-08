"use client";
import React from "react";
import { AuthGuard } from "@/features/auth";
import { SeatHistoryWidget } from "@/features/dashboard/ui";

export default function StatsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <section className="py-20 md:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <SeatHistoryWidget />
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}