import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HabitCard } from '../components/HabitCard';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, Habit } from '../types';
import { Database } from '../lib/database.types';
import { theme } from '../theme';
import { dataSync, DATA_SYNC_EVENTS } from '../utils/dataSync';
import { getInteractiveHabitData } from '../data/interactiveHabits';

type HabitsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Habits'>;
type HabitsScreenRouteProp = RouteProp<RootStackParamList, 'Habits'>;
type Goal = Database['public']['Tables']['goals']['Row'];
type DbHabit = Database['public']['Tables']['habits']['Row'];

interface HabitsScreenProps {
  navigation: HabitsScreenNavigationProp;
  route: HabitsScreenRouteProp;
}

// Transform database habit to local Habit type
const transformHabit = (dbHabit: DbHabit, completed: boolean = false): Habit => ({
  id: dbHabit.id,
  goalId: dbHabit.goal_id,
  name: dbHabit.name,
  description: dbHabit.description,
  level: dbHabit.level,
  xp: dbHabit.xp,
  completed,
});

export const HabitsScreen: React.FC<HabitsScreenProps> = ({ navigation, route }) => {
  const { goalId } = route.params;
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [habitsList, setHabitsList] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [goalId, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load goal details
      const foundGoal = await DataService.getGoalById(goalId);
      setGoal(foundGoal);
      
      // Load habits for this goal
      const dbHabits = await DataService.getHabitsByGoal(goalId);
      
      // Load completion status for today if user is authenticated
      let todayCompletions: string[] = [];
      if (user) {
        const completions = await DataService.getTodayCompletions(user.id);
        todayCompletions = completions.map(c => c.habit_id);
      }
      setCompletedHabits(todayCompletions);
      
      // Transform habits with completion status
      const transformedHabits = dbHabits.map(habit => 
        transformHabit(habit, todayCompletions.includes(habit.id))
      );
      setHabitsList(transformedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHabitToggle = async (habitId: string) => {
    if (!user) return;
    
    try {
      const habit = habitsList.find(h => h.id === habitId);
      if (!habit) return;
      
      const wasCompleted = await DataService.toggleHabitCompletion(user.id, habitId, habit.xp);
      
      // Update local state
      setHabitsList(prev => 
        prev.map(h => 
          h.id === habitId 
            ? { ...h, completed: wasCompleted }
            : h
        )
      );
      
      // Update completed habits list
      setCompletedHabits(prev => 
        wasCompleted 
          ? [...prev, habitId]
          : prev.filter(id => id !== habitId)
      );
      
      // Emit event to notify other screens about XP change
      dataSync.emit(DATA_SYNC_EVENTS.HABIT_TOGGLED, {
        habitId,
        completed: wasCompleted,
        xp: habit.xp,
        userId: user.id
      });
      
      console.log('🔄 Habit toggle event emitted:', { habitId, completed: wasCompleted, xp: habit.xp });
      
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };


  const totalXP = habitsList.reduce((sum, habit) => sum + (habit.completed ? habit.xp : 0), 0);
  const completedCount = habitsList.filter(h => h.completed).length;
  
  // Debug logging for XP calculation
  console.log('🏋️ HabitsScreen XP calculation:', {
    completedHabits: habitsList.filter(h => h.completed).map(h => ({ name: h.name, xp: h.xp, completed: h.completed })),
    totalXP,
    completedCount
  });

  const groupedHabits = habitsList.reduce((groups, habit) => {
    const level = habit.level;
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(habit);
    return groups;
  }, {} as Record<number, Habit[]>);

  const renderSection = (level: number, levelHabits: Habit[]) => {
    const getLevelLabel = (level: number) => {
      switch (level) {
        case 1: return 'Level 1: Foundation';
        case 2: return 'Level 2: Building';
        case 3: return 'Level 3: Power';
        case 4: return 'Level 4: Mastery';
        default: return `Level ${level}`;
      }
    };

    return (
      <View key={level} style={styles.section}>
        <Text style={styles.sectionTitle}>{getLevelLabel(level)}</Text>
        {levelHabits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={() => handleHabitToggle(habit.id)}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary.orange} />
          <Text style={styles.loadingText}>Loading habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal?.name}</Text>
        <Text style={styles.subtitle}>Daily Habits</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP Today</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{completedCount}/{habitsList.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={Object.keys(groupedHabits).map(Number).sort()}
        renderItem={({ item: level }) => renderSection(level, groupedHabits[level])}
        keyExtractor={(level) => level.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No habits found for this goal</Text>
            <Text style={styles.emptySubtext}>Check your database setup or try refreshing</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md - theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  list: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  section: {
    marginBottom: theme.spacing.xxl - theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md - theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl + theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});