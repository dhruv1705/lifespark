import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitReminder } from './notificationService';

const REMINDERS_STORAGE_KEY = '@lifespark_habit_reminders';

interface StoredReminder extends HabitReminder {
  notificationId?: string; // Store the expo notification ID
}

class ReminderStorage {
  
  async saveReminder(reminder: HabitReminder, notificationId?: string): Promise<void> {
    try {
      const existingReminders = await this.getAllReminders();
      
      // Remove existing reminder for this habit if any
      const filteredReminders = existingReminders.filter(r => r.habitId !== reminder.habitId);
      
      // Add new reminder
      const reminderToStore: StoredReminder = {
        ...reminder,
        notificationId,
      };
      
      const updatedReminders = [...filteredReminders, reminderToStore];
      
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
      console.log(`💾 Saved reminder for habit ${reminder.habitId}`);
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  }

  async getReminder(habitId: string): Promise<StoredReminder | null> {
    try {
      const reminders = await this.getAllReminders();
      return reminders.find(r => r.habitId === habitId) || null;
    } catch (error) {
      console.error('Error getting reminder:', error);
      return null;
    }
  }

  async getAllReminders(): Promise<StoredReminder[]> {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        const reminders = JSON.parse(stored);
        // Migrate old format reminders to new format
        return reminders.map((reminder: any) => this.migrateReminderFormat(reminder));
      }
      return [];
    } catch (error) {
      console.error('Error getting all reminders:', error);
      return [];
    }
  }

  // Migrate old reminder format to new format
  private migrateReminderFormat(reminder: any): StoredReminder {
    // If already new format, return as is
    if (reminder.reminderType) {
      return reminder;
    }

    // Convert old format to new format
    const migrated: StoredReminder = {
      ...reminder,
      reminderType: reminder.isRecurring ? 'daily' : 'once' as any,
    };

    // Remove old properties
    delete (migrated as any).isRecurring;

    return migrated;
  }

  async deleteReminder(habitId: string): Promise<void> {
    try {
      const existingReminders = await this.getAllReminders();
      const filteredReminders = existingReminders.filter(r => r.habitId !== habitId);
      
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filteredReminders));
      console.log(`🗑️ Deleted reminder for habit ${habitId}`);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  }

  async clearAllReminders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REMINDERS_STORAGE_KEY);
      console.log('🗑️ Cleared all reminders');
    } catch (error) {
      console.error('Error clearing reminders:', error);
    }
  }

  // Get current time in HH:MM format
  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Format time for display (12-hour format)
  formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Check if a reminder is past due (for one-time reminders)
  isReminderPastDue(reminder: StoredReminder): boolean {
    if (reminder.reminderType !== 'once') return false; // Only one-time reminders can be past due
    
    if (!reminder.specificDate) return false;
    
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const [year, month, day] = reminder.specificDate.split('-').map(Number);
    
    const reminderDateTime = new Date();
    reminderDateTime.setFullYear(year);
    reminderDateTime.setMonth(month - 1);
    reminderDateTime.setDate(day);
    reminderDateTime.setHours(hours);
    reminderDateTime.setMinutes(minutes);
    reminderDateTime.setSeconds(0);
    reminderDateTime.setMilliseconds(0);
    
    return reminderDateTime <= now;
  }
}

export const reminderStorage = new ReminderStorage();