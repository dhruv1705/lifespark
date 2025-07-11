import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { JourneyNode, NodeStatus } from './JourneyNode';
import { PathConnector } from './PathConnector';
import { CategoryDropdownHeader } from './CategoryDropdownHeader';
import { CompactToggle } from './CompactToggle';
import { FilterTab, FilterState } from './FilterTab';
import { GoalDropdown } from './GoalDropdown';
import { DataService } from '../services/dataService';
import { hasVideo, getVideoConfig } from '../data/videoHelper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { Database } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { dataSync, DATA_SYNC_EVENTS } from '../utils/dataSync';
import { RootStackParamList } from '../types';
import { StreakService } from '../services/streakService';

type Category = Database['public']['Tables']['categories']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];

interface JourneyData {
  id: string;
  title: string;
  emoji: string;
  status: NodeStatus;
  progress?: number;
  position: 'left' | 'right' | 'center';
  category?: Category;
  goal?: Goal;
  habit?: Habit;
  goalName?: string; 
  isGoalHeader?: boolean; 
  isGoalSeparator?: boolean; 
}

interface JourneyViewProps {
  categories: Category[];
  isJourneyView: boolean;
  onToggle: (isJourneyView: boolean) => void;
  onHabitToggle: (habit: Habit) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({ categories, isJourneyView, onToggle, onHabitToggle }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<JourneyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    timeFilter: 'daily',
    statusFilter: 'all',
    goalFilter: 'all',
  });

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
    loadFilterPreferences();
  }, [categories]);

  useEffect(() => {
    const handleHabitToggled = () => {
      console.log('🔄 Journey view received habit toggle event - refreshing data');
      if (selectedCategory) {
        loadJourneyData(selectedCategory.id);
      }
    };

    const handleXPUpdated = () => {
      console.log('🔄 Journey view received XP update event - refreshing data');
      if (selectedCategory) {
        loadJourneyData(selectedCategory.id);
      }
    };

    const handleProgressUpdated = (data: { habitId: string; progress: number }) => {
      console.log(`🔄 Journey view received progress update for habit ${data.habitId}: ${data.progress.toFixed(1)}%`);
      setJourneyData(prevData => 
        prevData.map(item => 
          item.id === data.habitId 
            ? { ...item, progress: data.progress } 
            : item
        )
      );
    };

    dataSync.on(DATA_SYNC_EVENTS.HABIT_TOGGLED, handleHabitToggled);
    dataSync.on(DATA_SYNC_EVENTS.XP_UPDATED, handleXPUpdated);
    dataSync.on(DATA_SYNC_EVENTS.HABIT_PROGRESS_UPDATED, handleProgressUpdated);

    return () => {
      dataSync.off(DATA_SYNC_EVENTS.HABIT_TOGGLED, handleHabitToggled);
      dataSync.off(DATA_SYNC_EVENTS.XP_UPDATED, handleXPUpdated);
      dataSync.off(DATA_SYNC_EVENTS.HABIT_PROGRESS_UPDATED, handleProgressUpdated);
    };
  }, [selectedCategory]);

  const loadFilterPreferences = async () => {
    try {
      const savedFilters = await AsyncStorage.getItem('journeyFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      }
    } catch (error) {
      console.error('Error loading filter preferences:', error);
    }
  };

  const saveFilterPreferences = async (newFilters: FilterState) => {
    try {
      await AsyncStorage.setItem('journeyFilters', JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filter preferences:', error);
    }
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    saveFilterPreferences(newFilters);
  };

  useEffect(() => {
    if (selectedCategory) {
      loadJourneyData(selectedCategory.id);
    }
  }, [selectedCategory, filters, selectedGoal]);
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Journey view focused - refreshing data');
      if (selectedCategory) {
        loadJourneyData(selectedCategory.id);
      }
    }, [selectedCategory, filters, selectedGoal])
  );

  const getUserCompletions = async (timeFilter: 'daily' | 'weekly' | 'monthly') => {
    try {
      if (!user) return [];
      
      switch (timeFilter) {
        case 'daily':
          return await DataService.getTodayCompletions(user.id);
        case 'weekly':
          return await DataService.getTodayCompletions(user.id);
        case 'monthly':
          return await DataService.getTodayCompletions(user.id);
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting user completions:', error);
      return [];
    }
  };

  const loadJourneyData = async (categoryId?: string) => {
    try {
      setLoading(true);

      const targetCategory = categoryId ? 
        categories.find(c => c.id === categoryId) : 
        selectedCategory;
      
      if (!targetCategory) {
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
          return;
        }
        return;
      }
      
      const goals = await DataService.getGoalsByCategory(targetCategory.id);
      setAvailableGoals(goals);

      if (!selectedGoal && goals.length > 0) {
        setSelectedGoal(goals[0]);
      }
    
      let filteredGoals = goals;
      
      if (selectedGoal) {
        filteredGoals = [selectedGoal];
      } else if (filters.goalFilter !== 'all') {
        filteredGoals = goals.filter(goal => 
          Array.isArray(filters.goalFilter) && filters.goalFilter.includes(goal.id)
        );
      }

      const completions = await getUserCompletions(filters.timeFilter);
      const transformedData: JourneyData[] = [];
      let habitIndex = 0;
      
      for (const [goalIndex, goal] of filteredGoals.entries()) {
        const habits = await DataService.getHabitsByGoal(goal.id);
        
        const filteredHabits = habits.filter(habit => {
          const isCompleted = completions.some(completion => completion.habit_id === habit.id);
          
          if (filters.statusFilter === 'completed') {
            return isCompleted;
          } else if (filters.statusFilter === 'pending') {
            return !isCompleted;
          } else {
            return true; 
          }
        });
        
        if (filteredHabits.length > 0) {
          if (goalIndex > 0) {
            transformedData.push({
              id: `goal-separator-${goal.id}`,
              title: '',
              emoji: '',
              status: 'completed',
              position: 'center',
              category: targetCategory,
              goal: goal,
              goalName: '',
              isGoalHeader: false,
              isGoalSeparator: true,
            });
          }
          
          transformedData.push({
            id: `goal-header-${goal.id}`,
            title: goal.name,
            emoji: '',
            status: 'completed', 
            position: 'center',
            category: targetCategory,
            goal: goal,
            goalName: goal.name,
            isGoalHeader: true,
          });
          
          for (const habit of filteredHabits) {
            const position = habitIndex % 3 === 0 ? 'center' : habitIndex % 3 === 1 ? 'left' : 'right';
            
            const completionRecord = completions.find(completion => completion.habit_id === habit.id);
            const isCompleted = !!completionRecord;
            console.log(`🔍 Journey: Checking habit ${habit.id} (${habit.name}), isCompleted: ${isCompleted}`);
            console.log(`🔍 Journey: Completion record:`, completionRecord);
            console.log(`🔍 Journey: Available completions:`, completions.map(c => ({ id: c.habit_id, completed_date: c.completed_date })));
            
            let status: NodeStatus;
            let progress = 0;
            
            if (isCompleted) {
              status = 'completed';
              progress = 100;
              console.log(`✅ Journey: Setting habit ${habit.id} as completed with 100% progress`);
            } else {
              let firstUncompletedIndex = -1;
              for (let i = 0; i < filteredHabits.length; i++) {
                const completionExists = completions.some(c => c.habit_id === filteredHabits[i].id);
                if (!completionExists) {
                  firstUncompletedIndex = i;
                  break;
                }
              }
              
              if (habitIndex === firstUncompletedIndex) {
                status = 'current';
                progress = 0;
                console.log(`🔄 Journey: Setting habit ${habit.id} as current with 0% progress`);
              } else if (habitIndex === 0 && firstUncompletedIndex === -1) {
                status = 'current';
                progress = 0;
                console.log(`🔄 Journey: Setting habit ${habit.id} as current with 0% progress`);
              } else if (habitIndex === filteredHabits.length - 1) {
                status = 'bonus';
                progress = 0;
                console.log(`🎁 Journey: Setting habit ${habit.id} as bonus with 0% progress`);
              } else {
                status = 'locked';
                progress = 0;
                console.log(`🔒 Journey: Setting habit ${habit.id} as locked with 0% progress`);
              }
            }

            transformedData.push({
              id: habit.id,
              title: habit.name,
              emoji: targetCategory.emoji || '📱',
              status,
              progress,
              position,
              category: targetCategory,
              goal: goal,
              habit: habit,
              goalName: goal.name,
              isGoalHeader: false,
            });
            
            habitIndex++;
          }
        }
      }

      setJourneyData(transformedData);
      
      if (!selectedCategory && categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    } catch (error) {
      console.error('Error loading journey data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleNodePress = async (item: JourneyData) => {
    if (item.habit && !item.isGoalHeader) {
      const hasVideoContent = hasVideo(item.habit.name);
      const videoConfig = getVideoConfig(item.habit.name);
      
      if (hasVideoContent && videoConfig) {
        navigation.navigate('VideoPlayer', {
          videoUrl: videoConfig.videoUrl,
          title: videoConfig.title || item.habit.name,
          habitId: item.habit.id,
          habitXp: item.habit.xp
        });
      } else {
        if (user && item.habit) {
          try {
            const wasCompleted = await DataService.toggleHabitCompletion(user.id, item.habit.id, item.habit.xp);
            
            if (wasCompleted) {
              const streakData = await StreakService.recordTaskCompletion(user.id, item.habit.id);
              dataSync.emit(DATA_SYNC_EVENTS.HABIT_TOGGLED, {
                habitId: item.habit.id,
                completed: true,
                xp: item.habit.xp,
                userId: user.id
              });

              navigation.navigate('TaskCompleted', {
                taskTitle: item.habit.name,
                xpEarned: item.habit.xp,
                streakDay: streakData.streakDay,
                isFirstTaskOfDay: streakData.isFirstTaskOfDay,
              });
            }
            onHabitToggle(item.habit);
          } catch (error) {
            console.error('Error toggling habit completion:', error);
            onHabitToggle(item.habit);
          }
        } else {
          onHabitToggle(item.habit);
        }
      }
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedGoal(null); 
    loadJourneyData(category.id);
  };

  const renderJourneyNode = (item: JourneyData, index: number) => {
    const nextItem = journeyData[index + 1];
    const showConnector = nextItem !== undefined && !item.isGoalHeader && !item.isGoalSeparator;
    const connectorCompleted = item.status === 'completed';
    if (item.isGoalSeparator) {
      return (
        <View key={item.id} style={styles.goalSeparator}>
          <View style={styles.separatorLine} />
        </View>
      );
    }

    if (item.isGoalHeader) {
      return (
        <GoalDropdown
          key={item.id}
          goals={availableGoals}
          selectedGoal={item.goal!}
          onSelectGoal={setSelectedGoal}
        />
      );
    }

    return (
      <View key={item.id} style={styles.nodeContainer}>
        <JourneyNode
          id={item.id}
          title={item.title}
          emoji={item.emoji}
          status={item.status}
          progress={item.progress}
          position={item.position}
          onPress={() => handleNodePress(item)}
        />
        
        {showConnector && (
          <PathConnector
            fromPosition={item.position}
            toPosition={nextItem.position}
            isCompleted={connectorCompleted}
            height={120}
            showProgress={item.status === 'current'}
            progress={item.progress || 0}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.blue} />
        <Text style={styles.loadingText}>Loading your journey...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.appTitle}>Lifespark</Text>
        <CompactToggle
          isJourneyView={isJourneyView}
          onToggle={onToggle}
          style={styles.headerToggle}
        />
      </View>
      
      <CategoryDropdownHeader
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      <FilterTab
        isExpanded={isFilterExpanded}
        onToggle={() => setIsFilterExpanded(!isFilterExpanded)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableGoals={availableGoals}
      />
      
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.journeyContainer}>
          {journeyData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No habits found matching your filters
              </Text>
              <Text style={styles.emptyStateSubtext}>
              </Text>
            </View>
          ) : (
            journeyData.map((item, index) => renderJourneyNode(item, index))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  appTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  headerToggle: {
    transform: [{ scale: 0.8 }],
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  journeyContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  nodeContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
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
  goalHeaderContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
  },
  goalHeaderText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    backgroundColor: theme.colors.primary.green,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.blue,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  goalSeparator: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  separatorLine: {
    width: '60%',
    height: 2,
    backgroundColor: theme.colors.border,
    borderRadius: 1,
    opacity: 0.3,
  },
});