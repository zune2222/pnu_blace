"use client";

import { useEffect, useRef } from "react";
import { setupNativeBridgeListener, isRunningInApp } from "@/shared/lib/native-bridge";
import { apiClient } from "@/shared/lib/api";

/**
 * 네이티브 앱 브릿지 초기화 컴포넌트
 * 앱에서 실행 중일 때 푸시 토큰을 서버에 등록합니다.
 */
export function NativeBridgeInitializer() {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isRunningInApp()) {
      return;
    }

    console.log("[NativeBridgeInitializer] Setting up native bridge listener");

    // API client wrapper for the bridge
    const apiWrapper = {
      post: async (url: string, data: unknown) => {
        return apiClient.post(url, data);
      },
    };

    cleanupRef.current = setupNativeBridgeListener(apiWrapper);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return null;
}
