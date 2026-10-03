import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { colors } from './src/theme';
import type { RootStackParamList } from './src/navigation';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import TopicsScreen from './src/screens/TopicsScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import ResultScreen from './src/screens/ResultScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Aligns React Navigation's own chrome with the Google palette. */
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.onSurface,
    border: colors.surfaceContainerHigh,
  },
};

function Splash() {
  return (
    <View style={s.splash}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

/**
 * Routes by session state:
 *   loading                 -> splash (restoring a stored token)
 *   signedOut               -> auth
 *   signedIn, profile incomplete -> blocking profile setup
 *   otherwise               -> the main stack
 */
function Root() {
  const { status, profile } = useAuth();
  const navRef = useNavigationContainerRef();

  if (status === 'loading') return <Splash />;

  if (status === 'signedOut') {
    return (
      <NavigationContainer theme={navTheme}>
        <AuthScreen />
      </NavigationContainer>
    );
  }

  const needsSetup = !profile?.complete;

  return (
    <NavigationContainer ref={navRef} theme={navTheme}>
      <Stack.Navigator
        initialRouteName={needsSetup ? 'Profile' : 'Home'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          initialParams={{ blocking: needsSetup }}
        />
        <Stack.Screen name="Topics" component={TopicsScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Root />
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});