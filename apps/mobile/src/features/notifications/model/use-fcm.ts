import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../shared';

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
          
          if (onTokenRefresh) {
            onTokenRefresh(token);
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
      
      if (onTokenRefresh) {
        onTokenRefresh(token);
      }
    });

    return () => unsubscribeTokenRefresh();
  }, [onTokenRefresh]);

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
