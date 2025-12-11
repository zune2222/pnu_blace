"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "../api/study-api";
import {
  CreateStudyGroupDto,
  UpdateStudyGroupDto,
  JoinStudyRequestDto,
  JoinStudyWithPasswordDto,
  JoinStudyWithCodeDto,
  MemberAttendanceHistoryRequest,
} from "@pnu-blace/types";

// Query Keys
export const studyQueryKeys = {
  all: ["study"] as const,
  publicList: (page: number, search?: string, tags?: string[]) =>
    [...studyQueryKeys.all, "public", page, search, tags] as const,
  detail: (groupId: string) =>
    [...studyQueryKeys.all, "detail", groupId] as const,
  attendance: (groupId: string) =>
    [...studyQueryKeys.all, "attendance", groupId] as const,
  streakStats: (groupId: string) =>
    [...studyQueryKeys.all, "streak", groupId] as const,
  memberHistory: (groupId: string, memberId: string, request: MemberAttendanceHistoryRequest) =>
    [...studyQueryKeys.all, "memberHistory", groupId, memberId, request] as const,
  myStudies: () => [...studyQueryKeys.all, "my"] as const,
  popularTags: () => [...studyQueryKeys.all, "tags"] as const,
};

/**
 * 공개 스터디 목록 조회
 */
export const usePublicStudyGroups = (
  page: number = 1,
  search?: string,
  tags?: string[]
) => {
  return useQuery({
    queryKey: studyQueryKeys.publicList(page, search, tags),
    queryFn: () => studyApi.getPublicStudyGroups(page, 20, search, tags),
  });
};

/**
 * 스터디 상세 정보 조회
 */
export const useStudyGroupDetail = (groupId: string) => {
  return useQuery({
    queryKey: studyQueryKeys.detail(groupId),
    queryFn: () => studyApi.getStudyGroupDetail(groupId),
    enabled: !!groupId,
  });
};

/**
 * 오늘의 출퇴근 현황 조회
 */
export const useTodayAttendance = (groupId: string) => {
  return useQuery({
    queryKey: studyQueryKeys.attendance(groupId),
    queryFn: () => studyApi.getTodayAttendance(groupId),
    enabled: !!groupId,
    refetchInterval: 60000, // 1분마다 자동 갱신
  });
};

/**
 * 스터디 그룹 연속성 통계 조회
 */
export const useGroupStreakStats = (groupId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: studyQueryKeys.streakStats(groupId),
    queryFn: () => studyApi.getGroupStreakStats(groupId),
    enabled: !!groupId && enabled,
  });
};

/**
 * 멤버 출석 이력 조회
 */
export const useMemberAttendanceHistory = (
  groupId: string,
  memberId: string,
  request: MemberAttendanceHistoryRequest = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: studyQueryKeys.memberHistory(groupId, memberId, request),
    queryFn: () => studyApi.getMemberAttendanceHistory(groupId, memberId, request),
    enabled: !!groupId && !!memberId && enabled,
  });
};

/**
 * 내 스터디 목록 조회
 */
export const useMyStudyGroups = (enabled: boolean = true) => {
  return useQuery({
    queryKey: studyQueryKeys.myStudies(),
    queryFn: () => studyApi.getMyStudyGroups(),
    enabled,
  });
};

/**
 * 인기 태그 목록 조회
 */
export const usePopularTags = () => {
  return useQuery({
    queryKey: studyQueryKeys.popularTags(),
    queryFn: () => studyApi.getPopularTags(),
  });
};

/**
 * 스터디 생성
 */
export const useCreateStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateStudyGroupDto) => studyApi.createStudyGroup(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyQueryKeys.all });
    },
  });
};

/**
 * 스터디 수정
 */
export const useUpdateStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      dto,
    }: {
      groupId: string;
      dto: UpdateStudyGroupDto;
    }) => studyApi.updateStudyGroup(groupId, dto),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: studyQueryKeys.detail(groupId),
      });
      queryClient.invalidateQueries({ queryKey: studyQueryKeys.myStudies() });
    },
  });
};

/**
 * 스터디 삭제
 */
export const useDeleteStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => studyApi.deleteStudyGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyQueryKeys.all });
    },
  });
};

/**
 * 참가 신청
 */
export const useRequestJoin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      dto,
    }: {
      groupId: string;
      dto: JoinStudyRequestDto;
    }) => studyApi.requestJoin(groupId, dto),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: studyQueryKeys.detail(groupId),
      });
    },
  });
};

/**
 * 비밀번호로 가입
 */
export const useJoinWithPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      dto,
    }: {
      groupId: string;
      dto: JoinStudyWithPasswordDto;
    }) => studyApi.joinWithPassword(groupId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyQueryKeys.all });
    },
  });
};

/**
 * 초대 코드로 가입
 */
export const useJoinWithInviteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: JoinStudyWithCodeDto) => studyApi.joinWithInviteCode(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyQueryKeys.all });
    },
  });
};

/**
 * 스터디 탈퇴
 */
export const useLeaveStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => studyApi.leaveStudyGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyQueryKeys.all });
    },
  });
};

// ==================== 관리 기능 Hooks ====================

/**
 * 멤버 목록 조회 (상세)
 */
export const useMemberList = (groupId: string) => {
  return useQuery({
    queryKey: [...studyQueryKeys.detail(groupId), "members"],
    queryFn: () => studyApi.getMemberList(groupId),
    enabled: !!groupId,
  });
};

/**
 * 멤버 역할 변경
 */
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      memberId,
      role,
    }: {
      groupId: string;
      memberId: string;
      role: "OWNER" | "ADMIN" | "MEMBER";
    }) => studyApi.updateMemberRole(groupId, memberId, role),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: studyQueryKeys.detail(groupId),
      });
    },
  });
};

/**
 * 멤버 강퇴
 */
export const useKickMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      memberId,
    }: {
      groupId: string;
      memberId: string;
    }) => studyApi.kickMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: studyQueryKeys.detail(groupId),
      });
    },
  });
};

/**
 * 스터디장 위임
 */
export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      newOwnerId,
    }: {
      groupId: string;
      newOwnerId: string;
    }) => studyApi.transferOwnership(groupId, newOwnerId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: studyQueryKeys.detail(groupId),
      });
    },
  });
};

/**
 * 참가 신청 목록 조회
 */
export const useJoinRequests = (groupId: string) => {
  return useQuery({
    queryKey: [...studyQueryKeys.detail(groupId), "requests"],
    queryFn: () => studyApi.getJoinRequests(groupId),
    enabled: !!groupId,
  });
};

/**
 * 참가 신청 처리
 */
export const useProcessJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      requestId,
      status,
      rejectionReason,
    }: {
      groupId: string;
      requestId: string;
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    }) =>
      studyApi.processJoinRequest(groupId, requestId, status, rejectionReason),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: studyQueryKeys.detail(groupId),
      });
    },
  });
};
