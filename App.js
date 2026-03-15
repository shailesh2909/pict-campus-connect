import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './src/api/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupNotificationListeners } from './src/services/notificationService';
import { subscribeToTopics } from './src/services/subscriptionService';
//import { seedEvents } from './src/api/seedEvents';

export default function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const notificationListeners = useRef(null);

  // ── Auth state listener ────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Notification setup (runs when user logs in) ────
  useEffect(() => {
    if (!user) return;

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

        // 2. Fetch user profile and register push token
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && isMounted) {
          const userData = userDoc.data();
          await subscribeToTopics(userData);
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
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator user={user} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

