import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { ActivityIndicator, View } from 'react-native';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { theme } from './src/theme';
import { notificationService } from './src/services/notificationService';
import { scheduleService } from './src/services/scheduleService';

const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary.blue} />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    // Initialize services when app starts
    const initializeServices = async () => {
      try {
        await notificationService.initialize();
        await scheduleService.syncRemindersToSchedule();
        console.log('✅ All services initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing services:', error);
      }
    };
    
    initializeServices();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
