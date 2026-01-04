import { useRef, useCallback, useState } from 'react';
import { Platform, Linking } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BridgeMessage, STORAGE_KEYS } from '../../../shared';

interface UseWebViewBridgeProps {
  pushToken: string | null;
  setPushToken: (token: string) => void;
  setIsDarkMode: (isDark: boolean) => void;
}

export const useWebViewBridge = ({
  pushToken,
  setPushToken,
  setIsDarkMode,
}: UseWebViewBridgeProps) => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Inject push token into webview
  const injectPushToken = useCallback((token: string) => {
    const script = `
      window.nativePushToken = '${token}';
      window.nativePlatform = '${Platform.OS}';
      window.isNativeApp = true;
      window.dispatchEvent(new CustomEvent('nativeReady', { 
        detail: { pushToken: '${token}', platform: '${Platform.OS}' }
      }));
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  // Navigate webview to a specific route
  const navigateWebView = useCallback((route: string) => {
    const script = `
      if (window.location.pathname !== '${route}') {
        window.location.href = '${route}';
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  // Handle messages from webview
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const message: BridgeMessage = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'REQUEST_PUSH_TOKEN':
          if (pushToken) {
            injectPushToken(pushToken);
          }
          break;

        case 'LOGIN_SUCCESS':
          if (pushToken) {
            injectPushToken(pushToken);
          }
          break;

        case 'SET_USER_TOKEN':
          if (message.payload?.token) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, message.payload.token);
          }
          break;

        case 'LOGOUT':
          await AsyncStorage.multiRemove([STORAGE_KEYS.USER_TOKEN]);
          break;

        case 'OPEN_EXTERNAL_URL':
          if (message.payload?.url) {
            Linking.openURL(message.payload.url);
          }
          break;

        case 'THEME_CHANGE':
          if (typeof message.payload?.isDarkMode === 'boolean') {
            setIsDarkMode(message.payload.isDarkMode);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to parse webview message:', error);
    }
  }, [pushToken, injectPushToken, setIsDarkMode]);

  const goBack = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  return {
    webViewRef,
    canGoBack,
    setCanGoBack,
    injectPushToken,
    navigateWebView,
    handleMessage,
    goBack,
  };
};
