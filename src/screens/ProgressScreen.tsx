import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useCelebration } from '../context/CelebrationContext';
import { useCharacter } from '../context/CharacterContext';
import { DataService } from '../services/dataService';
import { LevelProgressCard } from '../components/LevelProgressCard';
import { DailyXPGoal } from '../components/DailyXPGoal';
import { AchievementBadge } from '../components/AchievementBadge';
import { AnimatedStatCard } from '../components/AnimatedStatCard';
import { CharacterInteraction } from '../components/CharacterInteraction';
import { CharacterHabitSuggestions } from '../components/CharacterHabitSuggestions';
import { calculateUserLevel, UserLevel } from '../utils/levelSystem';
import { gamification } from '../services/gamification';
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
  const { triggerCelebration } = useCelebration();
  const { updateCharacterProgress, triggerCharacterMessage, getMotivationalMessage } = useCharacter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousStreak = useRef<number>(0);
  const previousLevel = useRef<number>(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  useEffect(() => {
    const handleHabitToggled = (data: any) => {
      console.log('🔄 Progress screen received habit toggle event:', data);
      if (user) {
        loadUserStats(true); 
      }
    };

    const handleXPUpdated = (data: any) => {
      console.log('🔄 Progress screen received XP update event:', data);
      if (user) {
        loadUserStats(true); 
      }
    };

    const handleGoalProgressUpdated = (data: any) => {
      console.log('🔄 Progress screen received goal progress update event:', data);
      if (user) {
        loadUserStats(true); 
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

  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('🔄 Progress screen focused - refreshing data')
        const shouldShowLoading = !stats; 
        loadUserStats(!shouldShowLoading); 
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
      const userGoals = await DataService.getUserGoals(user.id);
      const todayCompletions = await DataService.getTodayCompletions(user.id);
      await DataService.debugXPData(user.id);
      const todayXP = await DataService.recalculateTodayXP(user.id);
      const totalXP = await DataService.getUserTotalXP(user.id);
      const weeklyXP = await DataService.getUserWeeklyXP(user.id);
      const monthlyXP = await DataService.getUserMonthlyXP(user.id);
      const level = calculateUserLevel(totalXP);
      setUserLevel(level);
      
      const statsData: UserStats = {
        totalXP,
        todayXP,
        weeklyXP,
        monthlyXP,
        completedHabitsToday: todayCompletions.length,
        currentStreak: 1,
        completedGoals: userGoals.filter(g => g.progress >= 100).length,
        activeGoals: userGoals.filter(g => g.progress < 100).length,
      };
      
      setStats(statsData);
      updateCharacterProgress({
        totalXP: statsData.totalXP,
        currentStreak: statsData.currentStreak,
        completedHabitsToday: statsData.completedHabitsToday,
        level: level?.level || 1,
        habitsThisWeek: statsData.weeklyXP / 8, 
      });
      
      if (previousStreak.current > 0 && statsData.currentStreak > previousStreak.current) {
        const streakMilestones = [3, 7, 14, 30, 50, 100];
        const hitMilestone = streakMilestones.find(milestone => 
          statsData.currentStreak >= milestone && previousStreak.current < milestone
        );
        
        if (hitMilestone) {
          triggerCelebration({
            type: 'streak_milestone',
            intensity: hitMilestone >= 30 ? 'high' : hitMilestone >= 7 ? 'medium' : 'low',
            title: `${hitMilestone} Day Streak!`,
            subtitle: `You're on fire! ${hitMilestone} days in a row!`,
            message: hitMilestone >= 30 ? 'Absolutely incredible dedication! 🔥' : 
                     hitMilestone >= 7 ? 'Amazing consistency! Keep it up! 💪' : 
                     'Great start! Building momentum! 🚀',
          });
          triggerCharacterMessage(
            `Wow! ${hitMilestone} days in a row! You're absolutely unstoppable! 🔥`,
            'celebrating'
          );
        }
      }
      if (level && previousLevel.current > 0 && level.level > previousLevel.current) {
        triggerCelebration({
          type: 'level_up',
          intensity: 'high',
          title: `Level ${level.level} Achieved!`,
          subtitle: `Welcome to ${level.title}!`,
          message: `You've grown so much! Keep pushing forward! 🌟`,
        });
        
        triggerCharacterMessage(
          `Level ${level.level}! I'm so proud of your growth! You're becoming amazing! ✨`,
          'excited'
        );
      }
      
      if (statsData.completedHabitsToday >= 3 && previousStreak.current === statsData.currentStreak) {
        const achievementMessage = getMotivationalMessage('achievement');
        triggerCharacterMessage(achievementMessage, 'proud');
      }

      previousStreak.current = statsData.currentStreak;
      if (level) previousLevel.current = level.level;

      if (!isRefresh) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }
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
      <Animated.ScrollView 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Your Progress</Text>
              <Text style={styles.subtitle}>
                {isRefreshing ? 'Updating...' : 'Keep up the great work!'}
              </Text>
            </View>
            <View style={styles.characterSection}>
              <CharacterInteraction 
                size="medium" 
                showInstructions={true}
                context="progress"
              />
            </View>
          </View>
        </View>

        {/* User Level Progress */}
        {userLevel && <LevelProgressCard userLevel={userLevel} />}

        {/* Daily XP Goal */}
        {stats && <DailyXPGoal currentXP={stats.todayXP} goalXP={50} />}

        <View style={styles.statsGrid}>
          {/* Total XP Card */}
          <AnimatedStatCard
            emoji="💎"
            value={stats.totalXP}
            label="Total XP"
            progress={1} // Always full for total XP
            progressColor="#FFD700"
            backgroundColor="#FFFBF0"
            borderColor="#FFE082"
            valueColor="#F57F17"
            delay={0}
            onPress={() => console.log('Total XP pressed')}
          />
          
          {/* Weekly XP Card */}
          <AnimatedStatCard
            emoji="📅"
            value={stats.weeklyXP}
            label="Weekly"
            progress={Math.min(stats.weeklyXP / 200, 1)}
            progressColor={theme.colors.primary.blue}
            backgroundColor="#F3F8FF"
            borderColor="#90CAF9"
            valueColor={theme.colors.primary.blue}
            delay={100}
            onPress={() => console.log('Weekly XP pressed')}
          />
          
          {/* Monthly XP Card */}
          <AnimatedStatCard
            emoji="🗓️"
            value={stats.monthlyXP}
            label="Monthly"
            progress={Math.min(stats.monthlyXP / 1000, 1)}
            progressColor={theme.colors.secondary.purple}
            backgroundColor="#F8F3FF"
            borderColor="#CE93D8"
            valueColor={theme.colors.secondary.purple}
            delay={200}
            onPress={() => console.log('Monthly XP pressed')}
          />
          
          {/* Today's Habits Card */}
          <AnimatedStatCard
            emoji="✅"
            value={stats.completedHabitsToday}
            label="Today"
            progress={Math.min(stats.completedHabitsToday / 5, 1)}
            progressColor={theme.colors.primary.green}
            backgroundColor="#F1F8E9"
            borderColor="#A5D6A7"
            valueColor={theme.colors.primary.green}
            delay={300}
            onPress={() => console.log('Habits pressed')}
          />
          
          {/* Streak Card */}
          <AnimatedStatCard
            emoji="🔥"
            value={stats.currentStreak}
            label="Streak"
            progress={Math.min(stats.currentStreak / 7, 1)}
            progressColor="#FF6B35"
            backgroundColor="#FFF3E0"
            borderColor="#FFB74D"
            valueColor="#FF6B35"
            delay={400}
            onPress={() => console.log('Streak pressed')}
          />
          
          {/* Active Goals Card */}
          <AnimatedStatCard
            emoji="🎯"
            value={stats.activeGoals}
            label="Goals"
            progress={Math.min(stats.activeGoals / 3, 1)}
            progressColor={theme.colors.secondary.orange}
            backgroundColor="#FFF8E1"
            borderColor="#FFCC02"
            valueColor={theme.colors.secondary.orange}
            delay={500}
            onPress={() => console.log('Goals pressed')}
          />
        </View>

        {/* Achievement Badge Gallery */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>Achievements Gallery</Text>
          
          {/* Featured Recent Achievements */}
          <View style={styles.featuredAchievements}>
            {(() => {
              const mockAchievements = [
                {
                  id: 'first_steps',
                  title: 'First Steps',
                  description: 'Complete your first habit',
                  emoji: '🌱',
                  category: 'milestone' as const,
                  rarity: 'common' as const,
                  unlocked: stats.completedHabitsToday > 0,
                  progress: Math.min(stats.completedHabitsToday / 1, 1),
                },
                {
                  id: 'streak_starter',
                  title: 'Streak Starter',
                  description: '3 days in a row',
                  emoji: '🔥',
                  category: 'streak' as const,
                  rarity: 'common' as const,
                  unlocked: stats.currentStreak >= 3,
                  progress: Math.min(stats.currentStreak / 3, 1),
                },
                {
                  id: 'week_warrior',
                  title: 'Week Warrior',
                  description: '7 days in a row',
                  emoji: '⚡',
                  category: 'streak' as const,
                  rarity: 'rare' as const,
                  unlocked: stats.currentStreak >= 7,
                  progress: Math.min(stats.currentStreak / 7, 1),
                },
                {
                  id: 'habit_builder',
                  title: 'Habit Builder',
                  description: 'Complete 25 habits total',
                  emoji: '🏗️',
                  category: 'milestone' as const,
                  rarity: 'rare' as const,
                  unlocked: stats.totalXP >= 200, 
                  progress: Math.min(stats.totalXP / 200, 1),
                },
              ];

              return mockAchievements.slice(0, 3).map((achievement) => (
                <View key={achievement.id} style={styles.badgeContainer}>
                  <AchievementBadge
                    id={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    category={achievement.category}
                    rarity={achievement.rarity}
                    emoji={achievement.emoji}
                    unlocked={achievement.unlocked}
                    progress={achievement.progress}
                    size="small"
                    animated={true}
                    showProgress={true}
                  />
                </View>
              ));
            })()}
          </View>
          
          {/* Achievement Progress Summary */}
          <View style={styles.achievementSummary}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>🏆</Text>
              <Text style={styles.summaryTitle}>Achievements</Text>
              <Text style={styles.summaryValue}>
                {/* Mock data - in real app calculate from gamification service */}
                {Math.min(stats.currentStreak + (stats.completedHabitsToday > 0 ? 1 : 0), 20)}/20
              </Text>
              <Text style={styles.summaryLabel}>Unlocked</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>⭐</Text>
              <Text style={styles.summaryTitle}>Rarity</Text>
              <Text style={styles.summaryValue}>
                {stats.currentStreak >= 7 ? 'Epic' : stats.currentStreak >= 3 ? 'Rare' : 'Common'}
              </Text>
              <Text style={styles.summaryLabel}>Best Badge</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>🎯</Text>
              <Text style={styles.summaryTitle}>Next Goal</Text>
              <Text style={styles.summaryValue}>
                {stats.currentStreak < 3 ? '3 Day Streak' : stats.currentStreak < 7 ? '7 Day Streak' : '14 Day Streak'}
              </Text>
              <Text style={styles.summaryLabel}>Almost There</Text>
            </View>
          </View>
        </View>

        {/* Character-driven habit suggestions */}
        {userLevel && stats && (
          <CharacterHabitSuggestions
            userLevel={userLevel.level}
            currentStreak={stats.currentStreak}
            completedCategories={[]} 
            onSuggestionSelect={(suggestion) => {
              console.log('Selected habit suggestion:', suggestion.title);
            }}
          />
        )}

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
      </Animated.ScrollView>
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
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  characterSection: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: theme.spacing.sm,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '47%',
    ...theme.shadows.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  statProgress: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    ...theme.shadows.sm,
  },

  statCardTotalXP: {
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  statValueTotalXP: {
    color: '#F57F17',
  },
  
  statCardWeekly: {
    backgroundColor: '#F3F8FF',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  statValueWeekly: {
    color: theme.colors.primary.blue,
  },
  
  statCardMonthly: {
    backgroundColor: '#F8F3FF',
    borderWidth: 1,
    borderColor: '#CE93D8',
  },
  statValueMonthly: {
    color: theme.colors.secondary.purple,
  },
  
  statCardHabits: {
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  statValueHabits: {
    color: theme.colors.primary.green,
  },
  
  statCardStreak: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  statValueStreak: {
    color: '#FF6B35',
  },
  
  statCardGoals: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFCC02',
  },
  statValueGoals: {
    color: theme.colors.secondary.orange,
  },
  achievementSection: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },

  featuredAchievements: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  badgeContainer: {
    flex: 1,
    alignItems: 'center',
  },

  achievementSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral.lightGray,
  },
  summaryEmoji: {
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  summaryTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs / 2,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  motivationSection: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  motivationCard: {
    backgroundColor: theme.colors.secondary.orange,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
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