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
import { audioManager } from '../services/audioManager';
import { AchievementBurst } from '../components/AchievementBurst';
import { DynamicInstructions } from '../components/DynamicInstructions';
import { Achievement } from '../services/gamification';
import { MusicSelectionModal } from '../components/MusicSelectionModal';

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
  const [isStrengthHabit, setIsStrengthHabit] = useState(false);
  const [session, setSession] = useState<HabitSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Audio state
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.3);

  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Music selection states
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState('angelical');

  // Load habit data
  useEffect(() => {
    loadHabitData();
  }, [habitId]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      audioManager.endSession().catch(console.error);
    };
  }, []);

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
      
      // Detect habit types
      const isStrength = baseHabit.name.toLowerCase().includes('push-up') || 
                        baseHabit.name.toLowerCase().includes('pushup') ||
                        baseHabit.name.toLowerCase().includes('push up');
      setIsStrengthHabit(isStrength);

      // Load music preferences
      const smartRecommendation = audioManager.getSmartMusicRecommendation(baseHabit.name);
      setSelectedMusicId(smartRecommendation.id);

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

  const handleStartSession = async () => {
    try {
      setIsStarted(true);
      setIsPaused(false);

      // Configure audio settings
      audioManager.updateSettings({
        musicEnabled,
        musicVolume,
      });

      // Start audio session with selected background music
      try {
        await audioManager.startSession(habit?.name);
      } catch (audioError) {
        console.warn('⚠️ Could not load background music, continuing without audio:', audioError);
        // Initialize audio manager without music file
        await audioManager.initialize();
      }
      
      console.log('🎯 Session started with audio');
    } catch (error) {
      console.error('Error starting audio session:', error);
      // Continue without audio if there's an error
      setIsStarted(true);
      setIsPaused(false);
    }
  };

  const handlePauseResume = async () => {
    const willBePaused = !isPaused;
    setIsPaused(willBePaused);

    try {
      if (willBePaused) {
        await audioManager.pauseSession();
      } else {
        await audioManager.resumeSession();
      }
    } catch (error) {
      console.error('Error handling pause/resume audio:', error);
    }
  };


  const handleMusicSelection = async (trackId: string) => {
    setSelectedMusicId(trackId);
    await audioManager.setSelectedMusic(trackId, habit?.name);
    console.log(`🎵 Music selected: ${trackId} for ${habit?.name}`);
  };

  const handleMusicSwitch = async () => {
    if (!isStarted) {
      setShowMusicModal(true);
    } else {
      // Quick switch between the two main tracks
      const newTrackId = selectedMusicId === 'angelical' ? 'upbeat' : 'angelical';
      setSelectedMusicId(newTrackId);
      await audioManager.switchMusic(newTrackId, habit?.name);
    }
  };

  const getMusicDisplayInfo = () => {
    return audioManager.getMusicDisplayInfo(selectedMusicId);
  };

  const handleStepComplete = async () => {
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
    const nextStepIndex = currentStepIndex + 1;
    const nextStep = habit.steps[nextStepIndex];
    
    setCurrentStepIndex(nextStepIndex);
    setStepTimeRemaining(nextStep.duration);

  };

  const handleSessionComplete = async () => {
    if (!user || !habit) return;

    try {
      // End audio session with completion message
      await audioManager.endSession(isStrengthHabit ? 'strength' : 'stretch');

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
    <ScrollView style={styles.preSessionContainer} showsVerticalScrollIndicator={false}>
      {/* Welcome Header with Gradient */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeEmoji}>
          {isStrengthHabit ? '🔥' : '🌅'}
        </Text>
        <Text style={styles.welcomeTitle}>
          {isStrengthHabit ? 'Power Up Time!' : 'Rise & Shine!'}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          {isStrengthHabit 
            ? 'Ready to build that strength? Let\'s crush those reps together!' 
            : 'Time to awaken your body with gentle movement'}
        </Text>
        
        {/* Streak Counter */}
        <View style={styles.streakContainer}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakNumber}>7</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.headerCard}>
        <View style={styles.habitIconContainer}>
          <Text style={styles.habitIcon}>
            {isStrengthHabit ? '💪' : '🧘‍♀️'}
          </Text>
        </View>
        <Text style={styles.habitTitle}>{habit?.name}</Text>
        <Text style={styles.habitDescription}>
          {isStrengthHabit 
            ? 'Every rep makes you stronger' 
            : 'Give your body the perfect start to the day'}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statText}>{Math.round((habit?.duration || 0) / 60)} min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>
              {isStrengthHabit ? '🏋️‍♂️' : '🤸‍♀️'}
            </Text>
            <Text style={styles.statText}>
              {habit?.steps?.length} {isStrengthHabit ? 'reps' : 'stretches'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statText}>+{habit?.xp} XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>{isStrengthHabit ? '💥' : '✨'}</Text>
          <Text style={styles.sectionTitle}>
            {isStrengthHabit ? 'Before we dominate:' : 'Let\'s prepare for success:'}
          </Text>
        </View>
        {habit?.instructions?.map((instruction, index) => (
          <View key={index} style={styles.instructionRow}>
            <View style={styles.instructionBullet}>
              <Text style={styles.instructionBulletText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>

      {/* Audio Settings */}
      <View style={styles.audioSettingsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🎵</Text>
          <Text style={styles.sectionTitle}>Create your perfect vibe</Text>
        </View>
        
        <View style={styles.audioToggleRow}>
          <Text style={styles.audioToggleLabel}>🎵 Background Music</Text>
          <TouchableOpacity
            style={[styles.audioToggle, musicEnabled && styles.audioToggleActive]}
            onPress={async () => {
              setMusicEnabled(!musicEnabled);
              if (isStarted) {
                await audioManager.toggleMusic();
              }
            }}
          >
            <Text style={[styles.audioToggleText, musicEnabled && styles.audioToggleTextActive]}>
              {musicEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Music Selection */}
      <View style={styles.musicSelectionCard}>
        <View style={styles.musicSelectionHeader}>
          <Text style={styles.musicSelectionTitle}>🎵 Background Music</Text>
          <TouchableOpacity
            style={styles.changeMusicButton}
            onPress={() => setShowMusicModal(true)}
          >
            <Text style={styles.changeMusicButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.selectedMusicItem}
          onPress={() => setShowMusicModal(true)}
        >
          <Text style={styles.selectedMusicIcon}>
            {getMusicDisplayInfo()?.icon || '🎵'}
          </Text>
          <View style={styles.selectedMusicInfo}>
            <Text style={styles.selectedMusicName}>
              {getMusicDisplayInfo()?.title || 'Calm & Peaceful'}
            </Text>
            <Text style={styles.selectedMusicDescription}>
              {getMusicDisplayInfo()?.subtitle || 'Perfect for your workout'}
            </Text>
          </View>
          <Text style={styles.selectedMusicArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
        <View style={styles.startButtonContent}>
          <Text style={styles.startButtonEmoji}>
            {isStrengthHabit ? '💪' : '🌟'}
          </Text>
          <Text style={styles.startButtonText}>
            {isStrengthHabit ? 'LET\'S BUILD STRENGTH!' : 'Begin Your Morning Journey'}
          </Text>
          <Text style={styles.startButtonSubtext}>
            {isStrengthHabit ? 'Ready to feel powerful?' : 'Ready to feel amazing?'}
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderActiveSession = () => {
    const currentStep = habit?.steps?.[currentStepIndex];
    const totalSteps = habit?.steps?.length || 0;
    const progress = ((currentStepIndex) / totalSteps) * 100;

    return (
      <ScrollView 
        style={styles.sessionContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sessionContent}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStepIndex}/{totalSteps} {isStrengthHabit ? 'reps' : 'stretches'}
          </Text>
        </View>

        {/* Enhanced Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={styles.timerOuterRing}>
            <View style={styles.timerInnerRing}>
              <View style={styles.timerCore}>
                <Text style={styles.timerText}>{formatTime(stepTimeRemaining)}</Text>
                <Text style={styles.timerLabel}>remaining</Text>
                <View style={styles.breathingIndicator}>
                  <Text style={styles.breathingText}>
                    {isStrengthHabit ? 'power' : 'breathe'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Current Step Header */}
        <View style={styles.stepHeaderCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepIconContainer}>
              <Text style={styles.stepIcon}>{isStrengthHabit ? '🏋️‍♂️' : '🧘‍♀️'}</Text>
            </View>
            <View style={styles.stepTitleContainer}>
              <Text style={styles.stepTitle}>{currentStep?.title}</Text>
              <Text style={styles.stepDescription}>{currentStep?.description}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Instructions */}
        <DynamicInstructions
          instructions={currentStep?.instructions || []}
          stepDuration={habit?.steps?.[currentStepIndex]?.duration || 30}
          stepTimeRemaining={stepTimeRemaining}
          isActive={isStarted && !isPaused}
          isPaused={isPaused}
          onInstructionChange={(index, instruction) => {
            // Could trigger additional voice guidance here if needed
            console.log(`Instruction ${index + 1}: ${instruction}`);
          }}
        />

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

        {/* Audio Quick Controls */}
        <View style={styles.audioQuickControls}>
          <TouchableOpacity 
            style={[styles.audioQuickButton, !musicEnabled && styles.audioQuickButtonMuted]}
            onPress={async () => {
              setMusicEnabled(!musicEnabled);
              await audioManager.toggleMusic();
            }}
          >
            <Text style={styles.audioQuickButtonText}>{musicEnabled ? '🎵' : '🔇'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.audioQuickButton}
            onPress={handleMusicSwitch}
          >
            <Text style={styles.audioQuickButtonText}>
              {getMusicDisplayInfo()?.icon || '🎶'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
        <Text style={styles.headerTitle}>
          {isStrengthHabit ? 'Strength Training' : 'Morning Stretch'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {!isStarted ? renderPreSession() : renderActiveSession()}
      
      {/* Achievement Overlay */}
      <AchievementBurst
        show={showAchievement}
        achievement={currentAchievement || {
          title: '',
          description: '',
          icon: '',
          color: theme.colors.primary.blue,
        }}
        onComplete={() => {
          setShowAchievement(false);
          setCurrentAchievement(null);
        }}
      />
      
      {/* Music Selection Modal */}
      <MusicSelectionModal
        visible={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        onMusicSelected={handleMusicSelection}
        habitName={habit?.name}
        currentTrackId={selectedMusicId}
        showRecommendations={true}
      />
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
    paddingBottom: theme.spacing.xxl,
  },
  // New Duolingo-inspired styles
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  habitIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  habitIcon: {
    fontSize: 28,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary.green,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  instructionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  instructionBulletText: {
    color: theme.colors.text.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  startButtonContent: {
    alignItems: 'center',
  },
  startButtonEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  startButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
  streakContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  streakIcon: {
    fontSize: 18,
    marginRight: theme.spacing.xs,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.inverse,
    marginRight: theme.spacing.xs,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
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
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.secondary.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  startButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sessionContainer: {
    flex: 1,
  },
  sessionContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  progressContainer: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary.orange,
    borderRadius: 4,
    shadowColor: theme.colors.secondary.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  progressText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timerOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  timerInnerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.secondary.orange,
  },
  timerCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingIndicator: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
  },
  breathingText: {
    fontSize: 10,
    color: theme.colors.primary.green,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerText: {
    color: theme.colors.primary.green,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  timerLabel: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  stepHeaderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  stepIcon: {
    fontSize: 24,
  },
  stepTitleContainer: {
    flex: 1,
    paddingTop: theme.spacing.xs,
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
  // Audio Settings Styles
  audioSettingsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  audioToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  audioToggleLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    flex: 1,
  },
  audioToggle: {
    backgroundColor: theme.colors.neutral.mediumGray,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  audioToggleActive: {
    backgroundColor: theme.colors.primary.green,
  },
  audioToggleText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  audioToggleTextActive: {
    color: theme.colors.text.inverse,
  },
  // Audio Quick Controls
  audioQuickControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  audioQuickButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioQuickButtonMuted: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.6,
  },
  audioQuickButtonText: {
    fontSize: 20,
  },


  // Music Selection Styles
  musicSelectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  musicSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  musicSelectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  changeMusicButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary.blue,
    borderRadius: theme.borderRadius.sm,
  },
  changeMusicButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  selectedMusicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  selectedMusicIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  selectedMusicInfo: {
    flex: 1,
  },
  selectedMusicName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  selectedMusicDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  selectedMusicArrow: {
    fontSize: 20,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
});