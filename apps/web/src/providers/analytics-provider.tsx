'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getFirebaseAnalytics } from '@/shared/lib/firebase';
import {
  pageEvents,
  authEvents,
  engagementEvents,
  performanceEvents,
} from '@/shared/lib/analytics';

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathRef = useRef<string>('');
  const pageStartTimeRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<Set<number>>(new Set());
  const isInitializedRef = useRef(false);

  // Firebase Analytics 초기화
  useEffect(() => {
    const initAnalytics = async () => {
      if (isInitializedRef.current) return;

      const analytics = await getFirebaseAnalytics();
      if (analytics) {
        isInitializedRef.current = true;
        authEvents.sessionStart();
      }
    };

    initAnalytics();
  }, []);

  // 페이지 뷰 추적
  useEffect(() => {
    if (!pathname) return;

    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // 페이지 이동 시 이전 페이지 체류 시간 기록
    if (previousPathRef.current && previousPathRef.current !== pathname) {
      const timeOnPage = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      engagementEvents.timeOnPage(previousPathRef.current, timeOnPage);
    }

    // 새 페이지 뷰 기록
    pageEvents.view({
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
      referrer: document.referrer || undefined,
      is_first_visit: !previousPathRef.current,
    });

    // 네비게이션 이벤트
    if (previousPathRef.current) {
      pageEvents.navigation({
        from_path: previousPathRef.current,
        to_path: pathname,
        navigation_type: 'programmatic',
      });
    }

    // 상태 업데이트
    previousPathRef.current = pathname;
    pageStartTimeRef.current = Date.now();
    scrollDepthRef.current.clear();

    // 페이지 로드 성능 측정
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.startTime;
        if (loadTime > 0) {
          performanceEvents.pageLoad(pathname, Math.round(loadTime));
        }
      }
    }
  }, [pathname, searchParams]);

  // 스크롤 깊이 추적
  useEffect(() => {
    if (!pathname) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      const thresholds = [25, 50, 75, 100];

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !scrollDepthRef.current.has(threshold)) {
          scrollDepthRef.current.add(threshold);
          engagementEvents.scroll(pathname, threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // 페이지 이탈 시 체류 시간 기록
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (previousPathRef.current) {
        const timeOnPage = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
        engagementEvents.timeOnPage(previousPathRef.current, timeOnPage);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Web Vitals 추적
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportWebVital = (metric: { name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor' }) => {
      performanceEvents.webVitals(metric.name, metric.value, metric.rating);
    };

    // @ts-expect-error - web-vitals 타입
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      const handleMetric = (metric: { name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor' }) => {
        reportWebVital(metric);
      };

      onCLS?.(handleMetric);
      onFID?.(handleMetric);
      onFCP?.(handleMetric);
      onLCP?.(handleMetric);
      onTTFB?.(handleMetric);
      onINP?.(handleMetric);
    }).catch(() => {
      // web-vitals가 없으면 무시
    });
  }, []);

  return null;
}

// 클릭 이벤트 추적을 위한 hook
export function useTrackClick() {
  return useCallback((eventName: string, params?: Record<string, unknown>) => {
    engagementEvents.featureUsed(eventName, params);
  }, []);
}

// CTA 클릭 추적을 위한 hook
export function useTrackCTA() {
  return useCallback((ctaName: string, location: string) => {
    engagementEvents.ctaClicked(ctaName, location);
  }, []);
}
