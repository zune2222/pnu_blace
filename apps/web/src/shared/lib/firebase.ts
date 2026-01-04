import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported,
  Analytics,
  logEvent as firebaseLogEvent,
  setUserId,
  setUserProperties,
  setAnalyticsCollectionEnabled,
} from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let analyticsInitialized = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;

  if (!app && getApps().length === 0) {
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
    }
  } else if (!app) {
    app = getApps()[0] ?? null;
  }

  return app;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analytics) return analytics;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  const supported = await isSupported();
  if (!supported) return null;

  analytics = getAnalytics(firebaseApp);
  analyticsInitialized = true;

  return analytics;
}

export async function enableAnalytics(enabled: boolean): Promise<void> {
  const analyticsInstance = await getFirebaseAnalytics();
  if (analyticsInstance) {
    setAnalyticsCollectionEnabled(analyticsInstance, enabled);
  }
}

export async function identifyUser(userId: string | null): Promise<void> {
  const analyticsInstance = await getFirebaseAnalytics();
  if (analyticsInstance) {
    setUserId(analyticsInstance, userId);
  }
}

export async function setUserProps(properties: Record<string, string>): Promise<void> {
  const analyticsInstance = await getFirebaseAnalytics();
  if (analyticsInstance) {
    setUserProperties(analyticsInstance, properties);
  }
}

export async function logAnalyticsEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): Promise<void> {
  const analyticsInstance = await getFirebaseAnalytics();
  if (analyticsInstance) {
    firebaseLogEvent(analyticsInstance, eventName, eventParams);
  }
}

export { analyticsInitialized };
