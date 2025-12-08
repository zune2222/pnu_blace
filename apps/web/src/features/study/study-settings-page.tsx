"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/features/auth";
import {
  useStudyGroupDetail,
  useMemberList,
  useJoinRequests,
  useUpdateMemberRole,
  useKickMember,
  useTransferOwnership,
  useProcessJoinRequest,
  useDeleteStudyGroup,
  useUpdateStudyGroup,
  studyApi,
} from "@/entities/study";
import { StudyMemberRole } from "@pnu-blace/types";

interface StudySettingsPageProps {
  groupId: string;
}

export const StudySettingsPage: React.FC<StudySettingsPageProps> = ({
  groupId,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "members" | "requests" | "settings"
  >("members");
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const { data: study, isLoading } = useStudyGroupDetail(groupId);
  const { data: members, refetch: refetchMembers } = useMemberList(groupId);
  const { data: requests, refetch: refetchRequests } = useJoinRequests(groupId);

  const updateRoleMutation = useUpdateMemberRole();
  const kickMutation = useKickMember();
  const transferMutation = useTransferOwnership();
  const processRequestMutation = useProcessJoinRequest();
  const deleteMutation = useDeleteStudyGroup();

  const handleRoleChange = async (
    memberId: string,
    newRole: StudyMemberRole
  ) => {
    if (newRole === "OWNER") {
      if (!confirm("정말로 스터디장을 위임하시겠습니까?")) return;
      const member = members?.find((m) => m.memberId === memberId);
      if (member) {
        try {
          await transferMutation.mutateAsync({
            groupId,
            newOwnerId: member.studentId,
          });
          toast.success("스터디장이 위임되었습니다.");
          refetchMembers();
        } catch (error: any) {
          toast.error(error.message || "위임에 실패했습니다.");
        }
      }
    } else {
      try {
        await updateRoleMutation.mutateAsync({
          groupId,
          memberId,
          role: newRole,
        });
        toast.success("역할이 변경되었습니다.");
        refetchMembers();
      } catch (error: any) {
        toast.error(error.message || "역할 변경에 실패했습니다.");
      }
    }
  };

  const handleKick = async (memberId: string, displayName: string) => {
    if (!confirm(`정말로 ${displayName}님을 내보내시겠습니까?`)) return;
    try {
      await kickMutation.mutateAsync({ groupId, memberId });
      toast.success("멤버가 내보내졌습니다.");
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message || "멤버 내보내기에 실패했습니다.");
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await processRequestMutation.mutateAsync({
        groupId,
        requestId,
        status: "APPROVED",
      });
      toast.success("참가 신청이 승인되었습니다.");
      refetchRequests();
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message || "승인에 실패했습니다.");
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("거절 사유를 입력하세요 (선택):");
    try {
      await processRequestMutation.mutateAsync({
        groupId,
        requestId,
        status: "REJECTED",
        rejectionReason: reason || undefined,
      });
      toast.success("참가 신청이 거절되었습니다.");
      refetchRequests();
    } catch (error: any) {
      toast.error(error.message || "거절에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "정말로 스터디를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    )
      return;

    try {
      await deleteMutation.mutateAsync(groupId);
      toast.success("스터디가 삭제되었습니다.");
      router.push("/study");
    } catch (error: any) {
      toast.error(error.message || "삭제에 실패했습니다.");
    }
  };

  const handleShowInviteCode = async () => {
    try {
      const result = await studyApi.getInviteCode(groupId);
      setInviteCode(result.inviteCode);
    } catch (error: any) {
      toast.error(error.message || "초대 코드 조회에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="animate-pulse space-y-8">
              <div className="h-8 w-64 bg-muted-foreground/10 rounded" />
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
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href={`/study/${groupId}`}
            className="text-sm text-muted-foreground/60 hover:text-foreground font-light mb-6 inline-block"
          >
            ← {study?.name || "스터디"} 로 돌아가기
          </Link>

          <h1 className="text-3xl font-extralight text-foreground mb-8">
            스터디 관리
          </h1>

          {/* 탭 */}
          <div className="flex gap-2 md:gap-4 border-b border-border/20 mb-6 md:mb-8 overflow-x-auto">
            {[
              { id: "members", label: "멤버 관리" },
              { id: "requests", label: `참가 신청 (${requests?.length || 0})` },
              { id: "settings", label: "설정" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-2 md:px-4 text-xs md:text-sm font-light transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 멤버 관리 탭 */}
          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-base md:text-lg font-light text-foreground">
                  멤버 ({members?.length || 0}명)
                </h2>
                <button
                  onClick={handleShowInviteCode}
                  className="px-4 py-2 bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  초대 코드 보기
                </button>
              </div>

              {inviteCode && (
                <div className="p-4 bg-muted-foreground/5 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground/60 font-light mb-2">
                    초대 코드
                  </p>
                  <p className="text-2xl font-mono tracking-widest">
                    {inviteCode}
                  </p>
                </div>
              )}

              {members?.map((member) => (
                <div
                  key={member.memberId}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background border border-border/20 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-muted-foreground/10 flex items-center justify-center text-lg font-light text-muted-foreground/60 shrink-0">
                      {member.displayName.charAt(0)}
                    </div>
                    <div className="min-w-0">
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

                  {member.role !== "OWNER" && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.memberId,
                            e.target.value as StudyMemberRole
                          )
                        }
                        className="px-3 py-1.5 bg-muted-foreground/5 border border-border/20 rounded text-sm font-light w-full sm:w-auto"
                      >
                        <option value="MEMBER">멤버</option>
                        <option value="ADMIN">부스터디장</option>
                        <option value="OWNER">스터디장 위임</option>
                      </select>
                      <button
                        onClick={() =>
                          handleKick(member.memberId, member.displayName)
                        }
                        className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded text-sm font-light hover:bg-red-500/20 transition-colors whitespace-nowrap"
                      >
                        내보내기
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 참가 신청 탭 */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <h2 className="text-lg font-light text-foreground mb-4">
                참가 신청 ({requests?.length || 0}건)
              </h2>

              {!requests || requests.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground/60 font-light">
                    대기 중인 참가 신청이 없습니다.
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.requestId}
                    className="p-4 bg-background border border-border/20 rounded-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-light text-foreground break-words">
                            {request.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground/60 font-light">
                            닉네임: {request.displayName}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground/50 font-light mt-1">
                          {new Date(request.createdAt).toLocaleString("ko-KR")}
                        </p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground/70 font-light mt-2 p-2 bg-muted-foreground/5 rounded break-words">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(request.requestId)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-500/10 text-green-500 rounded text-sm font-light hover:bg-green-500/20 transition-colors whitespace-nowrap"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(request.requestId)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-500/10 text-red-500 rounded text-sm font-light hover:bg-red-500/20 transition-colors whitespace-nowrap"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 설정 탭 */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="p-6 bg-background border border-border/20 rounded-lg">
                <h3 className="text-lg font-light text-foreground mb-4">
                  스터디 정보
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
                      이름
                    </p>
                    <p className="text-foreground font-light">{study?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/50 font-light uppercase mb-1">
                      공개 설정
                    </p>
                    <p className="text-foreground font-light">
                      {study?.visibility === "PUBLIC"
                        ? "🌍 공개"
                        : study?.visibility === "PASSWORD"
                          ? "🔐 비밀번호"
                          : "🔒 비공개"}
                    </p>
                  </div>
                  <Link
                    href={`/study/${groupId}/edit`}
                    className="inline-block px-4 py-2 bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-colors"
                  >
                    스터디 정보 수정
                  </Link>
                </div>
              </div>

              <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-lg">
                <h3 className="text-lg font-light text-red-500 mb-4">
                  위험 구역
                </h3>
                <p className="text-sm text-muted-foreground/60 font-light mb-4">
                  스터디를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-light hover:bg-red-600 transition-colors"
                >
                  스터디 삭제
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};
