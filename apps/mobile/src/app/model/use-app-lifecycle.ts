import { useEffect } from 'react';
import { AppState, AppStateStatus, BackHandler, Platform } from 'react-native';
import notifee from '@notifee/react-native';

interface UseAppLifecycleProps {
  onBackPress?: () => boolean;
}

export const useAppLifecycle = ({ onBackPress }: UseAppLifecycleProps) => {
  // Clear badge when app becomes active
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Clear badge count when app comes to foreground
        await notifee.setBadgeCount(0);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Also clear on initial load
    notifee.setBadgeCount(0);

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle Android back button
  useEffect(() => {
    const handleBackPress = () => {
      if (onBackPress) {
        return onBackPress();
      }
      return false;
    };

    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }
  }, [onBackPress]);
};
