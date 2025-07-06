import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Habit, HabitStep, HabitSession } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { getInteractiveHabitData } from '../data/interactiveHabits';
import { theme } from '../theme';
import { dataSync, DATA_SYNC_EVENTS } from '../utils/dataSync';

type HabitExecutionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HabitExecution'>;
type HabitExecutionScreenRouteProp = RouteProp<RootStackParamList, 'HabitExecution'>;

interface HabitExecutionScreenProps {
  navigation: HabitExecutionScreenNavigationProp;
  route: HabitExecutionScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

export const HabitExecutionScreen: React.FC<HabitExecutionScreenProps> = ({
  navigation,
  route,
}) => {
  const { habitId } = route.params;
  const { user } = useAuth();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [session, setSession] = useState<HabitSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load habit data
  useEffect(() => {
    loadHabitData();
  }, [habitId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStarted && !isPaused && stepTimeRemaining > 0) {
      interval = setInterval(() => {
        setStepTimeRemaining(prev => {
          if (prev <= 1) {
            // Step completed, move to next
            handleStepComplete();
            return 0;
          }
          return prev - 1;
        });
        
        setTotalTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStarted, isPaused, stepTimeRemaining]);

  const loadHabitData = async () => {
    try {
      setLoading(true);
      
      // Get base habit data from database
      const dbHabit = await DataService.getHabitById(habitId);
      if (!dbHabit) {
        Alert.alert('Error', 'Habit not found');
        navigation.goBack();
        return;
      }

      // Transform database habit to our Habit interface
      const baseHabit: Habit = {
        id: dbHabit.id,
        goalId: dbHabit.goal_id,
        name: dbHabit.name,
        description: dbHabit.description,
        level: dbHabit.level,
        xp: dbHabit.xp,
        completed: false, // Will be determined separately
      };

      // Enhanced with interactive data
      const enhancedHabit = getInteractiveHabitData(habitId, baseHabit);
      setHabit(enhancedHabit);

      // Initialize session for guided habits
      if (enhancedHabit.executionType === 'guided' && enhancedHabit.steps) {
        const initialSession: HabitSession = {
          habitId,
          startTime: new Date(),
          currentStepIndex: 0,
          completedSteps: [],
          isPaused: false,
          totalTimeElapsed: 0,
        };
        setSession(initialSession);
        setStepTimeRemaining(enhancedHabit.steps[0].duration);
      }
    } catch (error) {
      console.error('Error loading habit:', error);
      Alert.alert('Error', 'Failed to load habit data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    setIsStarted(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };

  const handleStepComplete = () => {
    if (!habit?.steps || !session) return;

    const currentStep = habit.steps[currentStepIndex];
    const updatedCompletedSteps = [...session.completedSteps, currentStep.id];
    
    setSession(prev => prev ? {
      ...prev,
      completedSteps: updatedCompletedSteps,
      currentStepIndex: currentStepIndex + 1
    } : null);

    // Check if all steps completed
    if (currentStepIndex + 1 >= habit.steps.length) {
      handleSessionComplete();
      return;
    }

    // Move to next step
    setCurrentStepIndex(prev => prev + 1);
    setStepTimeRemaining(habit.steps[currentStepIndex + 1].duration);
  };

  const handleSessionComplete = async () => {
    if (!user || !habit) return;

    try {
      // Mark habit as completed and award XP
      await DataService.toggleHabitCompletion(user.id, habitId, habit.xp);
      
      // Emit sync event
      dataSync.emit(DATA_SYNC_EVENTS.HABIT_TOGGLED, {
        habitId,
        completed: true,
        xp: habit.xp,
        userId: user.id
      });

      // Show completion celebration
      Alert.alert(
        '🎉 Excellent Work!',
        `You completed your morning stretch routine and earned ${habit.xp} XP!\n\nHow do you feel?`,
        [
          {
            text: 'Amazing!',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error completing habit:', error);
      Alert.alert('Error', 'Failed to save completion');
    }
  };

  const handleExit = () => {
    if (!isStarted) {
      navigation.goBack();
      return;
    }

    const completedSteps = session?.completedSteps.length || 0;
    const totalSteps = habit?.steps?.length || 0;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    Alert.alert(
      'Save Progress?',
      `You've completed ${completedSteps}/${totalSteps} stretches (${progressPercent}%).\n\nWould you like to save your progress?`,
      [
        {
          text: 'Exit Without Saving',
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
        {
          text: 'Save Progress',
          onPress: () => handlePartialCompletion()
        },
        {
          text: 'Continue Session',
          style: 'cancel'
        }
      ]
    );
  };

  const handlePartialCompletion = async () => {
    if (!user || !habit || !session) return;

    try {
      const completedSteps = session.completedSteps.length;
      const totalSteps = habit.steps?.length || 1;
      const completionPercent = completedSteps / totalSteps;
      
      // Award partial XP based on completion
      let partialXP = 0;
      if (completionPercent >= 0.7) {
        partialXP = Math.round(habit.xp * 0.7); // 70% XP
      } else if (completionPercent >= 0.3) {
        partialXP = Math.round(habit.xp * 0.3); // 30% XP
      }

      if (partialXP > 0) {
        // Save partial completion
        await DataService.recordPartialCompletion(user.id, habitId, partialXP, completionPercent);
        
        Alert.alert(
          'Progress Saved!',
          `Great effort! You earned ${partialXP} XP for your progress.\n\nTry to complete the full routine tomorrow!`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving partial completion:', error);
      navigation.goBack();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPreSession = () => (
    <View style={styles.preSessionContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.habitTitle}>{habit?.name}</Text>
        <Text style={styles.habitDescription}>{habit?.description}</Text>
        <Text style={styles.durationText}>
          ⏱️ {Math.round((habit?.duration || 0) / 60)} minutes • {habit?.steps?.length} stretches
        </Text>
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.sectionTitle}>Before we start:</Text>
        {habit?.instructions?.map((instruction, index) => (
          <Text key={index} style={styles.instructionText}>
            • {instruction}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
        <Text style={styles.startButtonText}>Start Stretching 🧘‍♀️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveSession = () => {
    const currentStep = habit?.steps?.[currentStepIndex];
    const totalSteps = habit?.steps?.length || 0;
    const progress = ((currentStepIndex) / totalSteps) * 100;

    return (
      <View style={styles.sessionContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStepIndex}/{totalSteps} stretches
          </Text>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(stepTimeRemaining)}</Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>
        </View>

        {/* Current Step */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{currentStep?.title}</Text>
          <Text style={styles.stepDescription}>{currentStep?.description}</Text>
          
          <ScrollView style={styles.instructionsContainer} showsVerticalScrollIndicator={false}>
            {currentStep?.instructions.map((instruction, index) => (
              <Text key={index} style={styles.stepInstruction}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </ScrollView>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.pauseButton]} 
            onPress={handlePauseResume}
          >
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.skipButton]} 
            onPress={handleStepComplete}
          >
            <Text style={styles.controlButtonText}>Skip ⏭️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your stretch routine...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.green} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Morning Stretch</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {!isStarted ? renderPreSession() : renderActiveSession()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.green,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
  },
  headerTitle: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
  },
  preSessionContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  habitTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  habitDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  durationText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary.green,
    fontWeight: theme.typography.weights.semibold,
  },
  instructionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  instructionText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: theme.colors.secondary.orange,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: theme.spacing.lg,
  },
  startButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  sessionContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  progressContainer: {
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary.orange,
    borderRadius: 3,
  },
  progressText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.secondary.orange,
  },
  timerText: {
    color: theme.colors.text.inverse,
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
  },
  timerLabel: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    opacity: 0.8,
  },
  stepCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  instructionsContainer: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  controlButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  controlButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});