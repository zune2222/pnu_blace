"use client";

import React from "react";

interface TagFilterProps {
  tags: { tag: string; count: number }[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  isLoading?: boolean;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-7 w-16 bg-muted-foreground/10 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground/50 font-light tracking-wide uppercase">
        인기 태그
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-light transition-all ${
                isSelected
                  ? "bg-foreground text-background"
                  : "bg-muted-foreground/5 text-muted-foreground/60 hover:bg-muted-foreground/10"
              }`}
            >
              #{tag}
              <span className="ml-1 opacity-50">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
