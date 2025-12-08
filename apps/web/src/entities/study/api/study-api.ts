"use client";

import { apiClient } from "@/lib/api";
import {
  StudyGroupListResponse,
  StudyGroupDetail,
  TodayAttendancePublic,
  CreateStudyGroupDto,
  UpdateStudyGroupDto,
  MyStudyGroupListResponse,
  StudyActionResponse,
  JoinStudyRequestDto,
  JoinStudyWithPasswordDto,
  JoinStudyWithCodeDto,
  StudyMemberDetail,
  StudyMemberRole,
  JoinRequestInfo,
} from "@pnu-blace/types";

/**
 * 스터디 API 클라이언트
 */
class StudyApi {
  // ==================== Public API (비로그인) ====================

  /**
   * 공개 스터디 목록 조회
   */
  async getPublicStudyGroups(
    page: number = 1,
    limit: number = 20,
    search?: string,
    tags?: string[]
  ): Promise<StudyGroupListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    if (tags && tags.length > 0) {
      params.append("tags", tags.join(","));
    }

    return apiClient.publicGet<StudyGroupListResponse>(
      `/api/v1/study-groups/public?${params.toString()}`
    );
  }

  /**
   * 스터디 상세 정보 조회 (공개)
   */
  async getStudyGroupDetail(groupId: string): Promise<StudyGroupDetail> {
    return apiClient.publicGet<StudyGroupDetail>(
      `/api/v1/study-groups/public/${groupId}`
    );
  }

  /**
   * 오늘의 출퇴근 현황 조회 (공개)
   */
  async getTodayAttendance(groupId: string): Promise<TodayAttendancePublic[]> {
    return apiClient.publicGet<TodayAttendancePublic[]>(
      `/api/v1/study-groups/public/${groupId}/attendance`
    );
  }

  /**
   * 인기 태그 목록 조회
   */
  async getPopularTags(): Promise<{ tag: string; count: number }[]> {
    return apiClient.publicGet<{ tag: string; count: number }[]>(
      `/api/v1/study-groups/public/tags/popular`
    );
  }

  // ==================== 인증 필요 API ====================

  /**
   * 스터디 생성
   */
  async createStudyGroup(dto: CreateStudyGroupDto): Promise<StudyGroupDetail> {
    return apiClient.post<StudyGroupDetail>(`/api/v1/study-groups`, dto);
  }

  /**
   * 내 스터디 목록 조회
   */
  async getMyStudyGroups(): Promise<MyStudyGroupListResponse> {
    return apiClient.get<MyStudyGroupListResponse>(`/api/v1/study-groups/my`);
  }

  /**
   * 스터디 수정
   */
  async updateStudyGroup(
    groupId: string,
    dto: UpdateStudyGroupDto
  ): Promise<StudyGroupDetail> {
    return apiClient.put<StudyGroupDetail>(
      `/api/v1/study-groups/${groupId}`,
      dto
    );
  }

  /**
   * 스터디 삭제
   */
  async deleteStudyGroup(groupId: string): Promise<void> {
    return apiClient.delete(`/api/v1/study-groups/${groupId}`);
  }

  /**
   * 참가 신청 (공개 스터디)
   */
  async requestJoin(
    groupId: string,
    dto: JoinStudyRequestDto
  ): Promise<StudyActionResponse> {
    return apiClient.post<StudyActionResponse>(
      `/api/v1/study-groups/${groupId}/join`,
      dto
    );
  }

  /**
   * 비밀번호로 가입
   */
  async joinWithPassword(
    groupId: string,
    dto: JoinStudyWithPasswordDto
  ): Promise<StudyActionResponse> {
    return apiClient.post<StudyActionResponse>(
      `/api/v1/study-groups/${groupId}/join-password`,
      dto
    );
  }

  /**
   * 초대 코드로 가입
   */
  async joinWithInviteCode(
    dto: JoinStudyWithCodeDto
  ): Promise<StudyActionResponse> {
    return apiClient.post<StudyActionResponse>(
      `/api/v1/study-groups/join-code`,
      dto
    );
  }

  /**
   * 스터디 탈퇴
   */
  async leaveStudyGroup(groupId: string): Promise<void> {
    return apiClient.post(`/api/v1/study-groups/${groupId}/leave`);
  }

  /**
   * 초대 코드 조회
   */
  async getInviteCode(groupId: string): Promise<{ inviteCode: string }> {
    return apiClient.get<{ inviteCode: string }>(
      `/api/v1/study-groups/${groupId}/invite-code`
    );
  }

  // ==================== 멤버 관리 API ====================

  /**
   * 멤버 목록 조회 (상세)
   */
  async getMemberList(groupId: string): Promise<StudyMemberDetail[]> {
    return apiClient.get<StudyMemberDetail[]>(
      `/api/v1/study-groups/${groupId}/members`
    );
  }

  /**
   * 멤버 역할 변경
   */
  async updateMemberRole(
    groupId: string,
    memberId: string,
    role: StudyMemberRole
  ): Promise<StudyActionResponse> {
    return apiClient.put<StudyActionResponse>(
      `/api/v1/study-groups/${groupId}/members/${memberId}/role`,
      { role }
    );
  }

  /**
   * 멤버 강퇴
   */
  async kickMember(
    groupId: string,
    memberId: string
  ): Promise<StudyActionResponse> {
    return apiClient.delete(
      `/api/v1/study-groups/${groupId}/members/${memberId}`
    );
  }

  /**
   * 스터디장 위임
   */
  async transferOwnership(
    groupId: string,
    newOwnerId: string
  ): Promise<StudyActionResponse> {
    return apiClient.post<StudyActionResponse>(
      `/api/v1/study-groups/${groupId}/transfer`,
      { newOwnerId }
    );
  }

  /**
   * 참가 신청 목록 조회
   */
  async getJoinRequests(groupId: string): Promise<JoinRequestInfo[]> {
    return apiClient.get<JoinRequestInfo[]>(
      `/api/v1/study-groups/${groupId}/requests`
    );
  }

  /**
   * 참가 신청 처리 (승인/거절)
   */
  async processJoinRequest(
    groupId: string,
    requestId: string,
    status: "APPROVED" | "REJECTED",
    displayName?: string,
    rejectionReason?: string
  ): Promise<StudyActionResponse> {
    return apiClient.put<StudyActionResponse>(
      `/api/v1/study-groups/${groupId}/requests/${requestId}`,
      { status, displayName, rejectionReason }
    );
  }
}

export const studyApi = new StudyApi();
