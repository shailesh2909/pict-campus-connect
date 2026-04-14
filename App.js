import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { setupNotificationListeners } from './src/services/notificationService';
import { subscribeToTopics } from './src/services/subscriptionService';
import {
  dismissExpiredNotifications,
  startNotificationGuardian,
  stopNotificationGuardian,
} from './src/services/NotificationManager';

// ── Inner component that consumes AuthContext ──────────
function AppInner() {
  const { user, profile, loading } = useAuth();
  const notificationListeners = useRef(null);

  // ── Notification setup (runs when user logs in) ──────
  useEffect(() => {
    if (!user || !profile) return;

    let isMounted = true;

    const initNotifications = async () => {
      try {
        // 1. Set up notification listeners
        notificationListeners.current = setupNotificationListeners(
          (notification) => {
            console.log('[App] Notification received:', notification.request.content.title);
          },
          (response) => {
            console.log('[App] Notification tapped:', response.notification.request.content.data);
          },
        );

        // 2. Register push token and subscribe to topics
        if (isMounted) {
          await subscribeToTopics(profile);
        }
      } catch (error) {
        console.error('[App] Notification init failed:', error);
      }
    };

    initNotifications();

    return () => {
      isMounted = false;
      if (notificationListeners.current) {
        notificationListeners.current.remove();
      }
    };
  }, [user, profile]);

  // ── Notification Guardian ──────────────────────────────
  // Polls every 10s to show an ongoing (non-swipable) notification
  // with live countdown, a 5-min popup, and auto-dismiss at lecture start.
  useEffect(() => {
    dismissExpiredNotifications();
    startNotificationGuardian();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        dismissExpiredNotifications();
        startNotificationGuardian();
      } else {
        stopNotificationGuardian();
      }
    });

    return () => {
      subscription.remove();
      stopNotificationGuardian();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3D6EE8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

// ── Root App ───────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
