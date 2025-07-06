import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type ReminderType = 'daily' | 'weekly' | 'monthly' | 'once';

export interface HabitReminder {
  habitId: string;
  habitName: string;
  time: string; // HH:MM format (24-hour)
  enabled: boolean;
  reminderType: ReminderType;
  // For weekly reminders (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  dayOfWeek?: number;
  // For monthly reminders (1-31)
  dayOfMonth?: number;
  // For one-time reminders
  specificDate?: string; // YYYY-MM-DD format
}

class NotificationService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.warn('Notifications only work on physical devices');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      this.isInitialized = true;
      console.log('🔔 Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleHabitReminder(reminder: HabitReminder): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      if (!reminder.enabled) return null;

      // Parse time (HH:MM format)
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      // Calculate scheduled time based on reminder type
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours);
      scheduledTime.setMinutes(minutes);
      scheduledTime.setSeconds(0);
      scheduledTime.setMilliseconds(0);
      
      switch (reminder.reminderType) {
        case 'daily':
          // If the time has already passed today, schedule for tomorrow
          if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
          }
          break;
          
        case 'weekly':
          if (reminder.dayOfWeek === undefined) {
            throw new Error('Day of week required for weekly reminder');
          }
          
          // Find next occurrence of the specified day
          const currentDay = now.getDay();
          let daysUntilTarget = reminder.dayOfWeek - currentDay;
          
          // If target day is today but time has passed, or target day is in the past
          if (daysUntilTarget < 0 || (daysUntilTarget === 0 && scheduledTime <= now)) {
            daysUntilTarget += 7; // Next week
          }
          
          scheduledTime.setDate(now.getDate() + daysUntilTarget);
          break;
          
        case 'monthly':
          if (reminder.dayOfMonth === undefined) {
            throw new Error('Day of month required for monthly reminder');
          }
          
          // Set to the specified day of current month
          scheduledTime.setDate(reminder.dayOfMonth);
          
          // If date has passed this month, schedule for next month
          if (scheduledTime <= now) {
            scheduledTime.setMonth(scheduledTime.getMonth() + 1);
            // Handle months with fewer days (e.g., Feb 30 -> Feb 28/29)
            if (scheduledTime.getDate() !== reminder.dayOfMonth) {
              // Move to last day of month if target day doesn't exist
              scheduledTime.setDate(0); // Last day of previous month (which is current month)
            }
          }
          break;
          
        case 'once':
          if (!reminder.specificDate) {
            throw new Error('Specific date required for one-time reminder');
          }
          
          const [year, month, day] = reminder.specificDate.split('-').map(Number);
          scheduledTime.setFullYear(year);
          scheduledTime.setMonth(month - 1); // Month is 0-indexed
          scheduledTime.setDate(day);
          
          // Check if the scheduled time is in the past
          if (scheduledTime <= now) {
            throw new Error('Cannot schedule reminder for past date/time');
          }
          break;
          
        default:
          throw new Error(`Unsupported reminder type: ${reminder.reminderType}`);
      }
      
      // Create trigger for daily notification using TimeInterval (works on both platforms)
      const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.floor((scheduledTime.getTime() - now.getTime()) / 1000),
        repeats: false, // We'll reschedule manually for simplicity in Phase 1
      };

      // Generate appropriate notification body based on reminder type
      const getNotificationBody = (type: ReminderType): string => {
        switch (type) {
          case 'daily':
            return 'Daily reminder: Ready to build your streak? Let\'s do this!';
          case 'weekly':
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[reminder.dayOfWeek!];
            return `Weekly ${dayName} reminder: Time to focus on your goals!`;
          case 'monthly':
            return `Monthly reminder: Keep up the momentum!`;
          case 'once':
            return 'Scheduled reminder: Time to focus on your goals!';
          default:
            return 'Time to focus on your goals!';
        }
      };

      // Schedule notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${reminder.habitName}! 💪`,
          body: getNotificationBody(reminder.reminderType),
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      console.log(`🔔 Scheduled reminder for ${reminder.habitName} at ${reminder.time} (next occurrence: ${scheduledTime.toLocaleString()})`);
      
      // Note: For Phase 1, this schedules only the next occurrence
      // Phase 2+ will add proper daily recurring reminders
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelHabitReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('🔕 Cancelled reminder notification');
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🔕 Cancelled all reminder notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();