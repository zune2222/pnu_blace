"use client";
import React from "react";
import { AuthGuard } from "@/features/auth";
import { RankingsPage } from "@/features/rankings";

export default function Rankings() {
  return (
    <AuthGuard>
      <RankingsPage />
    </AuthGuard>
  );
}