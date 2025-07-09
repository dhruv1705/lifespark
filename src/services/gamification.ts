export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'milestone' | 'streak' | 'perfect' | 'speed' | 'consistency' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  progress?: number; // 0-1 for tracking partial completion
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetHabits: string[];
  targetCount: number;
  currentProgress: number;
  xpReward: number;
  expiresAt: string;
  isCompleted: boolean;
}

export interface StreakData {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
}

const ACHIEVEMENTS: Achievement[] = [
  // Milestone Achievements (Common to Legendary)
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first habit',
    emoji: '🌱',
    category: 'milestone',
    rarity: 'common',
    requirement: 1,
    isUnlocked: false,
    xpReward: 5,
  },
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Complete 5 habits total',
    emoji: '🎯',
    category: 'milestone',
    rarity: 'common',
    requirement: 5,
    isUnlocked: false,
    xpReward: 10,
  },
  {
    id: 'habit_builder',
    title: 'Habit Builder',
    description: 'Complete 25 habits total',
    emoji: '🏗️',
    category: 'milestone',
    rarity: 'rare',
    requirement: 25,
    isUnlocked: false,
    xpReward: 25,
  },
  {
    id: 'habit_warrior',
    title: 'Habit Warrior',
    description: 'Complete 100 habits total',
    emoji: '⚔️',
    category: 'milestone',
    rarity: 'epic',
    requirement: 100,
    isUnlocked: false,
    xpReward: 50,
  },
  {
    id: 'habit_legend',
    title: 'Habit Legend',
    description: 'Complete 500 habits total',
    emoji: '👑',
    category: 'milestone',
    rarity: 'legendary',
    requirement: 500,
    isUnlocked: false,
    xpReward: 100,
  },

  // Streak Achievements
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: '3 days in a row',
    emoji: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: 3,
    isUnlocked: false,
    xpReward: 15,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: '7 days in a row',
    emoji: '⚡',
    category: 'streak',
    rarity: 'rare',
    requirement: 7,
    isUnlocked: false,
    xpReward: 30,
  },
  {
    id: 'fortnight_force',
    title: 'Fortnight Force',
    description: '14 days in a row',
    emoji: '🌟',
    category: 'streak',
    rarity: 'epic',
    requirement: 14,
    isUnlocked: false,
    xpReward: 60,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: '30 days in a row',
    emoji: '💎',
    category: 'streak',
    rarity: 'legendary',
    requirement: 30,
    isUnlocked: false,
    xpReward: 120,
  },

  // Perfect Completion Achievements
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'Complete all daily habits in one day',
    emoji: '✨',
    category: 'perfect',
    rarity: 'rare',
    requirement: 1,
    isUnlocked: false,
    xpReward: 20,
  },
  {
    id: 'consistency_master',
    title: 'Consistency Master',
    description: 'Complete 10 perfect days',
    emoji: '🎯',
    category: 'perfect',
    rarity: 'epic',
    requirement: 10,
    isUnlocked: false,
    xpReward: 50,
  },
  {
    id: 'perfection_incarnate',
    title: 'Perfection Incarnate',
    description: 'Complete 30 perfect days',
    emoji: '👼',
    category: 'perfect',
    rarity: 'legendary',
    requirement: 30,
    isUnlocked: false,
    xpReward: 100,
  },

  // Speed Achievements
  {
    id: 'quick_starter',
    title: 'Quick Starter',
    description: 'Complete habits in under 5 minutes',
    emoji: '💨',
    category: 'speed',
    rarity: 'common',
    requirement: 300, // 5 minutes in seconds
    isUnlocked: false,
    xpReward: 15,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete habits in under 3 minutes',
    emoji: '⚡',
    category: 'speed',
    rarity: 'rare',
    requirement: 180, // 3 minutes in seconds
    isUnlocked: false,
    xpReward: 25,
  },
  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Complete habits in under 2 minutes',
    emoji: '🏃‍♂️',
    category: 'speed',
    rarity: 'epic',
    requirement: 120, // 2 minutes in seconds
    isUnlocked: false,
    xpReward: 40,
  },

  // Consistency Achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete morning habits for 7 days',
    emoji: '🐦',
    category: 'consistency',
    rarity: 'rare',
    requirement: 7,
    isUnlocked: false,
    xpReward: 25,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete evening habits for 7 days',
    emoji: '🦉',
    category: 'consistency',
    rarity: 'rare',
    requirement: 7,
    isUnlocked: false,
    xpReward: 25,
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Stay consistent on weekends for 4 weeks',
    emoji: '🛡️',
    category: 'consistency',
    rarity: 'epic',
    requirement: 4,
    isUnlocked: false,
    xpReward: 45,
  },

  // Special Achievements
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Complete your first goal',
    emoji: '🏆',
    category: 'special',
    rarity: 'epic',
    requirement: 1,
    isUnlocked: false,
    xpReward: 75,
  },
  {
    id: 'level_up_legend',
    title: 'Level Up Legend',
    description: 'Reach level 10',
    emoji: '🚀',
    category: 'special',
    rarity: 'legendary',
    requirement: 10,
    isUnlocked: false,
    xpReward: 150,
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Resume habits after a 3+ day break',
    emoji: '💪',
    category: 'special',
    rarity: 'rare',
    requirement: 1,
    isUnlocked: false,
    xpReward: 30,
  },
];

class GamificationService {
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  private streaks: Map<string, StreakData> = new Map();
  private totalCompletions: Map<string, number> = new Map();
  private perfectSessions: Map<string, number> = new Map();

  // Initialize user progress
  initializeUserProgress(userId: string): void {
    // Load from storage or start fresh
    this.loadUserData(userId);
  }

  // Record habit completion and check for achievements
  async recordCompletion(
    userId: string,
    habitId: string,
    isComplete: boolean = true,
    sessionDuration?: number
  ): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    if (isComplete) {
      // Update total completions
      const current = this.totalCompletions.get(habitId) || 0;
      this.totalCompletions.set(habitId, current + 1);

      // Update streak
      this.updateStreak(habitId);

      // Check for milestone achievements
      newAchievements.push(...this.checkMilestoneAchievements(habitId));

      // Check for streak achievements
      newAchievements.push(...this.checkStreakAchievements(habitId));

      // Check for perfect session
      if (isComplete) {
        const perfectCount = this.perfectSessions.get(habitId) || 0;
        this.perfectSessions.set(habitId, perfectCount + 1);
        newAchievements.push(...this.checkPerfectAchievements(habitId));
      }

      // Check for speed achievements
      if (sessionDuration) {
        newAchievements.push(...this.checkSpeedAchievements(habitId, sessionDuration));
      }

      // Mark achievements as unlocked
      newAchievements.forEach(achievement => {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
      });

      // Save progress
      this.saveUserData(userId);
    }

    return newAchievements;
  }

  private updateStreak(habitId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const streak = this.streaks.get(habitId) || {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: '',
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastCompletedDate === yesterdayStr) {
      // Continuing streak
      streak.currentStreak += 1;
    } else if (streak.lastCompletedDate === today) {
      // Already completed today, don't change streak
      return;
    } else {
      // Starting new streak
      streak.currentStreak = 1;
    }

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastCompletedDate = today;
    this.streaks.set(habitId, streak);
  }

  private checkMilestoneAchievements(habitId: string): Achievement[] {
    const completions = this.totalCompletions.get(habitId) || 0;
    const newAchievements: Achievement[] = [];

    this.achievements
      .filter(a => a.category === 'milestone' && !a.isUnlocked)
      .forEach(achievement => {
        if (completions >= achievement.requirement) {
          newAchievements.push({ ...achievement });
        }
      });

    return newAchievements;
  }

  private checkStreakAchievements(habitId: string): Achievement[] {
    const streak = this.streaks.get(habitId);
    if (!streak) return [];

    const newAchievements: Achievement[] = [];

    this.achievements
      .filter(a => a.category === 'streak' && !a.isUnlocked)
      .forEach(achievement => {
        if (streak.currentStreak >= achievement.requirement) {
          newAchievements.push({ ...achievement });
        }
      });

    return newAchievements;
  }

  private checkPerfectAchievements(habitId: string): Achievement[] {
    const perfectCount = this.perfectSessions.get(habitId) || 0;
    const newAchievements: Achievement[] = [];

    this.achievements
      .filter(a => a.category === 'perfect' && !a.isUnlocked)
      .forEach(achievement => {
        if (achievement.id === 'perfect_day' && perfectCount >= 1) {
          newAchievements.push({ ...achievement });
        } else if (perfectCount >= achievement.requirement) {
          newAchievements.push({ ...achievement });
        }
      });

    return newAchievements;
  }

  private checkSpeedAchievements(habitId: string, sessionDuration: number): Achievement[] {
    const newAchievements: Achievement[] = [];

    this.achievements
      .filter(a => a.category === 'speed' && !a.isUnlocked)
      .forEach(achievement => {
        if (sessionDuration <= achievement.requirement) {
          newAchievements.push({ ...achievement });
        }
      });

    return newAchievements;
  }

  // New method to calculate progress for locked achievements
  calculateAchievementProgress(habitId: string): Achievement[] {
    const completions = this.totalCompletions.get(habitId) || 0;
    const streak = this.streaks.get(habitId);
    const currentStreak = streak?.currentStreak || 0;
    const perfectSessions = this.perfectSessions.get(habitId) || 0;

    return this.achievements.map(achievement => {
      if (achievement.isUnlocked) {
        return { ...achievement, progress: 1 };
      }

      let progress = 0;
      switch (achievement.category) {
        case 'milestone':
          progress = Math.min(completions / achievement.requirement, 1);
          break;
        case 'streak':
          progress = Math.min(currentStreak / achievement.requirement, 1);
          break;
        case 'perfect':
          progress = Math.min(perfectSessions / achievement.requirement, 1);
          break;
        case 'speed':
          // Speed achievements don't have meaningful progress tracking
          progress = 0;
          break;
        case 'consistency':
          // Would need additional tracking for consistency achievements
          progress = 0;
          break;
        case 'special':
          // Special achievements have custom logic
          progress = 0;
          break;
      }

      return { ...achievement, progress };
    });
  }

  // Get current user stats
  getUserStats(habitId: string) {
    const streak = this.streaks.get(habitId);
    const completions = this.totalCompletions.get(habitId) || 0;
    const perfectSessions = this.perfectSessions.get(habitId) || 0;

    return {
      totalCompletions: completions,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      perfectSessions,
      unlockedAchievements: this.achievements.filter(a => a.isUnlocked).length,
      totalAchievements: this.achievements.length,
    };
  }

  // Get achievements
  getAchievements(filter?: 'unlocked' | 'locked'): Achievement[] {
    if (filter === 'unlocked') {
      return this.achievements.filter(a => a.isUnlocked);
    } else if (filter === 'locked') {
      return this.achievements.filter(a => !a.isUnlocked);
    }
    return [...this.achievements];
  }

  // Get next achievement to unlock
  getNextAchievement(habitId: string): Achievement | null {
    const completions = this.totalCompletions.get(habitId) || 0;
    const streak = this.streaks.get(habitId);
    const currentStreak = streak?.currentStreak || 0;

    // Find closest milestone
    const nextMilestone = this.achievements
      .filter(a => a.category === 'milestone' && !a.isUnlocked && a.requirement > completions)
      .sort((a, b) => a.requirement - b.requirement)[0];

    // Find closest streak
    const nextStreak = this.achievements
      .filter(a => a.category === 'streak' && !a.isUnlocked && a.requirement > currentStreak)
      .sort((a, b) => a.requirement - b.requirement)[0];

    // Return the closest one
    if (!nextMilestone && !nextStreak) return null;
    if (!nextMilestone) return nextStreak;
    if (!nextStreak) return nextMilestone;

    const milestoneDistance = nextMilestone.requirement - completions;
    const streakDistance = nextStreak.requirement - currentStreak;

    return milestoneDistance <= streakDistance ? nextMilestone : nextStreak;
  }

  // Generate daily challenges
  generateDailyChallenge(): Challenge {
    const challenges = [
      {
        id: 'daily_double',
        title: 'Daily Double',
        description: 'Complete squats twice today',
        icon: '🎯',
        targetCount: 2,
        xpReward: 15,
      },
      {
        id: 'speed_challenge',
        title: 'Speed Challenge',
        description: 'Complete squats in under 2.5 minutes',
        icon: '⚡',
        targetCount: 1,
        xpReward: 20,
      },
      {
        id: 'perfect_form',
        title: 'Perfect Form',
        description: 'Complete all 10 squats with perfect form',
        icon: '💎',
        targetCount: 1,
        xpReward: 25,
      },
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      ...randomChallenge,
      type: 'daily',
      targetHabits: ['squats'],
      currentProgress: 0,
      expiresAt: tomorrow.toISOString(),
      isCompleted: false,
    };
  }

  // Calculate motivation message
  getMotivationMessage(habitId: string): string {
    const stats = this.getUserStats(habitId);
    const nextAchievement = this.getNextAchievement(habitId);

    if (stats.currentStreak >= 7) {
      return `🔥 ${stats.currentStreak} day streak! You're unstoppable!`;
    } else if (stats.currentStreak >= 3) {
      return `⚡ ${stats.currentStreak} days strong! Keep the momentum!`;
    } else if (nextAchievement) {
      if (nextAchievement.category === 'milestone') {
        const remaining = nextAchievement.requirement - stats.totalCompletions;
        return `🎯 ${remaining} more to unlock "${nextAchievement.title}"!`;
      } else if (nextAchievement.category === 'streak') {
        const remaining = nextAchievement.requirement - stats.currentStreak;
        return `🔥 ${remaining} more days to unlock "${nextAchievement.title}"!`;
      }
    }

    return `💪 Every rep makes you stronger!`;
  }

  // Data persistence (simplified for demo)
  private saveUserData(userId: string): void {
    // In a real app, save to AsyncStorage or backend
    console.log(`💾 Saving gamification data for user ${userId}`);
  }

  private loadUserData(userId: string): void {
    // In a real app, load from AsyncStorage or backend
    console.log(`📖 Loading gamification data for user ${userId}`);
  }
}

export const gamification = new GamificationService();