"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePublicStudyGroups, usePopularTags } from "@/entities/study";
import { StudyCard, StudyListSkeleton, TagFilter } from "./ui";
import { useAuth } from "@/entities/auth";

export const StudyListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const { isAuthenticated } = useAuth();

  const {
    data: studyGroups,
    isLoading,
    error,
  } = usePublicStudyGroups(
    page,
    search || undefined,
    selectedTags.length > 0 ? selectedTags : undefined
  );

  const { data: popularTags, isLoading: isLoadingTags } = usePopularTags();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSelectedTags([]);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* 헤더 섹션 */}
        <div className="py-16 md:py-24 border-b border-border/20">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-foreground leading-tight mb-3 md:mb-4">
                  스터디
                </h1>
                <p className="text-base md:text-lg text-muted-foreground/70 font-light">
                  함께 공부하고, 서로의 출퇴근을 확인하세요
                </p>
              </div>

              {isAuthenticated && (
                <Link
                  href="/study/create"
                  className="px-4 md:px-6 py-2 md:py-3 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
                >
                  스터디 만들기
                </Link>
              )}
            </div>

            {/* 검색 */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 sm:gap-4"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="스터디 이름으로 검색..."
                  className="w-full px-4 py-2 md:py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light text-sm md:text-base"
                />
              </div>
              <button
                type="submit"
                className="px-4 md:px-6 py-2 md:py-3 bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-colors whitespace-nowrap"
              >
                검색
              </button>
            </form>

            {/* 태그 필터 */}
            <TagFilter
              tags={popularTags || []}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              isLoading={isLoadingTags}
            />

            {/* 필터 초기화 */}
            {(search || selectedTags.length > 0) && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-muted-foreground/60 hover:text-foreground font-light underline"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>

        {/* 스터디 목록 */}
        <div className="py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-extralight text-foreground">
                공개 스터디
              </h2>
              <p className="text-sm text-muted-foreground/50 font-light">
                {studyGroups?.pagination.total || 0}개의 스터디
              </p>
            </div>
          </div>

          {isLoading ? (
            <StudyListSkeleton />
          ) : error ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-muted-foreground/60 font-light">
                스터디 목록을 불러오는데 실패했습니다.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-foreground hover:underline font-light"
              >
                새로고침
              </button>
            </div>
          ) : studyGroups?.items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-muted-foreground/60 font-light">
                {search || selectedTags.length > 0
                  ? "검색 결과가 없습니다."
                  : "아직 공개된 스터디가 없습니다."}
              </p>
              {isAuthenticated && (
                <Link
                  href="/study/create"
                  className="inline-block px-6 py-3 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-colors"
                >
                  첫 번째 스터디 만들기
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studyGroups?.items.map((study) => (
                  <StudyCard key={study.groupId} study={study} />
                ))}
              </div>

              {/* 페이지네이션 */}
              {studyGroups && studyGroups.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-light text-muted-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  <span className="px-4 py-2 text-sm font-light text-muted-foreground/60">
                    {page} / {studyGroups.pagination.totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(studyGroups.pagination.totalPages, p + 1)
                      )
                    }
                    disabled={page === studyGroups.pagination.totalPages}
                    className="px-4 py-2 text-sm font-light text-muted-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 초대 코드 입력 섹션 */}
        {isAuthenticated && (
          <div className="py-12 border-t border-border/20">
            <div className="bg-muted-foreground/5 rounded-lg p-8">
              <h3 className="text-lg font-light text-foreground mb-2">
                초대 코드로 가입
              </h3>
              <p className="text-sm text-muted-foreground/60 font-light mb-4">
                비공개 스터디의 초대 코드를 받으셨나요?
              </p>
              <Link
                href="/study/join"
                className="inline-block px-4 py-2 bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-colors"
              >
                초대 코드 입력하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
