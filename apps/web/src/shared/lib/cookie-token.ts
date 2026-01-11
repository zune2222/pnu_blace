/**
 * 쿠키 기반 토큰 관리 유틸리티
 * Server Component에서 인증 토큰에 접근하기 위해 사용
 */

const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7일

/**
 * 클라이언트에서 인증 토큰을 쿠키에 설정
 */
export function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return;

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

/**
 * 클라이언트에서 인증 쿠키 삭제
 */
export function removeAuthCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

/**
 * 클라이언트에서 인증 쿠키 읽기
 */
export function getAuthCookieClient(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(^| )${AUTH_COOKIE_NAME}=([^;]+)`));
  return match?.[2] ?? null;
}

/**
 * 쿠키 이름 상수 (서버에서 사용)
 */
export const AUTH_COOKIE_KEY = AUTH_COOKIE_NAME;
