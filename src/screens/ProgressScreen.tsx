import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { LevelProgressCard } from '../components/LevelProgressCard';
import { DailyXPGoal } from '../components/DailyXPGoal';
import { calculateUserLevel, UserLevel } from '../utils/levelSystem';
import { theme } from '../theme';
import { dataSync, DATA_SYNC_EVENTS } from '../utils/dataSync';

interface UserStats {
  totalXP: number;
  todayXP: number;
  weeklyXP: number;
  monthlyXP: number;
  completedHabitsToday: number;
  currentStreak: number;
  completedGoals: number;
  activeGoals: number;
}

export const ProgressScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  // Listen for data sync events from other screens
  useEffect(() => {
    const handleHabitToggled = (data: any) => {
      console.log('🔄 Progress screen received habit toggle event:', data);
      // Refresh stats when a habit is toggled
      if (user) {
        loadUserStats(true); // Refresh mode
      }
    };

    const handleXPUpdated = (data: any) => {
      console.log('🔄 Progress screen received XP update event:', data);
      // Refresh stats when XP is updated
      if (user) {
        loadUserStats(true); // Refresh mode
      }
    };

    const handleGoalProgressUpdated = (data: any) => {
      console.log('🔄 Progress screen received goal progress update event:', data);
      // Refresh stats when goal progress is updated
      if (user) {
        loadUserStats(true); // Refresh mode
      }
    };

    // Add event listeners
    dataSync.on(DATA_SYNC_EVENTS.HABIT_TOGGLED, handleHabitToggled);
    dataSync.on(DATA_SYNC_EVENTS.XP_UPDATED, handleXPUpdated);
    dataSync.on(DATA_SYNC_EVENTS.GOAL_PROGRESS_UPDATED, handleGoalProgressUpdated);

    // Cleanup on unmount
    return () => {
      dataSync.off(DATA_SYNC_EVENTS.HABIT_TOGGLED, handleHabitToggled);
      dataSync.off(DATA_SYNC_EVENTS.XP_UPDATED, handleXPUpdated);
      dataSync.off(DATA_SYNC_EVENTS.GOAL_PROGRESS_UPDATED, handleGoalProgressUpdated);
    };
  }, [user]);

  // Refresh data whenever the screen comes into focus (when switching tabs)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('🔄 Progress screen focused - refreshing data');
        // Always refresh when focusing, but use smart loading state
        const shouldShowLoading = !stats; // Only show loading if no data yet
        loadUserStats(!shouldShowLoading); // Pass true for refresh mode if data exists
      }
    }, [user])
  );

  const loadUserStats = async (isRefresh = false) => {
    if (!user) return;
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get user's active goals
      const userGoals = await DataService.getUserGoals(user.id);
      
      // Get today's completions
      const todayCompletions = await DataService.getTodayCompletions(user.id);
      
      // Debug XP data first
      await DataService.debugXPData(user.id);
      
      // Recalculate and fix today's XP first
      const todayXP = await DataService.recalculateTodayXP(user.id);
      
      // Get other XP data
      const totalXP = await DataService.getUserTotalXP(user.id);
      const weeklyXP = await DataService.getUserWeeklyXP(user.id);
      const monthlyXP = await DataService.getUserMonthlyXP(user.id);
      
      // Calculate user level
      const level = calculateUserLevel(totalXP);
      setUserLevel(level);
      
      const statsData: UserStats = {
        totalXP,
        todayXP,
        weeklyXP,
        monthlyXP,
        completedHabitsToday: todayCompletions.length,
        currentStreak: 1, // TODO: Calculate actual streak
        completedGoals: userGoals.filter(g => g.progress >= 100).length,
        activeGoals: userGoals.filter(g => g.progress < 100).length,
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary.orange} />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load progress data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>
            {isRefreshing ? 'Updating...' : 'Keep up the great work!'}
          </Text>
        </View>

        {/* User Level Progress */}
        {userLevel && <LevelProgressCard userLevel={userLevel} />}

        {/* Daily XP Goal */}
        {stats && <DailyXPGoal currentXP={stats.todayXP} goalXP={50} />}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.weeklyXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.monthlyXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedHabitsToday}</Text>
            <Text style={styles.statLabel}>Today's Habits</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeGoals}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </View>
        </View>

        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          
          {/* Level-based achievements */}
          {userLevel && userLevel.level >= 2 && (
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>🌱</Text>
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Level {userLevel.level} {userLevel.title}</Text>
                <Text style={styles.achievementDescription}>Unlocked with {userLevel.currentXP.toLocaleString()} XP</Text>
              </View>
            </View>
          )}
          
          {stats.totalXP >= 100 && (
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>💯</Text>
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Century Club</Text>
                <Text style={styles.achievementDescription}>Earned 100+ total XP</Text>
              </View>
            </View>
          )}
          
          {stats.weeklyXP >= 50 && (
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>📅</Text>
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Weekly Warrior</Text>
                <Text style={styles.achievementDescription}>Earned {stats.weeklyXP} XP this week</Text>
              </View>
            </View>
          )}
          
          {stats.completedHabitsToday > 0 && (
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>⚡</Text>
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Daily Warrior</Text>
                <Text style={styles.achievementDescription}>Completed {stats.completedHabitsToday} habit{stats.completedHabitsToday > 1 ? 's' : ''} today</Text>
              </View>
            </View>
          )}
          
          {stats.completedGoals > 0 && (
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>🏆</Text>
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Goal Crusher</Text>
                <Text style={styles.achievementDescription}>Completed {stats.completedGoals} goal{stats.completedGoals > 1 ? 's' : ''}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.motivationSection}>
          <Text style={styles.sectionTitle}>Keep Going!</Text>
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>
              {userLevel && userLevel.level >= 5 
                ? "You're building incredible momentum! Keep up the amazing work!" 
                : userLevel && userLevel.level >= 3
                ? "Great progress! You're developing strong habits!"
                : "Every habit completed brings you closer to your goals!"}
            </Text>
            <Text style={styles.motivationAuthor}>
              {userLevel && userLevel.progressToNextLevel < 0.5 
                ? `Only ${Math.ceil((userLevel.xpForNextLevel - userLevel.currentXP))} XP to ${userLevel.title}!`
                : "Keep building those habits! 🔥"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md - theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    gap: theme.spacing.md - theme.spacing.xs,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '47%',
    ...theme.shadows.md,
  },
  statValue: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  achievementSection: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md - theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md - theme.spacing.xs,
  },
  achievementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md - theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  achievementEmoji: {
    fontSize: theme.typography.sizes.heading,
    marginRight: theme.spacing.md,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  achievementDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs / 2,
  },
  motivationSection: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md - theme.spacing.xs,
  },
  motivationCard: {
    backgroundColor: theme.colors.secondary.orange,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: theme.spacing.xxl - theme.spacing.sm,
  },
  motivationAuthor: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.md - theme.spacing.xs,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.secondary.orange,
    textAlign: 'center',
  },
});