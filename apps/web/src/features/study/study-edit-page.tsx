"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AuthGuard } from "@/features/auth";
import {
  useStudyGroupDetail,
  useUpdateStudyGroup,
  StudyVisibility,
} from "@/entities/study";

const DAYS = [
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
  { value: 7, label: "일" },
];

interface StudyEditPageProps {
  groupId: string;
}

export const StudyEditPage: React.FC<StudyEditPageProps> = ({ groupId }) => {
  const router = useRouter();
  const { data: study, isLoading } = useStudyGroupDetail(groupId);
  const updateMutation = useUpdateStudyGroup();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "PUBLIC" as StudyVisibility,
    password: "",
    tags: "",
    maxMembers: "",
    checkInStartTime: "08:00",
    checkInEndTime: "10:00",
    checkOutMinTime: "18:00",
    minUsageHours: "4",
    operatingDays: [1, 2, 3, 4, 5] as number[],
  });

  // 스터디 정보 로드 시 폼 초기화
  useEffect(() => {
    if (study) {
      setFormData({
        name: study.name,
        description: study.description || "",
        visibility: study.visibility,
        password: "",
        tags: study.tags?.join(", ") || "",
        maxMembers: study.maxMembers?.toString() || "",
        checkInStartTime: study.checkInStartTime,
        checkInEndTime: study.checkInEndTime,
        checkOutMinTime: study.checkOutMinTime,
        minUsageHours: (study.minUsageMinutes / 60).toString(),
        operatingDays: study.operatingDays,
      });
    }
  }, [study]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter((d) => d !== day)
        : [...prev.operatingDays, day].sort(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("스터디 이름을 입력해주세요.");
      return;
    }

    if (formData.operatingDays.length === 0) {
      toast.error("운영 요일을 선택해주세요.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        groupId,
        dto: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          visibility: formData.visibility,
          password: formData.password || undefined,
          tags: formData.tags
            ? formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : undefined,
          maxMembers: formData.maxMembers
            ? parseInt(formData.maxMembers)
            : undefined,
          checkInStartTime: formData.checkInStartTime,
          checkInEndTime: formData.checkInEndTime,
          checkOutMinTime: formData.checkOutMinTime,
          minUsageMinutes: parseInt(formData.minUsageHours) * 60,
          operatingDays: formData.operatingDays,
        },
      });

      toast.success("스터디 정보가 수정되었습니다!");
      router.push(`/study/${groupId}/settings`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "스터디 수정에 실패했습니다.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-muted-foreground/10 rounded" />
              <div className="h-64 bg-muted-foreground/10 rounded" />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link
            href={`/study/${groupId}/settings`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground/60 hover:text-foreground font-light mb-8 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            관리 페이지
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extralight text-foreground mb-3">
              스터디 정보 수정
            </h1>
            <p className="text-muted-foreground/60 font-light">{study?.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 기본 정보 */}
            <section className="space-y-5">
              <h2 className="text-base font-light text-foreground border-b border-border/20 pb-2">
                기본 정보
              </h2>

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                  스터디 이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                  설명
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light resize-none h-24 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                  태그
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="쉼표로 구분 (예: 고시, 행정, 스터디)"
                  className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                />
              </div>
            </section>

            {/* 공개 설정 */}
            <section className="space-y-5">
              <h2 className="text-base font-light text-foreground border-b border-border/20 pb-2">
                공개 설정
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: "PUBLIC", icon: "🌍", label: "공개" },
                  { value: "PASSWORD", icon: "🔐", label: "비밀번호" },
                  { value: "PRIVATE", icon: "🔒", label: "비공개" },
                ].map((option) => {
                  const isSelected = formData.visibility === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          visibility: option.value as StudyVisibility,
                        }))
                      }
                      className={`relative p-4 rounded-xl border text-center transition-all duration-150 ${
                        isSelected
                          ? "border-foreground/50 bg-foreground/5"
                          : "border-border/30 hover:border-border/50"
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-light">{option.label}</div>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-background"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {formData.visibility === "PASSWORD" && (
                <div>
                  <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                    새 비밀번호 (변경 시에만 입력)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="기존 비밀번호를 유지하려면 비워두세요"
                    className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                  최대 인원
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  placeholder="비워두면 무제한"
                  min="2"
                  max="100"
                  className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                />
              </div>
            </section>

            {/* 출퇴근 설정 */}
            <section className="space-y-5">
              <h2 className="text-base font-light text-foreground border-b border-border/20 pb-2">
                출퇴근 규칙
              </h2>

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-3">
                  운영 요일 <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const isSelected = formData.operatingDays.includes(
                      day.value
                    );
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`w-10 h-10 rounded-lg text-sm transition-all duration-150 ${
                          isSelected
                            ? "bg-foreground text-background font-medium"
                            : "bg-foreground/5 text-muted-foreground/50 font-light hover:bg-foreground/10"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                    출근 시작
                  </label>
                  <input
                    type="time"
                    name="checkInStartTime"
                    value={formData.checkInStartTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                    출근 마감
                  </label>
                  <input
                    type="time"
                    name="checkInEndTime"
                    value={formData.checkInEndTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                    최소 퇴근 시간
                  </label>
                  <input
                    type="time"
                    name="checkOutMinTime"
                    value={formData.checkOutMinTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                    최소 이용 시간
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minUsageHours"
                      value={formData.minUsageHours}
                      onChange={handleChange}
                      min="1"
                      max="12"
                      className="w-full px-4 py-3 pr-12 bg-transparent border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-sm">
                      시간
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 제출 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/20">
              <Link
                href={`/study/${groupId}/settings`}
                className="flex-1 px-4 md:px-6 py-3 md:py-3.5 bg-transparent border border-border/30 text-muted-foreground/70 rounded-xl text-sm font-light hover:bg-foreground/5 hover:text-foreground transition-all text-center"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 px-4 md:px-6 py-3 md:py-3.5 bg-foreground text-background rounded-xl text-sm font-light hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
};



