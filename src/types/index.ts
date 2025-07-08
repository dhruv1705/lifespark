export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface Goal {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  duration: string;
  progress: number;
}

export interface Habit {
  id: string;
  goalId: string;
  name: string;
  description: string;
  level: number;
  xp: number;
  completed: boolean;
  // Interactive execution properties
  executionType?: 'simple' | 'timed' | 'guided';
  duration?: number; // in seconds
  steps?: HabitStep[];
  instructions?: string[];
}

export interface HabitStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  instructions: string[];
  isCompleted?: boolean;
}

export interface HabitSession {
  habitId: string;
  startTime: Date;
  currentStepIndex: number;
  completedSteps: string[];
  isPaused: boolean;
  totalTimeElapsed: number;
}

export interface UserProgress {
  goalProgress: number;
  currentLevel: number;
  totalXP: number;
  streaks: number[];
  achievements: string[];
}

export type RootStackParamList = {
  Categories: undefined;
  Goals: { categoryId: string };
  Habits: { goalId: string };
  HabitExecution: { habitId: string };
  Video: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ProgressTab: undefined;
  ProfileTab: undefined;
};