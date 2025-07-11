import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { ScheduleViewType, ScheduledTask } from '../types';
import { CalendarWeekView } from '../components/CalendarWeekView';
import { CalendarDayView } from '../components/CalendarDayView';
import { CalendarMonthView } from '../components/CalendarMonthView';
import { ScheduleSummaryCards } from '../components/ScheduleSummaryCards';
import { TaskCard } from '../components/TaskCard';
import { AddScheduleModal } from '../components/AddScheduleModal';
import { scheduleService } from '../services/scheduleService';

const { width } = Dimensions.get('window');
const DEMO_TASKS: ScheduledTask[] = [
  {
    id: '1',
    title: 'go for a walk',
    description: 'go for a walk',
    scheduledDateTime: new Date(2025, 6, 6, 21, 5), // Jul 6, 2025 at 21:05
    isCompleted: false,
    type: 'custom',
    created_at: new Date(),
  },
];

export const ScheduleScreen: React.FC = () => {
  const [viewType, setViewType] = useState<ScheduleViewType>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSync = useCallback(async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    return new Promise<void>((resolve) => {
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await scheduleService.syncRemindersToSchedule();
          resolve();
        } catch (error) {
          console.error('Error syncing reminders:', error);
          resolve();
        }
      }, 300); 
    });
  }, []);

  const loadTasks = useCallback(async (shouldSync: boolean = false) => {
    try {
      setLoading(true);
      if (shouldSync) {
        await debouncedSync();
      }
      
      let tasksToShow: ScheduledTask[] = [];
      
      if (viewType === 'day') {
        tasksToShow = await scheduleService.getTasksForDate(selectedDate);
      } else if (viewType === 'week') {
        const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
        tasksToShow = await scheduleService.getTasksForDateRange(startOfWeek, endOfWeek);
      } else {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        tasksToShow = await scheduleService.getTasksForDateRange(startOfMonth, endOfMonth);
      }
      
      setTasks(tasksToShow);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks(DEMO_TASKS);
    } finally {
      setLoading(false);
    }
  }, [viewType, selectedDate, debouncedSync]);

  useEffect(() => {
    loadTasks(false);
  }, [loadTasks]);

  useFocusEffect(
    useCallback(() => {
      loadTasks(true);
    }, [loadTasks])
  );

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await loadTasks(true); 
    } catch (error) {
      console.error('Error refreshing schedule:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { startOfWeek, endOfWeek };
  };

  const formatWeekRange = (startDate: Date, endDate: Date) => {
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewType === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewType === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getTaskStats = () => {
    if (viewType === 'week') {
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.scheduledDateTime);
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      });
      return {
        total: weekTasks.length,
        completed: weekTasks.filter(task => task.isCompleted).length,
        label: 'Weekly Tasks'
      };
    } else if (viewType === 'day') {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.scheduledDateTime);
        return taskDate.toDateString() === selectedDate.toDateString();
      });
      return {
        total: dayTasks.length,
        completed: dayTasks.filter(task => task.isCompleted).length,
        label: 'Total Tasks'
      };
    }
    return { total: 0, completed: 0, label: 'Tasks' };
  };

  const getVisibleTasks = () => {
    if (viewType === 'week') {
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
      return tasks.filter(task => {
        const taskDate = new Date(task.scheduledDateTime);
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      });
    } else if (viewType === 'day') {
      return tasks.filter(task => {
        const taskDate = new Date(task.scheduledDateTime);
        return taskDate.toDateString() === selectedDate.toDateString();
      });
    }
    return tasks;
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      // Update in storage
      const newCompletionStatus = await scheduleService.toggleTaskCompletion(taskId);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isCompleted: newCompletionStatus } : task
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleTaskAdded = async (newTask: ScheduledTask) => {
    setTasks(prev => [...prev, newTask]);

    try {
      await loadTasks(false);
    } catch (error) {
      console.error('Error reloading tasks after addition:', error);
    }
  };

  const stats = getTaskStats();
  const visibleTasks = getVisibleTasks();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* View Type Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewType === 'day' && styles.toggleButtonActive]}
            onPress={() => setViewType('day')}
          >
            <Text style={[styles.toggleText, viewType === 'day' && styles.toggleTextActive]}>
              Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewType === 'week' && styles.toggleButtonActive]}
            onPress={() => setViewType('week')}
          >
            <Text style={[styles.toggleText, viewType === 'week' && styles.toggleTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewType === 'month' && styles.toggleButtonActive]}
            onPress={() => setViewType('month')}
          >
            <Text style={[styles.toggleText, viewType === 'month' && styles.toggleTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('prev')}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.dateRange}>
            {viewType === 'week' ? (
              (() => {
                const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
                return formatWeekRange(startOfWeek, endOfWeek);
              })()
            ) : viewType === 'day' ? (
              formatDayDate(selectedDate)
            ) : (
              selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            )}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('next')}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar View */}
        {viewType === 'week' && (
          <CalendarWeekView 
            selectedDate={selectedDate}
            tasks={tasks}
          />
        )}
        
        {viewType === 'day' && (
          <CalendarDayView 
            selectedDate={selectedDate}
            tasks={visibleTasks}
          />
        )}
        
        {viewType === 'month' && (
          <CalendarMonthView 
            selectedDate={selectedDate}
            tasks={tasks}
            onDateSelect={setSelectedDate}
            onMonthChange={navigateWeek}
          />
        )}

        {/* Summary Cards */}
        <ScheduleSummaryCards 
          totalTasks={stats.total}
          completedTasks={stats.completed}
          label={stats.label}
        />

        {/* Task List */}
        <View style={styles.taskList}>
          {visibleTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={() => toggleTaskCompletion(task.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskAdded={handleTaskAdded}
        selectedDate={selectedDate}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  refreshButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.secondary.orange,
  },
  toggleText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: theme.typography.weights.bold,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  dateRange: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  taskList: {
    marginTop: theme.spacing.lg,
    paddingBottom: 100, 
  },
  floatingButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl + 80, 
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
});