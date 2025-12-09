"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useStudyGroupDetail,
  useTodayAttendance,
  useRequestJoin,
  useJoinWithPassword,
  useMyStudyGroups,
} from "@/entities/study";
import { useAuth } from "@/entities/auth";
import { AttendanceList } from "./ui/attendance-list";
import { StudyVisibility } from "@pnu-blace/types";

interface StudyDetailPageProps {
  groupId: string;
}

const VisibilityBadge: React.FC<{ visibility: StudyVisibility }> = ({
  visibility,
}) => {
  const config = {
    PUBLIC: { icon: "🌍", label: "공개" },
    PASSWORD: { icon: "🔐", label: "비밀번호" },
    PRIVATE: { icon: "🔒", label: "비공개" },
  };
  const { icon, label } = config[visibility];
  return (
    <span className="text-sm text-muted-foreground/60 font-light">
      {icon} {label}
    </span>
  );
};

export const StudyDetailPage: React.FC<StudyDetailPageProps> = ({
  groupId,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joinMessage, setJoinMessage] = useState("");

  const { data: study, isLoading, error } = useStudyGroupDetail(groupId);
  const { data: attendance, isLoading: isLoadingAttendance } =
    useTodayAttendance(groupId);
  const { data: myStudies } = useMyStudyGroups(isAuthenticated);

  // 내가 이 스터디의 관리자인지 확인
  const myMembership = myStudies?.items.find((s) => s.groupId === groupId);
  const isAdmin =
    myMembership?.myRole === "OWNER" || myMembership?.myRole === "ADMIN";

  const requestJoinMutation = useRequestJoin();
  const joinWithPasswordMutation = useJoinWithPassword();

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (study?.visibility === "PASSWORD") {
      setShowPasswordModal(true);
    } else if (study?.visibility === "PUBLIC") {
      setShowJoinModal(true);
    }
  };

  const handleRequestJoin = async () => {
    if (!joinDisplayName.trim()) {
      toast.error("스터디에서 사용할 닉네임을 입력해주세요.");
      return;
    }

    try {
      await requestJoinMutation.mutateAsync({
        groupId,
        dto: { displayName: joinDisplayName.trim(), message: joinMessage },
      });
      setShowJoinModal(false);
      setJoinDisplayName("");
      setJoinMessage("");
      toast.success(
        "참가 신청이 완료되었습니다. 스터디장의 승인을 기다려주세요."
      );
    } catch (error: any) {
      toast.error(error.message || "참가 신청에 실패했습니다.");
    }
  };

  const handleJoinWithPassword = async () => {
    if (!password || !displayName) {
      toast.error("비밀번호와 닉네임을 입력해주세요.");
      return;
    }

    try {
      await joinWithPasswordMutation.mutateAsync({
        groupId,
        dto: { password, displayName },
      });
      setShowPasswordModal(false);
      toast.success("스터디에 가입되었습니다!");
      router.push(`/study/${groupId}`);
    } catch (error: any) {
      toast.error(error.message || "가입에 실패했습니다.");
    }
  };

  const formatDays = (days: number[]): string => {
    const dayNames = ["", "월", "화", "수", "목", "금", "토", "일"];
    return days.map((d) => dayNames[d]).join(", ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-muted-foreground/10 rounded" />
            <div className="h-4 w-full bg-muted-foreground/10 rounded" />
            <div className="h-64 bg-muted-foreground/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-muted-foreground/60 font-light mb-4">
            스터디를 찾을 수 없습니다.
          </p>
          <Link
            href="/study"
            className="text-foreground hover:underline font-light"
          >
            스터디 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6">
        {/* 헤더 */}
        <div className="py-12 border-b border-border/20">
          <Link
            href="/study"
            className="text-sm text-muted-foreground/60 hover:text-foreground font-light mb-6 inline-block"
          >
            ← 스터디 목록
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <VisibilityBadge visibility={study.visibility} />
                <span className="text-sm text-muted-foreground/40 hidden md:inline">
                  •
                </span>
                <span className="text-sm text-muted-foreground/60 font-light">
                  👥 {study.memberCount}
                  {study.maxMembers && `/${study.maxMembers}`}명
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extralight text-foreground break-keep">
                {study.name}
              </h1>

              {study.description && (
                <p className="text-base md:text-lg text-muted-foreground/70 font-light break-keep">
                  {study.description}
                </p>
              )}

              {/* 태그 */}
              {study.tags && study.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {study.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-muted-foreground/5 rounded text-xs text-muted-foreground/60 font-light"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 참가/관리 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {isAdmin && (
                <Link
                  href={`/study/${groupId}/settings`}
                  className="px-4 md:px-6 py-3 min-h-[44px] bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-all active:scale-95 text-center flex items-center justify-center"
                >
                  ⚙️ 관리
                </Link>
              )}
              {!myMembership && study.visibility !== "PRIVATE" && (
                <button
                  onClick={handleJoinClick}
                  className="px-4 md:px-6 py-3 min-h-[44px] bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-all active:scale-95 break-keep text-center"
                >
                  {study.visibility === "PASSWORD"
                    ? "비밀번호로 가입"
                    : "참가 신청"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 출퇴근 규칙 */}
        <div className="py-8 border-b border-border/20">
          <h2 className="text-lg font-light text-foreground mb-4">
            출퇴근 규칙
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
                운영 요일
              </p>
              <p className="text-sm text-foreground font-light">
                {formatDays(study.operatingDays)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
                출근 시간
              </p>
              <p className="text-sm text-foreground font-light">
                {study.checkInStartTime} ~ {study.checkInEndTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
                최소 퇴근 시간
              </p>
              <p className="text-sm text-foreground font-light">
                {study.checkOutMinTime} 이후
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
                최소 이용 시간
              </p>
              <p className="text-sm text-foreground font-light">
                {Math.floor(study.minUsageMinutes / 60)}시간{" "}
                {study.minUsageMinutes % 60 > 0 &&
                  `${study.minUsageMinutes % 60}분`}
              </p>
            </div>
          </div>
        </div>

        {/* 오늘의 출퇴근 현황 */}
        <div className="py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base md:text-lg font-light text-foreground">
                오늘의 출퇴근 현황
              </h2>
              <p className="text-xs text-muted-foreground/50 font-light">
                {new Date().toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>

            {attendance && attendance.length > 0 && (
              <div className="text-sm text-muted-foreground/60 font-light shrink-0">
                출석{" "}
                {
                  attendance.filter(
                    (a) => a.status !== "NOT_YET" && a.status !== "ABSENT"
                  ).length
                }
                /{attendance.length}명
              </div>
            )}
          </div>

          <div className="bg-background border border-border/20 rounded-lg p-6">
            <AttendanceList
              attendance={attendance || []}
              isLoading={isLoadingAttendance}
            />
          </div>
        </div>

        {/* 멤버 목록 */}
        <div className="py-8 border-t border-border/20">
          <h2 className="text-lg font-light text-foreground mb-4">
            멤버 ({study.members.length}명)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {study.members.map((member) => (
              <div
                key={member.memberId}
                className="flex items-center gap-3 p-3 bg-muted-foreground/5 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center text-sm font-light text-muted-foreground/60">
                  {member.displayName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-light text-foreground">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground/50 font-light">
                    {member.role === "OWNER"
                      ? "👑 스터디장"
                      : member.role === "ADMIN"
                        ? "🛡️ 부스터디장"
                        : "멤버"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 참가 신청 모달 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background/95 rounded-lg p-4 md:p-6 max-w-md w-full border border-border/30 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-light text-foreground mb-4">
              참가 신청
            </h3>
            <p className="text-sm text-muted-foreground/60 font-light mb-4">
              스터디장이 신청을 승인하면 가입됩니다.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm text-muted-foreground/60 font-light mb-2">
                  스터디 닉네임
                </label>
                <input
                  type="text"
                  value={joinDisplayName}
                  onChange={(e) => setJoinDisplayName(e.target.value)}
                  placeholder="스터디에서 사용할 닉네임을 입력하세요"
                  className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light"
                />
              </div>
            </div>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="자기소개나 가입 이유를 적어주세요 (선택)"
              className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light resize-none h-24 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-3 min-h-[44px] bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-all active:scale-95"
              >
                취소
              </button>
              <button
                onClick={handleRequestJoin}
                disabled={requestJoinMutation.isPending}
                className="flex-1 px-4 py-3 min-h-[44px] bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {requestJoinMutation.isPending ? "신청 중..." : "신청하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 가입 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background/95 rounded-lg p-4 md:p-6 max-w-md w-full border border-border/30 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-light text-foreground mb-4">
              비밀번호로 가입
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-muted-foreground/60 font-light mb-2">
                  스터디 비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground/60 font-light mb-2">
                  스터디 내 닉네임
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="스터디에서 사용할 닉네임"
                  className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 min-h-[44px] bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-all active:scale-95"
              >
                취소
              </button>
              <button
                onClick={handleJoinWithPassword}
                disabled={joinWithPasswordMutation.isPending}
                className="flex-1 px-4 py-3 min-h-[44px] bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {joinWithPasswordMutation.isPending ? "가입 중..." : "가입하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
