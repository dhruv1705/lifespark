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
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ProgressTab: undefined;
  ProfileTab: undefined;
};