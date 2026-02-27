import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardRouter } from './src/screens/DashboardRouter';
import { COLORS } from './src/constants/theme';

function AppContent() {
  const { isAuthenticated, isLoading, role, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen />
    );
  }

  return (
    <DashboardRouter
      role={role}
      onAction={() => {}}
      onLogout={logout}
      onSelectJob={() => {}}
      onSelectInstallation={() => {}}
      unreadCount={3}
    />
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSerif_400Regular: require('./assets/fonts/NotoSerif/NotoSerif_400Regular.ttf')
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white
  }
});
