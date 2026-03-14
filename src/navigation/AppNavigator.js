import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
// import TimetableScreen from '../screens/TimetableScreen';
// import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import TimetableScreen from '../screens/main/TimetableScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createStackNavigator();

export const AppNavigator = ({ user }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="Timetable"
            component={TimetableScreen}
            options={{ headerShown: true, title: 'Timetable' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: true, title: 'Profile' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};