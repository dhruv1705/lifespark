import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ScheduledTask } from '../types';

interface TaskCardProps {
  task: ScheduledTask;
  onToggleComplete: () => void;
  onPress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onPress,
}) => {
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, task.isCompleted && styles.completedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, task.isCompleted && styles.completedTitle]}>
            {task.title}
          </Text>
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={onToggleComplete}
          >
            <Ionicons 
              name={task.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={task.isCompleted ? theme.colors.primary.green : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        
        {task.description && task.description !== task.title && (
          <Text style={[styles.description, task.isCompleted && styles.completedText]}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.timeInfo}>
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={theme.colors.primary.blue} 
            />
            <Text style={styles.dateText}>
              {formatDate(task.scheduledDateTime)}
            </Text>
          </View>
          
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={theme.colors.primary.blue} 
            />
            <Text style={styles.timeText}>
              {formatTime(task.scheduledDateTime)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  completedContainer: {
    backgroundColor: theme.colors.primary.green + '10',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.text.secondary,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  checkButton: {
    padding: theme.spacing.xs,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary.blue,
  },
  timeText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary.blue,
  },
});