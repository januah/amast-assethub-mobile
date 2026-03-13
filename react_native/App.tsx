import './src/patchStyleSheet';
import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet, Text, TextInput } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { EnvironmentProvider } from './src/context/EnvironmentContext';
import { RequestLogProvider, useRequestLog } from './src/context/RequestLogContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { EnvironmentScreen } from './src/screens/EnvironmentScreen';
import { DashboardRouter } from './src/screens/DashboardRouter';
import { RequestLogScreen } from './src/screens/RequestLogScreen';
import { COLORS } from './src/constants/theme';
import Toast, { BaseToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: { text1?: string }) => (
    <BaseToast
      {...props}
      style={{ backgroundColor: COLORS.primary, borderLeftColor: COLORS.primary }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}
    />
  ),
  error: (props: { text1?: string }) => (
    <BaseToast
      {...props}
      style={{ backgroundColor: COLORS.danger, borderLeftColor: COLORS.danger }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}
    />
  ),
};

function AppContent() {
  const { isAuthenticated, isLoading, role, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'environment'>('login');

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'environment') {
      return <EnvironmentScreen onBack={() => setAuthView('login')} />;
    }
    return <LoginScreen onOpenSettings={() => setAuthView('environment')} />;
  }

  return (
    <DashboardRouter
      role={role}
      onAction={() => {}}
      onLogout={logout}
      onSelectJob={() => {}}
      unreadCount={3}
    />
  );
}

function AppWithGesture() {
  const { setShowScreen, showScreen } = useRequestLog();
  const gesture = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .minPointers(2)
        .runOnJS(true)
        .onEnd(() => setShowScreen(true)),
    [setShowScreen]
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.gestureWrap}>
        <AppContent />
        {showScreen && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <RequestLogScreen />
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const defaultFontStyle = { fontFamily: 'PlusJakartaSans_400Regular' };

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      Text.defaultProps = { ...Text.defaultProps, style: defaultFontStyle };
      TextInput.defaultProps = { ...TextInput.defaultProps, style: defaultFontStyle };
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <EnvironmentProvider>
          <AuthProvider>
            <RequestLogProvider>
              <AppWithGesture />
              <StatusBar style="dark" />
              <Toast config={toastConfig} />
            </RequestLogProvider>
          </AuthProvider>
        </EnvironmentProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gestureWrap: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white
  }
});
