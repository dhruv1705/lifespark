import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataService } from './dataService';

const STREAK_STORAGE_KEY = '@lifespark_user_streaks';
const DAILY_COMPLETION_STORAGE_KEY = '@lifespark_daily_completions';

interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  todayCompletedTasks: string[]; 
}

export class StreakService {
  private static streaks: Map<string, UserStreak> = new Map();

  static async initializeUserStreak(userId: string): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(`${STREAK_STORAGE_KEY}_${userId}`);
      if (storedData) {
        const streakData = JSON.parse(storedData);
        this.streaks.set(userId, streakData);
      } else {
        const newStreak: UserStreak = {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDate: '',
          todayCompletedTasks: [],
        };
        this.streaks.set(userId, newStreak);
        await this.saveUserStreak(userId);
      }
    } catch (error) {
      console.error('Error initializing user streak:', error);
    }
  }

  static async saveUserStreak(userId: string): Promise<void> {
    try {
      const streakData = this.streaks.get(userId);
      if (streakData) {
        await AsyncStorage.setItem(
          `${STREAK_STORAGE_KEY}_${userId}`,
          JSON.stringify(streakData)
        );
      }
    } catch (error) {
      console.error('Error saving user streak:', error);
    }
  }

  static async isFirstTaskOfDay(userId: string): Promise<boolean> {
    try {
      await this.initializeUserStreak(userId);
      const streakData = this.streaks.get(userId);
      const today = new Date().toISOString().split('T')[0];
      
      if (!streakData) return true;
      
      return streakData.todayCompletedTasks.length === 0;
    } catch (error) {
      console.error('Error checking first task of day:', error);
      return true;
    }
  }

  static async recordTaskCompletion(
    userId: string,
    taskId: string
  ): Promise<{ streakDay: number; isFirstTaskOfDay: boolean }> {
    try {
      await this.initializeUserStreak(userId);
      const streakData = this.streaks.get(userId);
      
      if (!streakData) {
        return { streakDay: 1, isFirstTaskOfDay: true };
      }

      const today = new Date().toISOString().split('T')[0];
      const isFirstTaskOfDay = streakData.todayCompletedTasks.length === 0;

      if (!streakData.todayCompletedTasks.includes(taskId)) {
        streakData.todayCompletedTasks.push(taskId);
      }

      if (isFirstTaskOfDay) {
        this.updateStreak(userId);
      }

      const updatedStreak = this.streaks.get(userId);
      const currentStreakDay = updatedStreak?.currentStreak || 1;

      await this.saveUserStreak(userId);

      return {
        streakDay: currentStreakDay,
        isFirstTaskOfDay,
      };
    } catch (error) {
      console.error('Error recording task completion:', error);
      return { streakDay: 1, isFirstTaskOfDay: true };
    }
  }

  private static updateStreak(userId: string): void {
    const streakData = this.streaks.get(userId);
    if (!streakData) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streakData.lastCompletedDate === yesterdayStr) {
      streakData.currentStreak += 1;
    } else if (streakData.lastCompletedDate === today) {
      return;
    } else {
      streakData.currentStreak = 1;
    }

    streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
    streakData.lastCompletedDate = today;
    
    if (streakData.lastCompletedDate !== today) {
      streakData.todayCompletedTasks = [];
    }

    this.streaks.set(userId, streakData);
  }

  static async getCurrentStreak(userId: string): Promise<number> {
    try {
      await this.initializeUserStreak(userId);
      const streakData = this.streaks.get(userId);
      return streakData?.currentStreak || 0;
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  }

  static async getLongestStreak(userId: string): Promise<number> {
    try {
      await this.initializeUserStreak(userId);
      const streakData = this.streaks.get(userId);
      return streakData?.longestStreak || 0;
    } catch (error) {
      console.error('Error getting longest streak:', error);
      return 0;
    }
  }

  static async resetDailyTracking(userId: string): Promise<void> {
    try {
      await this.initializeUserStreak(userId);
      const streakData = this.streaks.get(userId);
      if (streakData) {
        const today = new Date().toISOString().split('T')[0];
        if (streakData.lastCompletedDate !== today) {
          streakData.todayCompletedTasks = [];
          await this.saveUserStreak(userId);
        }
      }
    } catch (error) {
      console.error('Error resetting daily tracking:', error);
    }
  }
} 