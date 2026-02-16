import { useEffect, useState } from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { STORAGE_KEYS, SecureStorage } from '../../../shared';

interface UseFCMProps {
  onNavigate: (route: string) => void;
  onTokenRefresh?: (token: string) => void;
}

export const useFCM = ({ onNavigate, onTokenRefresh }: UseFCMProps) => {
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Request notification permission and get FCM token
  useEffect(() => {
    const setupFCM = async () => {
      try {
        // Request permission (Android 13+ runtime permission)
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return;
          }
        }

        // Request permission (iOS)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
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
            return;
          }
        }

        // Get FCM token
        const token = await messaging().getToken();
        
        if (token) {
          setPushToken(token);
          await SecureStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

          if (onTokenRefresh) {
            onTokenRefresh(token);
          }
        }
      } catch {
        // FCM setup failed silently
      }
    };

    setupFCM();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      setPushToken(token);
      await SecureStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

      if (onTokenRefresh) {
        onTokenRefresh(token);
      }
    });

    return () => unsubscribeTokenRefresh();
  }, [onTokenRefresh]);

  // Handle foreground notifications
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
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
                onNavigate(remoteMessage.data.route as string);
              }
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [onNavigate]);

  // Handle notification opened app (background -> foreground)
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.route) {
          // Navigate when app opened from notification
          onNavigate(remoteMessage.data.route as string);
        }
      });

    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data?.route) {
        onNavigate(remoteMessage.data.route as string);
      }
    });

    return unsubscribe;
  }, [onNavigate]);

  return { pushToken };
};
