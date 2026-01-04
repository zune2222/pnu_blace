/**
 * PNU Blace App - WebView based hybrid app with FCM push notifications
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { MainWebView } from './src/features/webview/ui/main-webview';
import { useWebViewBridge } from './src/features/webview/model/use-webview-bridge';
import { useFCM } from './src/features/notifications/model/use-fcm';
import { useAppLifecycle } from './src/app/model/use-app-lifecycle';

function App() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const {
    pushToken,
  } = useFCM({
    onNavigate: (route) => bridge.navigateWebView(route),
    onTokenRefresh: (token) => bridge.injectPushToken(token),
  });

  const bridge = useWebViewBridge({
    pushToken,
    setPushToken: () => {}, // pushToken is managed by useFCM, so we might not need this callback here if we pass token directly
    setIsDarkMode,
  });

  useAppLifecycle({
    onBackPress: bridge.goBack,
  });

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#0a0a0a' : '#ffffff'}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff' }]} edges={['top']}>
        <MainWebView 
          ref={bridge.webViewRef}
          onMessage={bridge.handleMessage}
          onNavigationStateChange={(navState) => bridge.setCanGoBack(navState.canGoBack)}
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
});

export default App;
