'use client';

import { useCallback, useRef, useEffect } from 'react';
import {
  authEvents,
  pageEvents,
  seatEvents,
  studyEvents,
  rankingsEvents,
  statsEvents,
  favoriteEvents,
  settingsEvents,
  searchEvents,
  formEvents,
  errorEvents,
  performanceEvents,
  engagementEvents,
} from '@/shared/lib/analytics';

// 모든 analytics 이벤트를 하나의 hook에서 사용
export function useAnalytics() {
  return {
    auth: authEvents,
    page: pageEvents,
    seat: seatEvents,
    study: studyEvents,
    rankings: rankingsEvents,
    stats: statsEvents,
    favorite: favoriteEvents,
    settings: settingsEvents,
    search: searchEvents,
    form: formEvents,
    error: errorEvents,
    performance: performanceEvents,
    engagement: engagementEvents,
  };
}

// 폼 분석을 위한 hook
export function useFormAnalytics(formName: string, totalSteps?: number) {
  const startTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);

  const startForm = useCallback(() => {
    startTimeRef.current = Date.now();
    currentStepRef.current = 1;
    formEvents.started(formName, totalSteps);
  }, [formName, totalSteps]);

  const completeStep = useCallback((step: number) => {
    currentStepRef.current = step;
    formEvents.stepCompleted({
      form_name: formName,
      step,
      total_steps: totalSteps,
    });
  }, [formName, totalSteps]);

  const fieldError = useCallback((fieldName: string, errorType: string) => {
    formEvents.fieldError(formName, fieldName, errorType);
  }, [formName]);

  const submitForm = useCallback(() => {
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    formEvents.submitted(formName, durationSeconds);
  }, [formName]);

  const abandonForm = useCallback(() => {
    formEvents.abandoned(formName, currentStepRef.current);
  }, [formName]);

  // 페이지 이탈 시 폼 포기 이벤트
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (startTimeRef.current > 0 && currentStepRef.current > 0) {
        abandonForm();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [abandonForm]);

  return {
    startForm,
    completeStep,
    fieldError,
    submitForm,
    abandonForm,
  };
}

// API 요청 성능 측정 hook
export function useApiPerformance() {
  return useCallback(async <T>(
    endpoint: string,
    request: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    let success = true;

    try {
      const result = await request();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const responseTime = Math.round(performance.now() - startTime);
      performanceEvents.apiResponse(endpoint, responseTime, success);
    }
  }, []);
}

// 검색 분석 hook
export function useSearchAnalytics(searchType: 'study' | 'room') {
  const lastSearchRef = useRef<{ term: string; time: number } | null>(null);

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    // 디바운스: 500ms 내에 같은 검색어면 무시
    const now = Date.now();
    if (
      lastSearchRef.current &&
      lastSearchRef.current.term === searchTerm &&
      now - lastSearchRef.current.time < 500
    ) {
      return;
    }

    lastSearchRef.current = { term: searchTerm, time: now };

    searchEvents.performed({
      search_term: searchTerm,
      search_type: searchType,
      results_count: resultsCount,
    });
  }, [searchType]);

  const trackResultClick = useCallback((searchTerm: string, resultId: string, position: number) => {
    searchEvents.resultClicked(searchTerm, resultId, position);
  }, []);

  return { trackSearch, trackResultClick };
}

// 스터디 그룹 분석 hook
export function useStudyAnalytics() {
  const trackListView = useCallback((params: {
    totalCount: number;
    filterApplied?: boolean;
    searchQuery?: string;
    tags?: string[];
  }) => {
    studyEvents.listViewed({
      total_count: params.totalCount,
      filter_applied: params.filterApplied,
      search_query: params.searchQuery,
      tags: params.tags,
    });
  }, []);

  const trackDetailView = useCallback((params: {
    studyId: string;
    studyName: string;
    visibility: 'PUBLIC' | 'PASSWORD' | 'PRIVATE';
    memberCount: number;
    isMember: boolean;
  }) => {
    studyEvents.detailViewed({
      study_id: params.studyId,
      study_name: params.studyName,
      visibility: params.visibility,
      member_count: params.memberCount,
      is_member: params.isMember,
    });
  }, []);

  const trackCreation = useCallback((params: {
    studyId: string;
    studyName: string;
    visibility: 'PUBLIC' | 'PASSWORD' | 'PRIVATE';
    maxMembers: number;
    hasRules: boolean;
    tags?: string[];
  }) => {
    studyEvents.created({
      study_id: params.studyId,
      study_name: params.studyName,
      visibility: params.visibility,
      max_members: params.maxMembers,
      has_rules: params.hasRules,
      tags: params.tags,
    });
  }, []);

  const trackJoin = useCallback((params: {
    studyId: string;
    studyName: string;
    joinMethod: 'public_request' | 'password' | 'invite_code' | 'direct';
  }) => {
    studyEvents.joined({
      study_id: params.studyId,
      study_name: params.studyName,
      join_method: params.joinMethod,
    });
  }, []);

  const trackChat = useCallback((studyId: string, action: 'tab_opened' | 'message_sent' | 'message_received', messageLength?: number) => {
    studyEvents.chat({
      study_id: studyId,
      action,
      message_length: messageLength,
    });
  }, []);

  return {
    trackListView,
    trackDetailView,
    trackCreation,
    trackJoin,
    trackChat,
  };
}

// 좌석 분석 hook
export function useSeatAnalytics() {
  const trackRoomView = useCallback((params: {
    roomNo: string;
    roomName: string;
    totalSeats: number;
    availableSeats: number;
  }) => {
    const utilizationRate = Math.round(((params.totalSeats - params.availableSeats) / params.totalSeats) * 100);
    seatEvents.roomViewed({
      room_no: params.roomNo,
      room_name: params.roomName,
      total_seats: params.totalSeats,
      available_seats: params.availableSeats,
      utilization_rate: utilizationRate,
    });
  }, []);

  const trackBookingStart = useCallback((params: {
    roomNo: string;
    roomName: string;
    seatNo: string;
    source: 'room_detail' | 'favorite' | 'dashboard';
  }) => {
    seatEvents.bookingStarted({
      room_no: params.roomNo,
      room_name: params.roomName,
      seat_no: params.seatNo,
      booking_source: params.source,
    });
  }, []);

  const trackBookingComplete = useCallback((params: {
    roomNo: string;
    roomName: string;
    seatNo: string;
    durationHours?: number;
  }) => {
    seatEvents.bookingCompleted({
      room_no: params.roomNo,
      room_name: params.roomName,
      seat_no: params.seatNo,
      duration_hours: params.durationHours,
      booking_source: 'room_detail',
    });
  }, []);

  const trackAction = useCallback((params: {
    action: 'extend' | 'leave' | 'cancel';
    roomNo: string;
    seatNo: string;
    remainingMinutes?: number;
  }) => {
    seatEvents.action({
      action: params.action,
      room_no: params.roomNo,
      seat_no: params.seatNo,
      remaining_time_minutes: params.remainingMinutes,
    });
  }, []);

  const trackRoomChat = useCallback((roomNo: string, action: 'opened' | 'closed' | 'message_sent', messageLength?: number) => {
    seatEvents.roomChat({
      room_no: roomNo,
      action,
      message_length: messageLength,
    });
  }, []);

  return {
    trackRoomView,
    trackBookingStart,
    trackBookingComplete,
    trackAction,
    trackRoomChat,
  };
}

// 에러 추적 hook
export function useErrorAnalytics() {
  const trackError = useCallback((params: {
    errorType: string;
    errorMessage: string;
    errorCode?: string | number;
    component?: string;
  }) => {
    errorEvents.occurred({
      error_type: params.errorType,
      error_message: params.errorMessage,
      error_code: params.errorCode,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      component: params.component,
    });
  }, []);

  const trackApiError = useCallback((endpoint: string, statusCode: number, message: string) => {
    errorEvents.apiError(endpoint, statusCode, message);
  }, []);

  return { trackError, trackApiError };
}
