import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Habit, RootStackParamList } from '../types';
import { theme } from '../theme';
import { getInteractiveHabitData } from '../data/interactiveHabits';
import { ReminderSetupModal } from './ReminderSetupModal';
import { reminderStorage } from '../services/reminderStorage';
import { HabitReminder } from '../services/notificationService';
import { hasVideo, getVideoConfig } from '../data/videoHelper';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  // Check if this is an interactive habit
  const enhancedHabit = getInteractiveHabitData(habit.id, habit);
  const isInteractive = enhancedHabit.executionType === 'guided' || enhancedHabit.executionType === 'timed';
  
  // Check if habit has video
  const hasVideoContent = hasVideo(habit.name);
  const videoConfig = getVideoConfig(habit.name);
  
  // Reminder state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<HabitReminder | null>(null);

  // Load existing reminder
  useEffect(() => {
    loadReminder();
  }, [habit.id]);

  const loadReminder = async () => {
    try {
      const reminder = await reminderStorage.getReminder(habit.id);
      setCurrentReminder(reminder);
    } catch (error) {
      console.error('Error loading reminder:', error);
    }
  };
  
  const handlePress = () => {
    if (hasVideoContent && videoConfig) {
      // Navigate to video player with habit data for XP integration
      navigation.navigate('VideoPlayer', {
        videoUrl: videoConfig.videoUrl,
        title: videoConfig.title || habit.name,
        habitId: habit.id,
        habitXp: habit.xp
      });
    } else {
      // For habits without videos, just toggle completion
      onToggle();
    }
  };

  const handleAlarmPress = (e: any) => {
    e.stopPropagation(); // Prevent triggering habit press
    setShowReminderModal(true);
  };

  const handleVideoPress = (e: any) => {
    e.stopPropagation(); // Prevent triggering habit press
    if (videoConfig) {
      navigation.navigate('VideoPlayer', {
        videoUrl: videoConfig.videoUrl,
        title: videoConfig.title || habit.name,
      });
    }
  };

  const handleReminderSaved = (reminder: HabitReminder) => {
    setCurrentReminder(reminder);
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Foundation';
      case 2: return 'Building';
      case 3: return 'Power';
      case 4: return 'Mastery';
      default: return 'Level ' + level;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return theme.colors.levels.foundation;
      case 2: return theme.colors.levels.building;
      case 3: return theme.colors.levels.power;
      case 4: return theme.colors.levels.mastery;
      default: return theme.colors.neutral.mediumGray;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        habit.completed && styles.completedCard,
        isInteractive && styles.interactiveCard
      ]} 
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{habit.name}</Text>
            <TouchableOpacity 
              style={styles.alarmButton} 
              onPress={handleAlarmPress}
            >
              <Text style={styles.alarmIcon}>
                ⏰
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(habit.level) }]}>
              <Text style={styles.levelText}>{getLevelLabel(habit.level)}</Text>
            </View>
            <Text style={styles.reminderTime}>
              {currentReminder?.enabled ? (() => {
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const formattedTime = reminderStorage.formatTimeForDisplay(currentReminder.time);
                
                switch (currentReminder.reminderType) {
                  case 'daily':
                    return `Daily ${formattedTime}`;
                  case 'weekly':
                    return `${dayNames[currentReminder.dayOfWeek!]} ${formattedTime}`;
                  case 'monthly':
                    const suffix = currentReminder.dayOfMonth === 1 ? 'st' : currentReminder.dayOfMonth === 2 ? 'nd' : currentReminder.dayOfMonth === 3 ? 'rd' : 'th';
                    return `Monthly ${currentReminder.dayOfMonth}${suffix} ${formattedTime}`;
                  case 'once':
                    return currentReminder.specificDate 
                      ? `${new Date(currentReminder.specificDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${formattedTime}`
                      : formattedTime;
                  default:
                    return formattedTime;
                }
              })() : 'One time'}
            </Text>
          </View>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.xp}>+{habit.xp} XP</Text>
          <View style={styles.actionButtons}>
            <View style={[styles.checkbox, habit.completed && styles.checkedBox]}>
              {habit.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.description}>{habit.description}</Text>
      
      {/* Reminder Setup Modal */}
      <ReminderSetupModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        habitId={habit.id}
        habitName={habit.name}
        onReminderSaved={handleReminderSaved}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
  },
  completedCard: {
    borderLeftColor: theme.colors.success,
    backgroundColor: '#f8fff8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftHeader: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rightHeader: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  alarmButton: {
    padding: 4,
    marginLeft: theme.spacing.sm,
  },
  alarmIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  reminderTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary.green,
    fontWeight: theme.typography.weights.bold,
  },
  levelBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.bold,
  },
  xp: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
    marginBottom: theme.spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkmark: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  interactiveCard: {
    borderLeftColor: theme.colors.primary.green,
    backgroundColor: '#f8fff8',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});