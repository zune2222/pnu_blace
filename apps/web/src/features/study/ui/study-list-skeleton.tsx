"use client";

import React from "react";

export const StudyListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-background border border-border/20 rounded-lg p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-5 w-16 bg-muted-foreground/10 rounded" />
              <div className="h-6 w-48 bg-muted-foreground/10 rounded" />
            </div>
          </div>
          <div className="h-4 w-full bg-muted-foreground/10 rounded mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-16 bg-muted-foreground/10 rounded" />
            <div className="h-5 w-16 bg-muted-foreground/10 rounded" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/10">
            <div className="h-4 w-20 bg-muted-foreground/10 rounded" />
            <div className="h-4 w-24 bg-muted-foreground/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
