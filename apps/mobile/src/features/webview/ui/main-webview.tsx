import React, { forwardRef } from 'react';
import { StyleSheet, Platform, Linking } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { WEB_URL, BRIDGE_INIT_SCRIPT } from '../../../shared';

interface MainWebViewProps {
  onMessage: (event: WebViewMessageEvent) => void;
  onNavigationStateChange: (navState: WebViewNavigation) => void;
}

export const MainWebView = forwardRef<WebView, MainWebViewProps>(({
  onMessage,
  onNavigationStateChange,
}, ref) => {
  return (
    <WebView
      ref={ref}
      source={{ uri: WEB_URL }}
      style={styles.webview}
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={BRIDGE_INIT_SCRIPT(Platform.OS)}
      onNavigationStateChange={onNavigationStateChange}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      allowsBackForwardNavigationGestures={true}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      scalesPageToFit={false}
      bounces={false}
      onShouldStartLoadWithRequest={(request) => {
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

        if (!isAllowed) {
          Linking.openURL(request.url);
          return false;
        }
        return true;
      }}
    />
  );
});

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
