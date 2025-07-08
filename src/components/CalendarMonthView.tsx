import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';
import { ScheduledTask } from '../types';

interface CalendarMonthViewProps {
  selectedDate: Date;
  tasks: ScheduledTask[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const { width } = Dimensions.get('window');
const dayWidth = (width - theme.spacing.lg * 2 - theme.spacing.md * 2) / 7;

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  selectedDate,
  tasks,
  onDateSelect,
  onMonthChange,
}) => {
  // Get all days in the month grid (6 weeks)
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday start
    startDate.setDate(firstDay.getDate() + diff);
    
    // Generate 42 days (6 weeks)
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push({
        date: day,
        isCurrentMonth: day.getMonth() === month,
        isToday: day.toDateString() === new Date().toDateString(),
        isSelected: day.toDateString() === selectedDate.toDateString(),
      });
    }
    
    return days;
  };

  // Get tasks for a specific date
  const getDateTasks = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDateTime);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get reminder tasks for a specific date
  const getDateReminders = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDateTime);
      return taskDate.toDateString() === date.toDateString() && task.reminder;
    });
  };

  // Get completed tasks for a specific date
  const getDateCompletedTasks = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDateTime);
      return taskDate.toDateString() === date.toDateString() && task.isCompleted;
    });
  };

  const monthDays = getMonthDays(selectedDate);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Format month/year for header
  const monthName = selectedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => onMonthChange('prev')}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{monthName}</Text>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => onMonthChange('next')}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day Labels */}
      <View style={styles.dayLabelsRow}>
        {dayLabels.map((label, index) => (
          <View key={index} style={styles.dayLabelCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {monthDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((dayInfo, dayIndex) => {
              const dateTasks = getDateTasks(dayInfo.date);
              const dateReminders = getDateReminders(dayInfo.date);
              const completedTasks = getDateCompletedTasks(dayInfo.date);
              const taskCount = dateTasks.length;
              const reminderCount = dateReminders.length;
              const completedCount = completedTasks.length;
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    !dayInfo.isCurrentMonth && styles.dayCellOtherMonth,
                    dayInfo.isSelected && styles.dayCellSelected,
                    dayInfo.isToday && styles.dayCellToday,
                  ]}
                  onPress={() => onDateSelect(dayInfo.date)}
                  disabled={!dayInfo.isCurrentMonth}
                >
                  <Text style={[
                    styles.dayNumber,
                    !dayInfo.isCurrentMonth && styles.dayNumberOtherMonth,
                    dayInfo.isSelected && styles.dayNumberSelected,
                    dayInfo.isToday && styles.dayNumberToday,
                  ]}>
                    {dayInfo.date.getDate()}
                  </Text>
                  
                  {/* Task Indicators */}
                  {taskCount > 0 && (
                    <View style={styles.indicatorsContainer}>
                      {/* Main task indicator */}
                      <View style={[
                        styles.taskDot,
                        reminderCount > 0 && styles.reminderDot,
                        completedCount === taskCount && styles.completedDot
                      ]}>
                        {taskCount > 1 && (
                          <Text style={styles.taskCount}>{taskCount}</Text>
                        )}
                      </View>
                      
                      {/* Reminder indicator */}
                      {reminderCount > 0 && taskCount !== reminderCount && (
                        <View style={styles.secondaryReminderDot} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.green + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary.green,
  },
  monthTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  dayLabelCell: {
    width: dayWidth,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  dayLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  calendarGrid: {
    paddingVertical: 2,
  },
  weekRow: {
    flexDirection: 'row',
    marginHorizontal: 2,
  },
  dayCell: {
    width: dayWidth,
    height: dayWidth * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    position: 'relative',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.primary.blue,
  },
  dayCellToday: {
    backgroundColor: theme.colors.secondary.orange + '20',
    borderWidth: 2,
    borderColor: theme.colors.secondary.orange,
  },
  dayNumber: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  dayNumberOtherMonth: {
    color: theme.colors.text.secondary,
  },
  dayNumberSelected: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.bold,
  },
  dayNumberToday: {
    color: theme.colors.secondary.orange,
    fontWeight: theme.typography.weights.bold,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderDot: {
    backgroundColor: theme.colors.secondary.orange,
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  completedDot: {
    backgroundColor: theme.colors.success,
  },
  secondaryReminderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary.orange,
    marginLeft: 2,
  },
  taskCount: {
    fontSize: 6,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
});