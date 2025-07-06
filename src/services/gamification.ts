export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: 'milestone' | 'streak' | 'perfect' | 'speed' | 'consistency';
  requirement: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
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
  // First Steps Achievements
  {
    id: 'first_squat',
    title: 'First Steps',
    description: 'Complete your first squat',
    icon: '🎯',
    color: '#4CAF50',
    type: 'milestone',
    requirement: 1,
    isUnlocked: false,
    xpReward: 5,
  },
  {
    id: 'squat_apprentice',
    title: 'Squat Apprentice',
    description: 'Complete 10 squats total',
    icon: '🏋️‍♂️',
    color: '#2196F3',
    type: 'milestone',
    requirement: 10,
    isUnlocked: false,
    xpReward: 10,
  },
  {
    id: 'squat_warrior',
    title: 'Squat Warrior',
    description: 'Complete 50 squats total',
    icon: '⚔️',
    color: '#FF9800',
    type: 'milestone',
    requirement: 50,
    isUnlocked: false,
    xpReward: 25,
  },
  {
    id: 'squat_legend',
    title: 'Squat Legend',
    description: 'Complete 100 squats total',
    icon: '👑',
    color: '#9C27B0',
    type: 'milestone',
    requirement: 100,
    isUnlocked: false,
    xpReward: 50,
  },

  // Streak Achievements
  {
    id: 'consistency_champion',
    title: 'Consistency Champion',
    description: '3 days in a row',
    icon: '🔥',
    color: '#FF5722',
    type: 'streak',
    requirement: 3,
    isUnlocked: false,
    xpReward: 15,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: '7 days in a row',
    icon: '⚡',
    color: '#FFC107',
    type: 'streak',
    requirement: 7,
    isUnlocked: false,
    xpReward: 30,
  },
  {
    id: 'unstoppable_force',
    title: 'Unstoppable Force',
    description: '14 days in a row',
    icon: '🌟',
    color: '#E91E63',
    type: 'streak',
    requirement: 14,
    isUnlocked: false,
    xpReward: 60,
  },

  // Perfect Form Achievements
  {
    id: 'perfect_ten',
    title: 'Perfect Ten',
    description: 'Complete all 10 squats in one session',
    icon: '💎',
    color: '#00BCD4',
    type: 'perfect',
    requirement: 10,
    isUnlocked: false,
    xpReward: 20,
  },
  {
    id: 'form_master',
    title: 'Form Master',
    description: 'Complete 5 perfect sessions',
    icon: '🎨',
    color: '#795548',
    type: 'perfect',
    requirement: 5,
    isUnlocked: false,
    xpReward: 35,
  },

  // Speed Achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete squats in under 3 minutes',
    icon: '💨',
    color: '#607D8B',
    type: 'speed',
    requirement: 180, // 3 minutes in seconds
    isUnlocked: false,
    xpReward: 25,
  },
  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Complete squats in under 2 minutes',
    icon: '⚡',
    color: '#FFEB3B',
    type: 'speed',
    requirement: 120, // 2 minutes in seconds
    isUnlocked: false,
    xpReward: 40,
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
      .filter(a => a.type === 'milestone' && !a.isUnlocked)
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
      .filter(a => a.type === 'streak' && !a.isUnlocked)
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
      .filter(a => a.type === 'perfect' && !a.isUnlocked)
      .forEach(achievement => {
        if (achievement.id === 'perfect_ten' && perfectCount >= 1) {
          newAchievements.push({ ...achievement });
        } else if (achievement.id === 'form_master' && perfectCount >= achievement.requirement) {
          newAchievements.push({ ...achievement });
        }
      });

    return newAchievements;
  }

  private checkSpeedAchievements(habitId: string, sessionDuration: number): Achievement[] {
    const newAchievements: Achievement[] = [];

    this.achievements
      .filter(a => a.type === 'speed' && !a.isUnlocked)
      .forEach(achievement => {
        if (sessionDuration <= achievement.requirement) {
          newAchievements.push({ ...achievement });
        }
      });

    return newAchievements;
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
      .filter(a => a.type === 'milestone' && !a.isUnlocked && a.requirement > completions)
      .sort((a, b) => a.requirement - b.requirement)[0];

    // Find closest streak
    const nextStreak = this.achievements
      .filter(a => a.type === 'streak' && !a.isUnlocked && a.requirement > currentStreak)
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
      if (nextAchievement.type === 'milestone') {
        const remaining = nextAchievement.requirement - stats.totalCompletions;
        return `🎯 ${remaining} more to unlock "${nextAchievement.title}"!`;
      } else if (nextAchievement.type === 'streak') {
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