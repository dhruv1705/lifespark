import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';
import { ScheduledTask } from '../types';

interface CalendarWeekViewProps {
  selectedDate: Date;
  tasks: ScheduledTask[];
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  selectedDate,
  tasks,
}) => {
  // Get the week starting from Monday
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const weekDays = getWeekDays(selectedDate);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Check if a day has tasks
  const getDayTaskCount = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDateTime);
      return taskDate.toDateString() === date.toDateString();
    }).length;
  };

  // Check if a day has reminder tasks
  const getDayReminderCount = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDateTime);
      return taskDate.toDateString() === date.toDateString() && task.reminder;
    }).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekGrid}>
        {weekDays.map((day, index) => {
          const taskCount = getDayTaskCount(day);
          const reminderCount = getDayReminderCount(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{dayLabels[index]}</Text>
              <View style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                <Text style={[styles.dayNumberText, isToday && styles.dayNumberTextToday]}>
                  {day.getDate()}
                </Text>
              </View>
              {taskCount > 0 && (
                <View style={[
                  styles.taskIndicator, 
                  reminderCount > 0 && styles.reminderIndicator
                ]}>
                  <Text style={[
                    styles.taskIndicatorText,
                    reminderCount > 0 && styles.reminderIndicatorText
                  ]}>
                    {taskCount}
                  </Text>
                  {reminderCount > 0 && (
                    <Text style={styles.reminderIcon}>⏰</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  weekGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  dayLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  dayNumberToday: {
    backgroundColor: theme.colors.secondary.orange,
  },
  dayNumberText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  dayNumberTextToday: {
    color: 'white',
  },
  taskIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary.green,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  taskIndicatorText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: 'white',
  },
  reminderIndicator: {
    backgroundColor: theme.colors.secondary.orange,
    width: 24,
    height: 20,
    borderRadius: 10,
  },
  reminderIndicatorText: {
    fontSize: 9,
  },
  reminderIcon: {
    fontSize: 8,
    marginLeft: 1,
  },
});