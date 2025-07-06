import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduledTask } from '../types';
import { reminderStorage } from './reminderStorage';
import { HabitReminder } from './notificationService';

const SCHEDULED_TASKS_STORAGE_KEY = '@lifespark_scheduled_tasks';

class ScheduleService {
  
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    try {
      const stored = await AsyncStorage.getItem(SCHEDULED_TASKS_STORAGE_KEY);
      if (stored) {
        const tasks = JSON.parse(stored);
        // Convert date strings back to Date objects
        return tasks.map((task: any) => ({
          ...task,
          scheduledDateTime: new Date(task.scheduledDateTime),
          created_at: new Date(task.created_at),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting scheduled tasks:', error);
      return [];
    }
  }

  async saveScheduledTask(task: ScheduledTask): Promise<void> {
    try {
      const existingTasks = await this.getScheduledTasks();
      
      // Remove existing task with same ID if any
      const filteredTasks = existingTasks.filter(t => t.id !== task.id);
      
      // Add new task
      const updatedTasks = [...filteredTasks, task];
      
      await AsyncStorage.setItem(SCHEDULED_TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      console.log(`💾 Saved scheduled task: ${task.title}`);
    } catch (error) {
      console.error('Error saving scheduled task:', error);
    }
  }

  async deleteScheduledTask(taskId: string): Promise<void> {
    try {
      const existingTasks = await this.getScheduledTasks();
      const filteredTasks = existingTasks.filter(t => t.id !== taskId);
      
      await AsyncStorage.setItem(SCHEDULED_TASKS_STORAGE_KEY, JSON.stringify(filteredTasks));
      console.log(`🗑️ Deleted scheduled task: ${taskId}`);
    } catch (error) {
      console.error('Error deleting scheduled task:', error);
    }
  }

  async toggleTaskCompletion(taskId: string): Promise<boolean> {
    try {
      const tasks = await this.getScheduledTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex].isCompleted = !tasks[taskIndex].isCompleted;
        await AsyncStorage.setItem(SCHEDULED_TASKS_STORAGE_KEY, JSON.stringify(tasks));
        
        console.log(`✅ Toggled task completion: ${tasks[taskIndex].title} - ${tasks[taskIndex].isCompleted ? 'completed' : 'incomplete'}`);
        return tasks[taskIndex].isCompleted;
      }
      
      return false;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return false;
    }
  }

  // Convert habit reminder to scheduled task
  createScheduledTaskFromReminder(reminder: HabitReminder): ScheduledTask {
    const taskId = `reminder-${reminder.habitId}`;
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const now = new Date();
    
    if (reminder.reminderType === 'daily') {
      // For daily reminders, create task for today (or tomorrow if time passed)
      const scheduledTime = new Date();
      scheduledTime.setHours(hours);
      scheduledTime.setMinutes(minutes);
      scheduledTime.setSeconds(0);
      scheduledTime.setMilliseconds(0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      return {
        id: taskId,
        title: reminder.habitName,
        description: `Daily habit reminder at ${this.formatTime(reminder.time)}`,
        scheduledDateTime: scheduledTime,
        isCompleted: false,
        type: 'habit',
        habitId: reminder.habitId,
        reminder: true,
        created_at: new Date(),
      };
    } else if (reminder.reminderType === 'weekly' && reminder.dayOfWeek !== undefined) {
      // For weekly reminders, create task for next occurrence of the specified day
      const scheduledTime = new Date();
      scheduledTime.setHours(hours);
      scheduledTime.setMinutes(minutes);
      scheduledTime.setSeconds(0);
      scheduledTime.setMilliseconds(0);
      
      const currentDay = now.getDay();
      let daysUntilTarget = reminder.dayOfWeek - currentDay;
      
      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && scheduledTime <= now)) {
        daysUntilTarget += 7;
      }
      
      scheduledTime.setDate(now.getDate() + daysUntilTarget);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      return {
        id: taskId,
        title: reminder.habitName,
        description: `Weekly habit reminder (${dayNames[reminder.dayOfWeek]}) at ${this.formatTime(reminder.time)}`,
        scheduledDateTime: scheduledTime,
        isCompleted: false,
        type: 'habit',
        habitId: reminder.habitId,
        reminder: true,
        created_at: new Date(),
      };
    } else if (reminder.reminderType === 'monthly' && reminder.dayOfMonth !== undefined) {
      // For monthly reminders, create task for next occurrence of the specified day
      const scheduledTime = new Date();
      scheduledTime.setHours(hours);
      scheduledTime.setMinutes(minutes);
      scheduledTime.setSeconds(0);
      scheduledTime.setMilliseconds(0);
      scheduledTime.setDate(reminder.dayOfMonth);
      
      if (scheduledTime <= now) {
        scheduledTime.setMonth(scheduledTime.getMonth() + 1);
        // Handle months with fewer days
        if (scheduledTime.getDate() !== reminder.dayOfMonth) {
          scheduledTime.setDate(0); // Last day of previous month
        }
      }
      
      const suffix = reminder.dayOfMonth === 1 ? 'st' : reminder.dayOfMonth === 2 ? 'nd' : reminder.dayOfMonth === 3 ? 'rd' : 'th';
      
      return {
        id: taskId,
        title: reminder.habitName,
        description: `Monthly habit reminder (${reminder.dayOfMonth}${suffix}) at ${this.formatTime(reminder.time)}`,
        scheduledDateTime: scheduledTime,
        isCompleted: false,
        type: 'habit',
        habitId: reminder.habitId,
        reminder: true,
        created_at: new Date(),
      };
    } else {
      // For one-time reminders, use the specific date
      if (!reminder.specificDate) {
        throw new Error('Specific date required for one-time reminder');
      }
      
      const [year, month, day] = reminder.specificDate.split('-').map(Number);
      
      const scheduledDateTime = new Date();
      scheduledDateTime.setFullYear(year);
      scheduledDateTime.setMonth(month - 1);
      scheduledDateTime.setDate(day);
      scheduledDateTime.setHours(hours);
      scheduledDateTime.setMinutes(minutes);
      scheduledDateTime.setSeconds(0);
      scheduledDateTime.setMilliseconds(0);
      
      return {
        id: taskId + `-${reminder.specificDate}`,
        title: reminder.habitName,
        description: `Scheduled habit reminder for ${new Date(scheduledDateTime).toLocaleDateString()}`,
        scheduledDateTime,
        isCompleted: false,
        type: 'habit',
        habitId: reminder.habitId,
        reminder: true,
        created_at: new Date(),
      };
    }
  }

  // Sync all habit reminders to scheduled tasks
  async syncRemindersToSchedule(): Promise<void> {
    try {
      const allReminders = await reminderStorage.getAllReminders();
      const enabledReminders = allReminders.filter(r => r.enabled);
      
      // Get existing schedule tasks
      const existingTasks = await this.getScheduledTasks();
      
      // Remove old reminder-based tasks
      const nonReminderTasks = existingTasks.filter(task => !task.reminder);
      
      // Create new tasks from current reminders
      const reminderTasks: ScheduledTask[] = [];
      
      for (const reminder of enabledReminders) {
        try {
          const task = this.createScheduledTaskFromReminder(reminder);
          reminderTasks.push(task);
        } catch (error) {
          console.error(`Error creating task for reminder ${reminder.habitId}:`, error);
        }
      }
      
      // Combine and save
      const allTasks = [...nonReminderTasks, ...reminderTasks];
      await AsyncStorage.setItem(SCHEDULED_TASKS_STORAGE_KEY, JSON.stringify(allTasks));
      
      console.log(`🔄 Synced ${reminderTasks.length} reminders to schedule`);
    } catch (error) {
      console.error('Error syncing reminders to schedule:', error);
    }
  }

  // Get tasks for a specific date
  async getTasksForDate(date: Date): Promise<ScheduledTask[]> {
    const allTasks = await this.getScheduledTasks();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return allTasks.filter(task => {
      const taskDate = new Date(task.scheduledDateTime);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === targetDate.getTime();
    });
  }

  // Get tasks for a date range (for week view)
  async getTasksForDateRange(startDate: Date, endDate: Date): Promise<ScheduledTask[]> {
    const allTasks = await this.getScheduledTasks();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return allTasks.filter(task => {
      const taskTime = task.scheduledDateTime.getTime();
      return taskTime >= start.getTime() && taskTime <= end.getTime();
    });
  }

  // Create a custom scheduled task (not from reminder)
  async createCustomTask(
    title: string,
    description: string,
    scheduledDateTime: Date,
    type: 'custom' | 'event' = 'custom'
  ): Promise<ScheduledTask> {
    const task: ScheduledTask = {
      id: `custom-${Date.now()}`,
      title,
      description,
      scheduledDateTime,
      isCompleted: false,
      type,
      reminder: false,
      created_at: new Date(),
    };
    
    await this.saveScheduledTask(task);
    return task;
  }

  // Helper methods
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Get completion stats for a date range
  async getCompletionStats(startDate: Date, endDate: Date): Promise<{
    total: number;
    completed: number;
    percentage: number;
  }> {
    const tasks = await this.getTasksForDateRange(startDate, endDate);
    const completed = tasks.filter(task => task.isCompleted).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }
}

export const scheduleService = new ScheduleService();