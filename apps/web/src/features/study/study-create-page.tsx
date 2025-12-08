"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AuthGuard } from "@/features/auth";
import { useCreateStudyGroup, StudyVisibility } from "@/entities/study";

const DAYS = [
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
  { value: 7, label: "일" },
];

export const StudyCreatePage: React.FC = () => {
  const router = useRouter();
  const createMutation = useCreateStudyGroup();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayName: "",
    visibility: "PUBLIC" as StudyVisibility,
    password: "",
    tags: "",
    maxMembers: "",
    checkInStartTime: "08:00",
    checkInEndTime: "10:00",
    checkOutMinTime: "18:00",
    minUsageHours: "4",
    operatingDays: [1, 2, 3, 4, 5],
  });

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

    if (formData.visibility === "PASSWORD" && !formData.password) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }

    if (formData.operatingDays.length === 0) {
      toast.error("운영 요일을 선택해주세요.");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        visibility: formData.visibility,
        password:
          formData.visibility === "PASSWORD" ? formData.password : undefined,
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
        displayName: formData.displayName.trim() || undefined,
      });

      toast.success("스터디가 생성되었습니다!");
      router.push(`/study/${result.groupId}`);
    } catch (error: any) {
      toast.error(error.message || "스터디 생성에 실패했습니다.");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link
            href="/study"
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
            스터디 목록
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extralight text-foreground mb-3">
              스터디 만들기
            </h1>
            <p className="text-muted-foreground/60 font-light">
              함께 공부할 스터디를 만들어보세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 기본 정보 */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-sm">
                  1
                </div>
                <h2 className="text-base font-light text-foreground">
                  기본 정보
                </h2>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                  스터디 이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 2024 행정고시 스터디"
                  className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                  내 닉네임
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="스터디에서 사용할 이름 (비워두면 실명 사용)"
                  className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:bg-foreground/[0.02] font-light transition-all"
                  maxLength={50}
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
                  placeholder="스터디에 대한 간단한 설명을 적어주세요"
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-sm">
                  2
                </div>
                <h2 className="text-base font-light text-foreground">
                  공개 설정
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "PUBLIC",
                    icon: "🌍",
                    label: "공개",
                    desc: "누구나 신청 가능",
                  },
                  {
                    value: "PASSWORD",
                    icon: "🔐",
                    label: "비밀번호",
                    desc: "비밀번호로 가입",
                  },
                  {
                    value: "PRIVATE",
                    icon: "🔒",
                    label: "비공개",
                    desc: "초대 코드만",
                  },
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
                          : "border-border/30 hover:border-border/50 hover:bg-foreground/[0.02]"
                      }`}
                    >
                      <div
                        className={`text-2xl mb-2 transition-transform duration-150 ${isSelected ? "scale-110" : ""}`}
                      >
                        {option.icon}
                      </div>
                      <div
                        className={`text-sm transition-all ${isSelected ? "text-foreground font-medium" : "text-muted-foreground/70 font-light"}`}
                      >
                        {option.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground/40 font-light mt-0.5">
                        {option.desc}
                      </div>
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
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm text-muted-foreground/70 font-light mb-2">
                    스터디 비밀번호 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="가입 시 필요한 비밀번호"
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-sm">
                  3
                </div>
                <h2 className="text-base font-light text-foreground">
                  출퇴근 규칙
                </h2>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground/70 font-light mb-3">
                  운영 요일 <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
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
                {formData.operatingDays.length > 0 && (
                  <p className="text-xs text-muted-foreground/40 mt-2 font-light">
                    주 {formData.operatingDays.length}일 운영
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              {/* 규칙 요약 */}
              <div className="p-4 bg-foreground/[0.02] border border-border/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <div className="text-sm text-muted-foreground/60 font-light space-y-1">
                    <p>
                      <span className="text-green-500">정상 출근</span>:{" "}
                      {formData.checkInStartTime} ~ {formData.checkInEndTime}{" "}
                      입실
                    </p>
                    <p>
                      <span className="text-amber-500">지각</span>:{" "}
                      {formData.checkInEndTime} 이후 입실
                    </p>
                    <p>
                      <span className="text-orange-500">조퇴</span>:{" "}
                      {formData.checkOutMinTime} 전 퇴실 또는{" "}
                      {formData.minUsageHours}시간 미만 이용
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-6 border-t border-border/20">
              <Link
                href="/study"
                className="flex-1 px-6 py-3.5 bg-transparent border border-border/30 text-muted-foreground/70 rounded-xl text-sm font-light hover:bg-foreground/5 hover:text-foreground transition-all text-center"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 px-6 py-3.5 bg-foreground text-background rounded-xl text-sm font-light hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? "생성 중..." : "스터디 만들기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
};
