/**
 * 통합 Analytics 로거
 * Firebase Analytics + Vercel Analytics 둘 다 전송
 */
import { logAnalyticsEvent as logFirebaseEvent, identifyUser as identifyFirebaseUser, setUserProps as setFirebaseUserProps } from '../firebase';
import { track } from '@vercel/analytics';

/**
 * 이벤트 로깅 - Firebase + Vercel 동시 전송
 */
export function logAnalyticsEvent(eventName: string, params?: Record<string, unknown>) {
  // 1. Firebase Analytics
  logFirebaseEvent(eventName, params);

  // 2. Vercel Analytics (flat object만 지원)
  if (params) {
    const vercelParams: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        vercelParams[key] = value;
      } else if (value !== undefined) {
        vercelParams[key] = String(value);
      }
    }
    track(eventName, vercelParams);
  } else {
    track(eventName);
  }
}

/**
 * 유저 식별 - Firebase만 (Vercel은 자동 세션 관리)
 */
export async function identifyUser(userId: string | null) {
  await identifyFirebaseUser(userId);
}

/**
 * 유저 속성 설정 - Firebase만 (Vercel은 미지원)
 */
export async function setUserProps(props: Record<string, string>) {
  await setFirebaseUserProps(props);
}
