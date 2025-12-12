/**
 * API 에러 처리 유틸리티
 * 비즈니스 로직 에러 메시지를 사용자 친화적으로 변환
 */

interface ApiErrorLike {
  status?: number;
  message?: string;
}

/**
 * API 에러에서 사용자 친화적인 메시지 추출
 * @param error - 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 * @param statusMessages - 상태 코드별 커스텀 메시지
 */
export const getApiErrorMessage = (
  error: unknown,
  defaultMessage: string,
  statusMessages?: Record<number, string>
): string => {
  // 에러 객체가 없는 경우
  if (!error) {
    return defaultMessage;
  }

  // ApiError 형태의 객체인 경우
  const apiError = error as ApiErrorLike;
  
  // 상태 코드별 메시지가 정의된 경우
  if (apiError.status && statusMessages?.[apiError.status]) {
    // 상태 코드별 커스텀 메시지가 있거나, API 에러 메시지가 있으면 반환
    const customMessage = statusMessages[apiError.status];
    return apiError.message || customMessage || defaultMessage;
  }

  // 일반 에러 메시지 처리
  if (apiError.message) {
    return apiError.message;
  }

  // Error 인스턴스인 경우
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * 예상된 비즈니스 로직 에러인지 확인
 * (예: 409 Conflict, 400 Bad Request)
 */
export const isExpectedApiError = (error: unknown): boolean => {
  const apiError = error as ApiErrorLike;
  const expectedCodes = [400, 401, 403, 404, 409, 422];
  return !!apiError.status && expectedCodes.includes(apiError.status);
};

/**
 * 좌석 예약 관련 에러 메시지 추출
 */
export const getSeatReservationErrorMessage = (error: unknown): string => {
  return getApiErrorMessage(error, '좌석 발권에 실패했습니다.', {
    400: '발권 정보가 올바르지 않습니다.',
    409: '이미 발권된 좌석이 있습니다.',
  });
};

/**
 * 빈자리 예약 관련 에러 메시지 추출
 */
export const getEmptySeatReservationErrorMessage = (error: unknown): string => {
  return getApiErrorMessage(error, '빈자리 발권 예약에 실패했습니다.', {
    400: '발권 정보가 올바르지 않습니다.',
    409: '이미 발권된 좌석이 있습니다.',
  });
};

export default {
  getApiErrorMessage,
  isExpectedApiError,
  getSeatReservationErrorMessage,
  getEmptySeatReservationErrorMessage,
};
