import { cookies } from 'next/headers';
import { AUTH_COOKIE_KEY } from '@/shared/lib/cookie-token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ServerFetchOptions {
  /** Next.js Data Cache revalidate 시간 (초). false면 캐시 비활성화 */
  revalidate?: number | false;
  /** Cache tags for on-demand revalidation */
  tags?: string[];
}

/**
 * Server Component용 인증 API fetch
 * - cookies()로 토큰 접근
 * - Next.js Data Cache 활용
 */
export async function serverFetch<T>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<T | null> {
  const { revalidate = 60, tags } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // 쿠키에서 토큰 가져오기
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;

  // 토큰이 없으면 null 반환 (비로그인 상태)
  if (!token) {
    return null;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      headers,
      next: {
        revalidate,
        tags,
      },
    });

    if (!response.ok) {
      // 401 등의 에러는 null 반환 (클라이언트에서 재시도)
      console.warn(`[serverFetch] ${endpoint} failed: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.warn(`[serverFetch] ${endpoint} error:`, error);
    return null;
  }
}

/**
 * Server Component용 공개 API fetch (토큰 불필요)
 * - 더 긴 캐시 시간 기본값
 */
export async function serverPublicFetch<T>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<T | null> {
  const { revalidate = 300, tags } = options; // 공개 API는 5분 캐시 기본

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: {
        revalidate,
        tags,
      },
    });

    if (!response.ok) {
      console.warn(`[serverPublicFetch] ${endpoint} failed: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.warn(`[serverPublicFetch] ${endpoint} error:`, error);
    return null;
  }
}
