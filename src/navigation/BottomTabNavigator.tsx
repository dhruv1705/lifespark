import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import InterestsScreen from '../screens/InterestsScreen';
import { BottomTabParamList, RootStackParamList, ProfileStackParamList } from '../types';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const HomeStack = createStackNavigator<RootStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: theme.typography.weights.bold,
          fontSize: theme.typography.sizes.xl,
        },
        headerTintColor: theme.colors.text.primary,
      }}
    >
      <HomeStack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{ title: 'Lifespark' }}
      />
      <HomeStack.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{ title: 'Goals' }}
      />
      <HomeStack.Screen 
        name="Habits" 
        component={HabitsScreen}
        options={{ title: 'Habits' }}
      />
      <HomeStack.Screen 
        name="VideoPlayer" 
        component={VideoPlayerScreen}
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
    </HomeStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: theme.typography.weights.bold,
          fontSize: theme.typography.sizes.xl,
        },
        headerTintColor: theme.colors.text.primary,
      }}
    >
      <ProfileStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen 
        name="Interests" 
        component={InterestsScreen}
        options={{ 
          headerShown: false,
        }}
      />
    </ProfileStack.Navigator>
  );
};

export const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ProgressTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'ScheduleTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.secondary.orange,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: insets.bottom,
          paddingTop: theme.spacing.sm,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="ProgressTab" 
        component={ProgressScreen}
        options={{
          title: 'Progress',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: theme.typography.weights.bold,
            fontSize: theme.typography.sizes.xl,
          },
          headerTintColor: theme.colors.text.primary,
          headerTitle: 'Progress',
        }}
      />
      <Tab.Screen 
        name="ScheduleTab" 
        component={ScheduleScreen}
        options={{
          title: 'Schedule',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};