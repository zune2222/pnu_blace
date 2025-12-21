/**
 * PNU Blace App - WebView based hybrid app with FCM push notifications
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  Platform,
  Alert,
  Linking,
  BackHandler,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production URL - 배포된 웹 주소
const WEB_URL = 'https://pnu-blace.vercel.app';

// const WEB_URL = 'http://localhost:3000';
// AsyncStorage keys
const STORAGE_KEYS = {
  PUSH_TOKEN: '@pnublace/pushToken',
  USER_TOKEN: '@pnublace/userToken',
};

// Message types for JS Bridge communication
type BridgeMessageType = 
  | 'REQUEST_PUSH_TOKEN'
  | 'REGISTER_PUSH_TOKEN'
  | 'LOGIN_SUCCESS'
  | 'SET_USER_TOKEN'
  | 'LOGOUT'
  | 'OPEN_EXTERNAL_URL'
  | 'THEME_CHANGE';

interface BridgeMessage {
  type: BridgeMessageType;
  payload?: any;
}

function App() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Sync with system theme initially or when it changes, 
  // but we mostly rely on web to tell us the active theme if it differs.
  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const webViewRef = useRef<WebView>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Request notification permission and get FCM token
  useEffect(() => {
    const setupFCM = async () => {
      try {
        // Request permission (iOS)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('FCM permission denied');
          return;
        }

        // Register for remote messages (Required for iOS)
        if (Platform.OS === 'ios') {
          await messaging().registerDeviceForRemoteMessages();
        }

        // Wait for APNS token to be ready (iOS only)
        if (Platform.OS === 'ios') {
          let apnsToken = await messaging().getAPNSToken();
          let retry = 0;
          while (!apnsToken && retry < 10) {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
            apnsToken = await messaging().getAPNSToken();
            retry++;
          }
          
          if (!apnsToken) {
            console.warn('APNS token not available after waiting. FCM token fetch might fail.');
          }
        }

        // Get FCM token
        const token = await messaging().getToken();
        
        if (token) {
          console.log('FCM Token:', token);
          setPushToken(token);
          await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

          // Send token to webview when ready
          if (webViewRef.current) {
            injectPushToken(token);
          }
        }
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    };

    setupFCM();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      setPushToken(token);
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      injectPushToken(token);
    });

    return () => unsubscribeTokenRefresh();
  }, []);

  // Handle foreground notifications
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);
      
      // Show alert for foreground notifications
      Alert.alert(
        remoteMessage.notification?.title ?? '알림',
        remoteMessage.notification?.body ?? '',
        [
          {
            text: '확인',
            onPress: () => {
              // Navigate to specific screen if data contains navigation info
              if (remoteMessage.data?.route) {
                navigateWebView(remoteMessage.data.route as string);
              }
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, []);

  // Handle notification opened app (background -> foreground)
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.route) {
          // Navigate when app opened from notification
          navigateWebView(remoteMessage.data.route as string);
        }
      });

    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data?.route) {
        navigateWebView(remoteMessage.data.route as string);
      }
    });

    return unsubscribe;
  }, []);

  // Handle Android back button
  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [canGoBack]);

  // Inject push token into webview
  const injectPushToken = (token: string) => {
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
  };

  // Navigate webview to a specific route
  const navigateWebView = (route: string) => {
    const script = `
      if (window.location.pathname !== '${route}') {
        window.location.href = '${route}';
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  // Handle messages from webview
  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const message: BridgeMessage = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'REQUEST_PUSH_TOKEN':
          if (pushToken) {
            injectPushToken(pushToken);
          }
          break;

        case 'LOGIN_SUCCESS':
          // Web app notifies that login is successful, trigger token sync
          if (pushToken) {
            injectPushToken(pushToken);
          }
          break;

        case 'SET_USER_TOKEN':
          // Store user auth token from web
          if (message.payload?.token) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, message.payload.token);
          }
          break;

        case 'LOGOUT':
          // Clear stored tokens on logout
          await AsyncStorage.multiRemove([STORAGE_KEYS.USER_TOKEN]);
          break;

        case 'OPEN_EXTERNAL_URL':
          // Open URL in external browser
          if (message.payload?.url) {
            Linking.openURL(message.payload.url);
          }
          break;

        case 'THEME_CHANGE':
          if (typeof message.payload?.isDarkMode === 'boolean') {
            setIsDarkMode(message.payload.isDarkMode);
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse webview message:', error);
    }
  };

  // JavaScript to inject when webview loads
  const injectedJavaScript = `
    (function() {
      // Flag to indicate we're in native app
      window.isNativeApp = true;
      window.nativePlatform = '${Platform.OS}';
      
      // Function to send message to native app
      window.sendToNative = function(type, payload) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
      };
      
      // Request push token on load
      window.sendToNative('REQUEST_PUSH_TOKEN');

      // Disable pinch zoom
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.head.appendChild(meta);
      }
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      
      // Override console.log for debugging
      const originalLog = console.log;
      console.log = function(...args) {
        originalLog.apply(console, args);
      };
      
      true;
    })();
  `;

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#0a0a0a' : '#ffffff'}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff' }]} edges={['top']}>
        <WebView
          ref={webViewRef}
          source={{ uri: WEB_URL }}
          style={styles.webview}
          onMessage={handleMessage}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
          // WebView configuration
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={false} // Disable zooming on iOS
          bounces={false} // Disable bouncing
          // Handle external links
          onShouldStartLoadWithRequest={(request) => {
            // Check for allowed domains/patterns
            const allowedPatterns = [
              WEB_URL,
              'about:',
              'http://localhost',
              'http://10.0.2.2',
              'http://192.168.',
              'https://place.pusan.ac.kr',
            ];

            const isAllowed = allowedPatterns.some(pattern => 
              request.url.startsWith(pattern)
            );

            // Open external links in default browser
            if (!isAllowed) {
              Linking.openURL(request.url);
              return false;
            }
            return true;
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webview: {
    flex: 1,
  },
});

export default App;
