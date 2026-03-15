import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase/firebaseConfig';

import LoginScreen from '../screens/auth/LoginScreen';
import TabNavigator from './TabNavigator';
import TimetableScreen from '../screens/main/TimetableScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import TodayCompanyScreen from '../screens/main/TodayCompanyScreen';
import UpcomingCompanyScreen from '../screens/main/UpcomingCompanyScreen';
import VisitedCompanyScreen from '../screens/main/VisitedCompanyScreen';
import OngoingEventScreen from '../screens/main/OngoingEventScreen';
import UpcomingEventScreen from '../screens/main/UpcomingEventScreen';
import NotesScreen from '../screens/main/NotesScreen';
import StudentProfileScreen from '../screens/main/StudentProfileScreen';
import FacultyProfileScreen from '../screens/main/FacultyProfileScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="TimetableScreen" component={TimetableScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="TodayCompanyScreen" component={TodayCompanyScreen} />
          <Stack.Screen name="UpcomingCompanyScreen" component={UpcomingCompanyScreen} />
          <Stack.Screen name="VisitedCompanyScreen" component={VisitedCompanyScreen} />
          <Stack.Screen name="OngoingEventScreen" component={OngoingEventScreen} />
          <Stack.Screen name="UpcomingEventScreen" component={UpcomingEventScreen} />
          <Stack.Screen name="NotesScreen" component={NotesScreen} />
          <Stack.Screen name="StudentProfileScreen" component={StudentProfileScreen} />
          <Stack.Screen name="FacultyProfileScreen" component={FacultyProfileScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}