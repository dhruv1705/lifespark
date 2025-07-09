import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';
import { ScheduledTask } from '../types';

interface CalendarDayViewProps {
  selectedDate: Date;
  tasks: ScheduledTask[];
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  selectedDate,
  tasks,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      <View style={styles.dayCard}>
        <Text style={styles.dayLabel}>
          {isToday ? 'Today' : 'Selected Day'}
        </Text>
        <Text style={styles.dayDate}>
          {formatDate(selectedDate)}
        </Text>
        <View style={styles.taskSummary}>
          <Text style={styles.taskCount}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} scheduled
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  dayCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  dayDate: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  taskSummary: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary.blue + '20',
    borderRadius: theme.borderRadius.md,
  },
  taskCount: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary.blue,
  },
});