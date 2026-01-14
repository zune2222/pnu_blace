"use client";

import React, { useState, useEffect } from "react";
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
import { VisibilityBadge } from "@/shared/ui";
import { AttendanceList } from "./ui/attendance-list";
import { StudyOverallStats } from "./ui/study-overall-stats";
import { StudyChat } from "./ui/study-chat";
import { DailyAttendanceViewer } from "./ui/daily-attendance-viewer";
import { PenaltyStats } from "./ui/penalty-stats";
import { StudyRules } from "./ui/study-rules";
import { JoinRequestModal, PasswordJoinModal } from "./ui/study-join-modals";
import { useStudyChat } from "@/entities/study/model/use-study-chat";
import { studyEvents } from "@/shared/lib/analytics";

type TabType = "attendance" | "chat";

interface StudyDetailPageProps {
  groupId: string;
}



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
  const [activeTab, setActiveTab] = useState<TabType>("attendance");

  const { data: study, isLoading, error } = useStudyGroupDetail(groupId);
  const { data: attendance, isLoading: isLoadingAttendance } =
    useTodayAttendance(groupId);
  const { data: myStudies } = useMyStudyGroups(isAuthenticated);

  // 스터디 상세 페이지 조회 이벤트
  useEffect(() => {
    if (study) {
      studyEvents.detailViewed({
        study_id: groupId,
        study_name: study.name,
        visibility: study.visibility,
        member_count: study.memberCount,
        is_member: !!myStudies?.items.find((s) => s.groupId === groupId),
      });
    }
  }, [study, groupId, myStudies]);

  const {
    messages: chatMessages,
    isConnected: chatConnected,
    userCount: chatUserCount,
    unreadCount,
    sendMessage,
    loadMore: chatLoadMore,
    resetUnread,
    hasMore: chatHasMore,
    isLoading: chatIsLoading,
  } = useStudyChat(groupId, activeTab === "chat");

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    resetUnread();
    studyEvents.tabSwitched(groupId, tab);
    if (tab === "chat") {
      studyEvents.chat({ study_id: groupId, action: "tab_opened" });
    }
  };

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

    const method = study?.visibility === "PASSWORD" ? "password" : "public_request";
    studyEvents.joinStarted(groupId, method);

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
      toast.success("참가 신청이 완료되었습니다.");

      if (study) {
        studyEvents.joined({
          study_id: groupId,
          study_name: study.name,
          join_method: "public_request",
        });
      }
    } catch (error: unknown) {
      studyEvents.joinFailed(groupId, error instanceof Error ? error.message : "unknown");
      toast.error(error instanceof Error ? error.message : "참가 신청에 실패했습니다.");
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

      if (study) {
        studyEvents.joined({
          study_id: groupId,
          study_name: study.name,
          join_method: "password",
        });
      }

      router.push(`/study/${groupId}`);
    } catch (error: unknown) {
      studyEvents.joinFailed(groupId, error instanceof Error ? error.message : "unknown");
      toast.error(error instanceof Error ? error.message : "가입에 실패했습니다.");
    }
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
          <Link href="/study" className="text-foreground hover:underline font-light">
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
                <span className="text-sm text-muted-foreground/40 hidden md:inline">•</span>
                <span className="text-sm text-muted-foreground/60 font-light">
                  👥 {study.memberCount}{study.maxMembers && `/${study.maxMembers}`}명
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
                  {study.visibility === "PASSWORD" ? "비밀번호로 가입" : "참가 신청"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-1 border-b border-border/20">
          <button
            onClick={() => handleTabChange("attendance")}
            className={`px-6 py-3 text-sm font-light transition-all border-b-2 ${
              activeTab === "attendance"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground/60 hover:text-foreground"
            }`}
          >
            📋 출결
          </button>
          <button
            onClick={() => handleTabChange("chat")}
            className={`px-6 py-3 text-sm font-light transition-all border-b-2 relative ${
              activeTab === "chat"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground/60 hover:text-foreground"
            }`}
          >
            💬 채팅
            {unreadCount > 0 && activeTab !== "chat" && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "attendance" ? (
          <>
            <StudyRules
              operatingDays={study.operatingDays}
              checkInStartTime={study.checkInStartTime}
              checkInEndTime={study.checkInEndTime}
              checkOutMinTime={study.checkOutMinTime}
              minUsageMinutes={study.minUsageMinutes}
            />
            <StudyOverallStats groupId={groupId} />
            <DailyAttendanceViewer groupId={groupId} />
            <PenaltyStats groupId={groupId} />

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
              </div>
              <AttendanceList
                groupId={groupId}
                attendance={attendance || []}
                isLoading={isLoadingAttendance}
              />
            </div>

            {/* 멤버 목록 */}
            <div className="py-8 border-t border-border/20">
              <h2 className="text-base md:text-lg font-light text-foreground mb-6">
                멤버 ({study.memberCount}명)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {study.members.map((member) => (
                  <div
                    key={member.memberId}
                    className="flex items-center gap-3 p-3 bg-muted-foreground/5 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted-foreground/10 flex items-center justify-center text-sm font-light text-muted-foreground/60">
                      {member.displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-foreground truncate">
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
          </>
        ) : (
          <div className="h-[calc(100vh-280px)] min-h-[400px]">
            <StudyChat
              messages={chatMessages}
              isConnected={chatConnected}
              userCount={chatUserCount}
              sendMessage={sendMessage}
              loadMore={chatLoadMore}
              hasMore={chatHasMore}
              isLoading={chatIsLoading}
            />
          </div>
        )}
      </div>

      {/* 모달 */}
      <JoinRequestModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        displayName={joinDisplayName}
        setDisplayName={setJoinDisplayName}
        message={joinMessage}
        setMessage={setJoinMessage}
        onSubmit={handleRequestJoin}
        isPending={requestJoinMutation.isPending}
      />

      <PasswordJoinModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        password={password}
        setPassword={setPassword}
        displayName={displayName}
        setDisplayName={setDisplayName}
        onSubmit={handleJoinWithPassword}
        isPending={joinWithPasswordMutation.isPending}
      />
    </div>
  );
};
