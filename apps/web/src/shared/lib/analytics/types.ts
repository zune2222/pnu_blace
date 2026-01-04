// Analytics Event Types - 모든 이벤트의 타입 정의

// 공통 속성
export interface BaseEventParams {
  timestamp?: number;
  session_id?: string;
  user_id?: string;
}

// ==================== 인증 이벤트 ====================
export interface AuthLoginParams extends BaseEventParams {
  method: 'credentials';
  success: boolean;
  error_type?: 'invalid_credentials' | 'rate_limited' | 'server_error' | 'network_error';
}

export interface AuthLogoutParams extends BaseEventParams {
  trigger: 'manual' | 'session_expired' | 'forced';
}

export interface AuthSessionParams extends BaseEventParams {
  duration_seconds?: number;
}

// ==================== 페이지 뷰 이벤트 ====================
export interface PageViewParams extends BaseEventParams {
  page_path: string;
  page_title: string;
  page_location: string;
  referrer?: string;
  is_first_visit?: boolean;
}

// ==================== 좌석 관련 이벤트 ====================
export interface SeatRoomViewedParams extends BaseEventParams {
  room_no: string;
  room_name: string;
  total_seats: number;
  available_seats: number;
  utilization_rate: number;
}

export interface SeatBookingParams extends BaseEventParams {
  room_no: string;
  room_name: string;
  seat_no: string;
  duration_hours?: number;
  booking_source: 'room_detail' | 'favorite' | 'dashboard';
}

export interface SeatActionParams extends BaseEventParams {
  action: 'extend' | 'leave' | 'cancel';
  room_no: string;
  seat_no: string;
  remaining_time_minutes?: number;
}

export interface RoomChatParams extends BaseEventParams {
  room_no: string;
  action: 'opened' | 'closed' | 'message_sent';
  message_length?: number;
}

// ==================== 스터디 그룹 이벤트 ====================
export interface StudyListViewedParams extends BaseEventParams {
  total_count: number;
  filter_applied?: boolean;
  search_query?: string;
  tags?: string[];
}

export interface StudyDetailViewedParams extends BaseEventParams {
  study_id: string;
  study_name: string;
  visibility: 'PUBLIC' | 'PASSWORD' | 'PRIVATE';
  member_count: number;
  is_member: boolean;
}

export interface StudyCreatedParams extends BaseEventParams {
  study_id: string;
  study_name: string;
  visibility: 'PUBLIC' | 'PASSWORD' | 'PRIVATE';
  max_members: number;
  has_rules: boolean;
  tags?: string[];
}

export interface StudyJoinedParams extends BaseEventParams {
  study_id: string;
  study_name: string;
  join_method: 'public_request' | 'password' | 'invite_code' | 'direct';
}

export interface StudyLeftParams extends BaseEventParams {
  study_id: string;
  study_name: string;
  membership_duration_days: number;
}

export interface StudyChatParams extends BaseEventParams {
  study_id: string;
  action: 'tab_opened' | 'message_sent' | 'message_received';
  message_length?: number;
}

export interface StudyAttendanceParams extends BaseEventParams {
  study_id: string;
  action: 'check_in' | 'check_out' | 'viewed';
  attendance_type?: 'on_time' | 'late' | 'absent';
}

// ==================== 랭킹 이벤트 ====================
export interface RankingsViewedParams extends BaseEventParams {
  ranking_type: 'weekly' | 'all_time';
  user_rank?: number;
  total_users?: number;
}

export interface RankingsFilterChangedParams extends BaseEventParams {
  from_type: 'weekly' | 'all_time';
  to_type: 'weekly' | 'all_time';
}

// ==================== 사용자 통계 이벤트 ====================
export interface StatsViewedParams extends BaseEventParams {
  section: 'overview' | 'streak' | 'history' | 'patterns';
  current_streak?: number;
  total_study_hours?: number;
}

// ==================== 즐겨찾기 이벤트 ====================
export interface FavoriteParams extends BaseEventParams {
  action: 'added' | 'removed';
  room_no: string;
  room_name: string;
  total_favorites?: number;
}

// ==================== 설정 이벤트 ====================
export interface SettingsChangedParams extends BaseEventParams {
  setting_name: string;
  old_value?: string | boolean;
  new_value: string | boolean;
}

export interface NotificationSettingParams extends BaseEventParams {
  notification_type: 'study_chat' | 'room_chat' | 'push';
  enabled: boolean;
}

// ==================== 검색 이벤트 ====================
export interface SearchParams extends BaseEventParams {
  search_term: string;
  search_type: 'study' | 'room';
  results_count: number;
}

// ==================== 폼 이벤트 ====================
export interface FormParams extends BaseEventParams {
  form_name: string;
  step?: number;
  total_steps?: number;
  field_name?: string;
  error_type?: string;
  duration_seconds?: number;
}

// ==================== 에러 이벤트 ====================
export interface ErrorParams extends BaseEventParams {
  error_type: string;
  error_message: string;
  error_code?: string | number;
  page_path: string;
  component?: string;
}

// ==================== 성능 이벤트 ====================
export interface PerformanceParams extends BaseEventParams {
  metric_name: 'page_load' | 'api_response' | 'render_time';
  value_ms: number;
  page_path?: string;
  api_endpoint?: string;
}

// ==================== 네비게이션 이벤트 ====================
export interface NavigationParams extends BaseEventParams {
  from_path: string;
  to_path: string;
  navigation_type: 'link' | 'back' | 'programmatic';
}

// ==================== 사용자 속성 ====================
export interface UserProperties {
  user_type: 'guest' | 'authenticated';
  student_id?: string;
  registration_date?: string;
  total_study_hours?: number;
  current_streak?: number;
  favorite_rooms_count?: number;
  study_groups_count?: number;
  platform: 'web' | 'ios' | 'android';
  theme_preference: 'light' | 'dark' | 'system';
}

// 모든 이벤트 타입의 유니온
export type AnalyticsEventParams =
  | AuthLoginParams
  | AuthLogoutParams
  | AuthSessionParams
  | PageViewParams
  | SeatRoomViewedParams
  | SeatBookingParams
  | SeatActionParams
  | RoomChatParams
  | StudyListViewedParams
  | StudyDetailViewedParams
  | StudyCreatedParams
  | StudyJoinedParams
  | StudyLeftParams
  | StudyChatParams
  | StudyAttendanceParams
  | RankingsViewedParams
  | RankingsFilterChangedParams
  | StatsViewedParams
  | FavoriteParams
  | SettingsChangedParams
  | NotificationSettingParams
  | SearchParams
  | FormParams
  | ErrorParams
  | PerformanceParams
  | NavigationParams;
