// API
export { studyApi } from "./api/study-api";

// Hooks
export {
  studyQueryKeys,
  usePublicStudyGroups,
  useStudyGroupDetail,
  useTodayAttendance,
  useGroupStreakStats,
  useMyStudyGroups,
  usePopularTags,
  useCreateStudyGroup,
  useUpdateStudyGroup,
  useDeleteStudyGroup,
  useRequestJoin,
  useJoinWithPassword,
  useJoinWithInviteCode,
  useLeaveStudyGroup,
  // 관리 기능
  useMemberList,
  useUpdateMemberRole,
  useKickMember,
  useTransferOwnership,
  useJoinRequests,
  useProcessJoinRequest,
} from "./model/hooks";

// Re-export types
export type {
  StudyVisibility,
  StudyMemberRole,
  AttendanceStatus,
  StudyGroupListItem,
  StudyGroupDetail,
  StudyMemberPublic,
  StudyMemberDetail,
  TodayAttendancePublic,
  CreateStudyGroupDto,
  UpdateStudyGroupDto,
  MyStudyGroupItem,
  JoinRequestInfo,
} from "@pnu-blace/types";
