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
  // Video properties
  videoUrl?: string;
  videoThumbnailUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
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
  VideoPlayer: { videoUrl: string; title?: string; habitId?: string; habitXp?: number };
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ProgressTab: undefined;
  ScheduleTab: undefined;
  ProfileTab: undefined;
};

export interface ScheduledTask {
  id: string;
  title: string;
  description?: string;
  scheduledDateTime: Date;
  isCompleted: boolean;
  type: 'habit' | 'custom' | 'event';
  habitId?: string; // if linked to habit
  reminder?: boolean;
  created_at: Date;
}

export type ScheduleViewType = 'day' | 'week' | 'month';

export interface VideoConfig {
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  title: string;
}