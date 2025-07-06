import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { GoalCard } from '../components/GoalCard';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, Goal } from '../types';
import { Database } from '../lib/database.types';
import { theme } from '../theme';

type GoalsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Goals'>;
type GoalsScreenRouteProp = RouteProp<RootStackParamList, 'Goals'>;
type Category = Database['public']['Tables']['categories']['Row'];
type DbGoal = Database['public']['Tables']['goals']['Row'];

interface GoalsScreenProps {
  navigation: GoalsScreenNavigationProp;
  route: GoalsScreenRouteProp;
}

// Transform database goal to local Goal type with actual progress
const transformGoal = (dbGoal: DbGoal, progress: number = 0): Goal => ({
  id: dbGoal.id,
  categoryId: dbGoal.category_id,
  name: dbGoal.name,
  description: dbGoal.description,
  duration: dbGoal.duration,
  progress,
});

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation, route }) => {
  const { categoryId } = route.params;
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  // Refresh data when screen comes into focus (e.g., returning from HabitsScreen)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [categoryId, user])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load category details
      const categories = await DataService.getCategories();
      const foundCategory = categories.find(c => c.id === categoryId);
      setCategory(foundCategory || null);
      
      // Load goals for this category
      const dbGoals = await DataService.getGoalsByCategory(categoryId);
      
      // Recalculate all goal progress to ensure accuracy
      if (user) {
        try {
          await DataService.recalculateAllGoalProgress(user.id);
        } catch (error) {
          console.error('Error recalculating goal progress:', error);
        }
      }
      
      // Load user progress for each goal if user is authenticated
      const transformedGoals = await Promise.all(
        dbGoals.map(async (dbGoal) => {
          let progress = 0;
          if (user) {
            try {
              progress = await DataService.getUserGoalProgress(user.id, dbGoal.id);
            } catch (error) {
              console.error('Error loading progress for goal:', dbGoal.id, error);
            }
          }
          return transformGoal(dbGoal, progress);
        })
      );
      
      setGoals(transformedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalPress = (goal: Goal) => {
    navigation.navigate('Habits', { goalId: goal.id });
  };

  const renderGoal = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onPress={() => handleGoalPress(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.blue} />
          <Text style={styles.loadingText}>Loading goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{category?.emoji}</Text>
        <Text style={styles.title}>{category?.name} Goals</Text>
        <Text style={styles.subtitle}>Choose a goal to work towards</Text>
      </View>
      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No goals found for this category</Text>
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
    alignItems: 'center',
  },
  emoji: {
    fontSize: theme.spacing.xxl + theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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
    marginTop: theme.spacing.sm,
  },
  list: {
    padding: theme.spacing.lg,
    paddingTop: 0,
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