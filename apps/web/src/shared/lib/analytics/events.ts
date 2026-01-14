import { logAnalyticsEvent, identifyUser, setUserProps } from './logger';
import type {
  AuthLoginParams,
  AuthLogoutParams,
  PageViewParams,
  SeatRoomViewedParams,
  SeatBookingParams,
  SeatActionParams,
  RoomChatParams,
  StudyListViewedParams,
  StudyDetailViewedParams,
  StudyCreatedParams,
  StudyJoinedParams,
  StudyLeftParams,
  StudyChatParams,
  StudyAttendanceParams,
  RankingsViewedParams,
  RankingsFilterChangedParams,
  StatsViewedParams,
  FavoriteParams,
  SettingsChangedParams,
  NotificationSettingParams,
  SearchParams,
  FormParams,
  ErrorParams,
  NavigationParams,
  UserProperties,
} from './types';

// 세션 ID 생성
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  return sessionId;
}

function withCommonParams<T extends object>(params: T): T & { session_id: string; timestamp: number } {
  return {
    ...params,
    session_id: getSessionId(),
    timestamp: Date.now(),
  };
}

// ==================== 인증 이벤트 ====================

export const authEvents = {
  login: (params: Omit<AuthLoginParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('login', withCommonParams(params));

    // GA4 추천 이벤트
    if (params.success) {
      logAnalyticsEvent('sign_in', { method: params.method });
    }
  },

  logout: (params: Omit<AuthLogoutParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('logout', withCommonParams(params));
  },

  sessionStart: () => {
    sessionId = null; // 새 세션 시작
    logAnalyticsEvent('session_start', withCommonParams({}));
  },

  sessionEnd: (durationSeconds: number) => {
    logAnalyticsEvent('session_end', withCommonParams({ duration_seconds: durationSeconds }));
  },

  identify: async (userId: string | null, properties?: Partial<UserProperties>) => {
    await identifyUser(userId);
    if (properties) {
      await setUserProps(properties as Record<string, string>);
    }
  },
};

// ==================== 페이지 뷰 이벤트 ====================

export const pageEvents = {
  view: (params: Omit<PageViewParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('page_view', withCommonParams(params));

    // GA4 추천 이벤트 (screen_view는 앱용이지만 웹에서도 유용)
    logAnalyticsEvent('screen_view', {
      screen_name: params.page_title,
      screen_class: params.page_path,
    });
  },

  navigation: (params: Omit<NavigationParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('navigation', withCommonParams(params));
  },
};

// ==================== 좌석 관련 이벤트 ====================

export const seatEvents = {
  roomListViewed: (totalRooms: number) => {
    logAnalyticsEvent('seat_room_list_viewed', withCommonParams({ total_rooms: totalRooms }));
  },

  roomViewed: (params: Omit<SeatRoomViewedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('seat_room_viewed', withCommonParams(params));

    // GA4 추천 이벤트
    logAnalyticsEvent('view_item', {
      items: [{
        item_id: params.room_no,
        item_name: params.room_name,
        item_category: 'study_room',
        quantity: params.available_seats,
      }],
    });
  },

  bookingStarted: (params: Omit<SeatBookingParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('seat_booking_started', withCommonParams(params));

    // GA4 추천 이벤트
    logAnalyticsEvent('begin_checkout', {
      items: [{
        item_id: `${params.room_no}-${params.seat_no}`,
        item_name: `${params.room_name} - ${params.seat_no}`,
        item_category: 'seat_reservation',
      }],
    });
  },

  bookingCompleted: (params: Omit<SeatBookingParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('seat_booking_completed', withCommonParams(params));

    // GA4 추천 이벤트 - 구매 완료 (좌석 예약을 구매로 취급)
    logAnalyticsEvent('purchase', {
      transaction_id: `${params.room_no}-${params.seat_no}-${Date.now()}`,
      value: 0, // 무료
      currency: 'KRW',
      items: [{
        item_id: `${params.room_no}-${params.seat_no}`,
        item_name: `${params.room_name} - ${params.seat_no}`,
        item_category: 'seat_reservation',
      }],
    });
  },

  bookingFailed: (params: Omit<SeatBookingParams, 'timestamp' | 'session_id'> & { error: string }) => {
    logAnalyticsEvent('seat_booking_failed', withCommonParams(params));
  },

  action: (params: Omit<SeatActionParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent(`seat_${params.action}`, withCommonParams(params));
  },

  roomChat: (params: Omit<RoomChatParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('room_chat', withCommonParams(params));
  },
};

// ==================== 스터디 그룹 이벤트 ====================

export const studyEvents = {
  listViewed: (params: Omit<StudyListViewedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('study_list_viewed', withCommonParams(params));

    // GA4 추천 이벤트
    logAnalyticsEvent('view_item_list', {
      item_list_id: 'study_groups',
      item_list_name: 'Study Groups',
    });
  },

  detailViewed: (params: Omit<StudyDetailViewedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('study_detail_viewed', withCommonParams(params));

    // GA4 추천 이벤트
    logAnalyticsEvent('view_item', {
      items: [{
        item_id: params.study_id,
        item_name: params.study_name,
        item_category: 'study_group',
        item_variant: params.visibility,
      }],
    });
  },

  createStarted: (formStep: number) => {
    logAnalyticsEvent('study_create_started', withCommonParams({ step: formStep }));
  },

  createStepCompleted: (step: number, totalSteps: number) => {
    logAnalyticsEvent('study_create_step_completed', withCommonParams({
      step,
      total_steps: totalSteps,
      completion_rate: Math.round((step / totalSteps) * 100),
    }));
  },

  created: (params: Omit<StudyCreatedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('study_created', withCommonParams(params));

    // GA4 추천 이벤트 - 그룹 가입으로 취급
    logAnalyticsEvent('join_group', {
      group_id: params.study_id,
      method: 'create',
    });
  },

  createFailed: (error: string, step: number) => {
    logAnalyticsEvent('study_create_failed', withCommonParams({ error, step }));
  },

  joinStarted: (studyId: string, method: string) => {
    logAnalyticsEvent('study_join_started', withCommonParams({ study_id: studyId, method }));
  },

  joined: (params: Omit<StudyJoinedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('study_joined', withCommonParams(params));

    // GA4 추천 이벤트
    logAnalyticsEvent('join_group', {
      group_id: params.study_id,
      method: params.join_method,
    });
  },

  joinFailed: (studyId: string, error: string) => {
    logAnalyticsEvent('study_join_failed', withCommonParams({ study_id: studyId, error }));
  },

  left: (params: Omit<StudyLeftParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('study_left', withCommonParams(params));
  },

  chat: (params: Omit<StudyChatParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('study_chat', withCommonParams(params));
  },

  attendance: (params: Omit<StudyAttendanceParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('study_attendance', withCommonParams(params));
  },

  tabSwitched: (studyId: string, tabName: string) => {
    logAnalyticsEvent('study_tab_switched', withCommonParams({ study_id: studyId, tab_name: tabName }));
  },

  searched: (query: string, resultsCount: number, tags?: string[]) => {
    logAnalyticsEvent('study_searched', withCommonParams({
      search_term: query,
      results_count: resultsCount,
      tags: tags?.join(','),
    }));

    // GA4 추천 이벤트
    logAnalyticsEvent('search', {
      search_term: query,
    });
  },
};

// ==================== 랭킹 이벤트 ====================

export const rankingsEvents = {
  viewed: (params: Omit<RankingsViewedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('rankings_viewed', withCommonParams(params));
  },

  filterChanged: (params: Omit<RankingsFilterChangedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('rankings_filter_changed', withCommonParams(params));
  },
};

// ==================== 사용자 통계 이벤트 ====================

export const statsEvents = {
  viewed: (params: Omit<StatsViewedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('stats_viewed', withCommonParams(params));
  },

  sectionExpanded: (section: string) => {
    logAnalyticsEvent('stats_section_expanded', withCommonParams({ section }));
  },
};

// ==================== 즐겨찾기 이벤트 ====================

export const favoriteEvents = {
  toggle: (params: Omit<FavoriteParams, 'timestamp' | 'session_id'>) => {
    const eventName = params.action === 'added' ? 'favorite_added' : 'favorite_removed';
    logAnalyticsEvent(eventName, withCommonParams(params));

    // GA4 추천 이벤트
    if (params.action === 'added') {
      logAnalyticsEvent('add_to_wishlist', {
        items: [{
          item_id: params.room_no,
          item_name: params.room_name,
          item_category: 'study_room',
        }],
      });
    }
  },
};

// ==================== 설정 이벤트 ====================

export const settingsEvents = {
  changed: (params: Omit<SettingsChangedParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('settings_changed', withCommonParams(params));
  },

  notificationToggled: (params: Omit<NotificationSettingParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('notification_setting_changed', withCommonParams(params));
  },

  themeChanged: (theme: 'light' | 'dark') => {
    logAnalyticsEvent('theme_changed', withCommonParams({ theme }));
  },
};

// ==================== 검색 이벤트 ====================

export const searchEvents = {
  performed: (params: Omit<SearchParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('search_performed', withCommonParams(params));

    // GA4 추천 이벤트
    logAnalyticsEvent('search', {
      search_term: params.search_term,
    });
  },

  resultClicked: (searchTerm: string, resultId: string, resultPosition: number) => {
    logAnalyticsEvent('search_result_clicked', withCommonParams({
      search_term: searchTerm,
      result_id: resultId,
      result_position: resultPosition,
    }));

    // GA4 추천 이벤트
    logAnalyticsEvent('select_content', {
      content_type: 'search_result',
      item_id: resultId,
    });
  },
};

// ==================== 폼 이벤트 ====================

export const formEvents = {
  started: (formName: string, totalSteps?: number) => {
    logAnalyticsEvent('form_started', withCommonParams({
      form_name: formName,
      total_steps: totalSteps,
    }));
  },

  stepCompleted: (params: Omit<FormParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('form_step_completed', withCommonParams(params));
  },

  fieldError: (formName: string, fieldName: string, errorType: string) => {
    logAnalyticsEvent('form_field_error', withCommonParams({
      form_name: formName,
      field_name: fieldName,
      error_type: errorType,
    }));
  },

  submitted: (formName: string, durationSeconds: number) => {
    logAnalyticsEvent('form_submitted', withCommonParams({
      form_name: formName,
      duration_seconds: durationSeconds,
    }));
  },

  abandoned: (formName: string, lastStep: number) => {
    logAnalyticsEvent('form_abandoned', withCommonParams({
      form_name: formName,
      last_step: lastStep,
    }));
  },
};

// ==================== 에러 이벤트 ====================

export const errorEvents = {
  occurred: (params: Omit<ErrorParams, 'timestamp' | 'session_id'>) => {
    logAnalyticsEvent('error_occurred', withCommonParams(params));

    // GA4 추천 이벤트
    logAnalyticsEvent('exception', {
      description: params.error_message,
      fatal: false,
    });
  },

  apiError: (endpoint: string, statusCode: number, message: string) => {
    logAnalyticsEvent('api_error', withCommonParams({
      endpoint,
      status_code: statusCode,
      error_message: message,
    }));
  },
};

// ==================== 성능 이벤트 ====================

export const performanceEvents = {
  pageLoad: (pagePath: string, loadTimeMs: number) => {
    logAnalyticsEvent('page_load_time', withCommonParams({
      page_path: pagePath,
      load_time_ms: loadTimeMs,
    }));
  },

  apiResponse: (endpoint: string, responseTimeMs: number, success: boolean) => {
    logAnalyticsEvent('api_response_time', withCommonParams({
      endpoint,
      response_time_ms: responseTimeMs,
      success,
    }));
  },

  webVitals: (metric: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') => {
    logAnalyticsEvent('web_vitals', withCommonParams({
      metric_name: metric,
      metric_value: value,
      rating,
    }));
  },
};

// ==================== 참여 이벤트 ====================

export const engagementEvents = {
  ctaClicked: (ctaName: string, ctaLocation: string) => {
    logAnalyticsEvent('cta_clicked', withCommonParams({
      cta_name: ctaName,
      cta_location: ctaLocation,
    }));

    // GA4 추천 이벤트
    logAnalyticsEvent('select_content', {
      content_type: 'cta',
      item_id: ctaName,
    });
  },

  featureUsed: (featureName: string, details?: Record<string, unknown>) => {
    logAnalyticsEvent('feature_used', withCommonParams({
      feature_name: featureName,
      ...details,
    }));
  },

  shareContent: (contentType: string, contentId: string, method: string) => {
    logAnalyticsEvent('share', {
      content_type: contentType,
      item_id: contentId,
      method,
    });
  },

  scroll: (pagePath: string, scrollDepthPercent: number) => {
    // 25%, 50%, 75%, 100% 구간에서만 트래킹
    if ([25, 50, 75, 100].includes(scrollDepthPercent)) {
      logAnalyticsEvent('scroll_depth', withCommonParams({
        page_path: pagePath,
        percent_scrolled: scrollDepthPercent,
      }));
    }
  },

  timeOnPage: (pagePath: string, durationSeconds: number) => {
    // 10초, 30초, 60초, 180초, 300초 이상일 때만 트래킹
    const thresholds = [10, 30, 60, 180, 300];
    const threshold = thresholds.find(t => durationSeconds >= t);
    if (threshold) {
      logAnalyticsEvent('time_on_page', withCommonParams({
        page_path: pagePath,
        duration_seconds: durationSeconds,
        threshold_reached: threshold,
      }));
    }
  },
};
