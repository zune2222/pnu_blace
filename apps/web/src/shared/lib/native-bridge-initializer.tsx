"use client";

import { useEffect, useRef } from "react";
import { setupNativeBridgeListener, isRunningInApp, registerPushTokenWithServer } from "@/shared/lib/native-bridge";
import { apiClient } from "@/shared/lib/api";

/**
 * 네이티브 앱 브릿지 초기화 컴포넌트
 * 앱에서 실행 중일 때 푸시 토큰을 서버에 등록합니다.
 * 단, 사용자가 로그인한 상태에서만 등록합니다.
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
        // 로그인 상태 확인 (토큰 있는지 체크)
        const authToken = apiClient.getAuthToken();
        if (!authToken) {
          console.log("[NativeBridgeInitializer] User not logged in, skipping push token registration");
          return;
        }
        return apiClient.post(url, data);
      },
    };

    cleanupRef.current = setupNativeBridgeListener(apiWrapper);

    // 이미 토큰이 있고 로그인된 상태라면 바로 등록
    const authToken = apiClient.getAuthToken();
    if (authToken && window.nativePushToken && window.nativePlatform) {
      console.log("[NativeBridgeInitializer] User already logged in, registering existing token");
      registerPushTokenWithServer(window.nativePushToken, window.nativePlatform, apiWrapper);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return null;
}
