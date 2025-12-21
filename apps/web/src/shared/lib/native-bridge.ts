/**
 * Native Bridge Utility
 * 앱과 웹 간의 통신을 위한 유틸리티
 */

// Window에 네이티브 앱 관련 속성 추가
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    isNativeApp?: boolean;
    nativePlatform?: 'ios' | 'android';
    nativePushToken?: string;
    sendToNative?: (type: string, payload?: unknown) => void;
  }
}

/**
 * 앱에서 실행 중인지 확인
 */
export const isRunningInApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.ReactNativeWebView || window.isNativeApp === true;
};

/**
 * 현재 플랫폼 (ios/android/web)
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  if (typeof window === 'undefined') return 'web';
  if (window.nativePlatform) return window.nativePlatform;
  return 'web';
};

/**
 * 네이티브 앱으로 메시지 전송
 */
export const sendToNative = (type: string, payload?: unknown): void => {
  if (!isRunningInApp()) return;
  
  const message = JSON.stringify({ type, payload });
  
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(message);
  }
};

/**
 * 푸시 토큰을 서버에 등록
 * 앱에서 전달받은 FCM 토큰을 백엔드에 등록합니다.
 */
export const registerPushTokenWithServer = async (
  token: string,
  platform: 'ios' | 'android',
  apiClient: { post: (url: string, data: unknown) => Promise<unknown> }
): Promise<boolean> => {
  try {
    await apiClient.post('/api/v1/push/token', { token, platform });
    console.log('[NativeBridge] Push token registered with server');
    return true;
  } catch (error) {
    console.error('[NativeBridge] Failed to register push token:', error);
    return false;
  }
};

/**
 * 푸시 토큰 해제
 * 로그아웃 시 호출하여 푸시 토큰을 서버에서 해제합니다.
 */
export const unregisterPushToken = async (
  token: string,
  apiClient: { delete: (url: string, data?: unknown) => Promise<unknown> }
): Promise<boolean> => {
  try {
    await apiClient.delete('/api/v1/push/token', { token });
    console.log('[NativeBridge] Push token unregistered from server');
    return true;
  } catch (error) {
    console.error('[NativeBridge] Failed to unregister push token:', error);
    return false;
  }
};

/**
 * 네이티브 앱 준비 이벤트 리스너 설정
 * 앱에서 푸시 토큰이 준비되면 서버에 등록합니다.
 */
export const setupNativeBridgeListener = (
  apiClient: { post: (url: string, data: unknown) => Promise<unknown> }
): (() => void) => {
  if (typeof window === 'undefined' || !isRunningInApp()) {
    return () => {};
  }

  const handleNativeReady = async (event: CustomEvent<{ pushToken: string; platform: 'ios' | 'android' }>) => {
    const { pushToken, platform } = event.detail;
    
    if (pushToken) {
      await registerPushTokenWithServer(pushToken, platform, apiClient);
    }
  };

  // 이미 토큰이 있는 경우 바로 등록
  if (window.nativePushToken && window.nativePlatform) {
    registerPushTokenWithServer(
      window.nativePushToken,
      window.nativePlatform,
      apiClient
    );
  }

  // 이벤트 리스너 등록
  window.addEventListener('nativeReady', handleNativeReady as unknown as EventListener);

  // cleanup 함수 반환
  return () => {
    window.removeEventListener('nativeReady', handleNativeReady as unknown as EventListener);
  };
};

/**
 * 외부 URL 열기 (앱에서는 시스템 브라우저로 열림)
 */
export const openExternalUrl = (url: string): void => {
  if (isRunningInApp()) {
    sendToNative('OPEN_EXTERNAL_URL', { url });
  } else {
    window.open(url, '_blank');
  }
};
