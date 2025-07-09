import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type UserGoal = Database['public']['Tables']['user_goals']['Row'];
type UserHabit = Database['public']['Tables']['user_habits']['Row'];
type DailyCompletion = Database['public']['Tables']['daily_completions']['Row'];

// Demo data for offline mode - synchronized with database content
const DEMO_CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Physical Health', 
    emoji: '💪',
    description: 'Build strength, endurance, and overall fitness', 
    created_at: new Date().toISOString() 
  },
  { 
    id: '2', 
    name: 'Mental Health', 
    emoji: '🧠',
    description: 'Improve mindfulness, reduce stress, and boost mood', 
    created_at: new Date().toISOString() 
  },
  { 
    id: '3', 
    name: 'Finance', 
    emoji: '💰',
    description: 'Build wealth, save money, and financial planning', 
    created_at: new Date().toISOString() 
  },
  { 
    id: '4', 
    name: 'Social', 
    emoji: '👥',
    description: 'Strengthen relationships and social connections', 
    created_at: new Date().toISOString() 
  },
  { 
    id: '5', 
    name: 'Sleep & Recovery', 
    emoji: '😴',
    description: 'Improve rest, recovery, and sleep quality', 
    created_at: new Date().toISOString() 
  },
];

const DEMO_GOALS: Goal[] = [
  // Physical Health Goals
  { id: '1', category_id: '1', name: 'Lose Weight', description: 'Achieve healthy weight through diet and exercise', duration: '8-12 weeks', created_at: new Date().toISOString() },
  { id: '2', category_id: '1', name: 'Build Muscle', description: 'Increase muscle mass and strength', duration: '12-16 weeks', created_at: new Date().toISOString() },
  { id: '3', category_id: '1', name: 'Improve Cardio', description: 'Enhance cardiovascular endurance', duration: '6-8 weeks', created_at: new Date().toISOString() },
  
  // Mental Health Goals
  { id: '4', category_id: '2', name: 'Reduce Stress & Anxiety', description: 'Learn effective stress management and relaxation techniques', duration: '4-6 weeks', created_at: new Date().toISOString() },
  { id: '5', category_id: '2', name: 'Improve Mood & Emotional Regulation', description: 'Build emotional resilience and positive thinking patterns', duration: '6-8 weeks', created_at: new Date().toISOString() },
  { id: '6', category_id: '2', name: 'Build Mindfulness & Presence', description: 'Develop awareness, focus, and mindful living practices', duration: '8-10 weeks', created_at: new Date().toISOString() },
  { id: '7', category_id: '2', name: 'Boost Confidence & Self-Esteem', description: 'Build positive self-image and inner strength', duration: '10-12 weeks', created_at: new Date().toISOString() },
  
  // Finance Goals
  { id: '8', category_id: '3', name: 'Build Emergency Fund', description: 'Create financial security with a comprehensive safety net', duration: '12-16 weeks', created_at: new Date().toISOString() },
  { id: '9', category_id: '3', name: 'Reduce Debt & Improve Credit', description: 'Pay down debt systematically and build creditworthiness', duration: '16-24 weeks', created_at: new Date().toISOString() },
  { id: '10', category_id: '3', name: 'Start Investing & Building Wealth', description: 'Begin long-term wealth building through smart investments', duration: '8-12 weeks', created_at: new Date().toISOString() },
  { id: '11', category_id: '3', name: 'Master Personal Finance', description: 'Develop comprehensive financial literacy and planning skills', duration: '20-24 weeks', created_at: new Date().toISOString() },
  
  // Social Goals
  { id: '12', category_id: '4', name: 'Build Meaningful Connections', description: 'Develop authentic relationships and deepen existing bonds', duration: '6-8 weeks', created_at: new Date().toISOString() },
  { id: '13', category_id: '4', name: 'Improve Communication Skills', description: 'Master effective communication and active listening', duration: '8-12 weeks', created_at: new Date().toISOString() },
  { id: '14', category_id: '4', name: 'Expand Social Network', description: 'Meet new people and create valuable social connections', duration: '10-12 weeks', created_at: new Date().toISOString() },
  { id: '15', category_id: '4', name: 'Strengthen Family Relationships', description: 'Build closer bonds with family members', duration: '6-10 weeks', created_at: new Date().toISOString() },
  { id: '16', category_id: '4', name: 'Develop Leadership & Influence', description: 'Build skills to positively influence and lead others', duration: '12-16 weeks', created_at: new Date().toISOString() },
  
  // Sleep & Recovery Goals
  { id: '17', category_id: '5', name: 'Enhance Sleep Quality', description: 'Improve rest and recovery through better sleep hygiene', duration: '3-4 weeks', created_at: new Date().toISOString() },
  { id: '18', category_id: '5', name: 'Optimize Sleep Schedule', description: 'Establish consistent sleep-wake patterns', duration: '2-3 weeks', created_at: new Date().toISOString() },
  { id: '19', category_id: '5', name: 'Master Recovery Techniques', description: 'Learn advanced recovery and restoration methods', duration: '4-6 weeks', created_at: new Date().toISOString() },
];

const DEMO_HABITS: Habit[] = [
  // Physical Health Habits - Level 1
  { id: '1', goal_id: '1', name: '5-min Morning Stretch', description: 'Start your day with gentle stretching', level: 1, xp: 10, created_at: new Date().toISOString() },
  { id: '2', goal_id: '1', name: 'Track Water Intake', description: 'Log your daily water consumption', level: 1, xp: 8, created_at: new Date().toISOString() },
  { id: '3', goal_id: '1', name: 'Healthy Breakfast', description: 'Start with a nutritious meal', level: 1, xp: 15, created_at: new Date().toISOString() },
  
  // Physical Health Habits - Level 2
  { id: '4', goal_id: '1', name: '20-min Morning Run', description: 'Cardiovascular exercise to start the day', level: 2, xp: 25, created_at: new Date().toISOString() },
  { id: '5', goal_id: '1', name: 'Meal Prep Sunday', description: 'Prepare healthy meals for the week', level: 2, xp: 30, created_at: new Date().toISOString() },
  
  // Mental Health Habits - Level 1
  { id: '6', goal_id: '4', name: '2-Minute Breathing Exercise', description: 'Simple breathing technique to reduce stress', level: 1, xp: 10, created_at: new Date().toISOString() },
  { id: '7', goal_id: '5', name: 'Daily Gratitude Practice', description: 'Write down three things you\'re grateful for', level: 1, xp: 8, created_at: new Date().toISOString() },
  { id: '8', goal_id: '7', name: 'Positive Affirmations', description: 'Start your day with empowering self-talk', level: 1, xp: 10, created_at: new Date().toISOString() },
  
  // Mental Health Habits - Level 2
  { id: '9', goal_id: '6', name: '5-Minute Meditation', description: 'Build focus and awareness through meditation', level: 2, xp: 20, created_at: new Date().toISOString() },
  { id: '10', goal_id: '4', name: 'Stress Relief Journaling', description: 'Write about your stressors and solutions', level: 2, xp: 18, created_at: new Date().toISOString() },
  
  // Finance Habits - Level 1
  { id: '11', goal_id: '8', name: 'Daily Expense Tracking', description: 'Track every expense to understand spending patterns', level: 1, xp: 8, created_at: new Date().toISOString() },
  { id: '12', goal_id: '8', name: 'Emergency Fund Start', description: 'Begin saving $1 daily for emergency fund', level: 1, xp: 10, created_at: new Date().toISOString() },
  
  // Finance Habits - Level 2
  { id: '13', goal_id: '8', name: 'Weekly Budget Review', description: 'Analyze weekly spending and adjust budget', level: 2, xp: 18, created_at: new Date().toISOString() },
  { id: '14', goal_id: '10', name: 'Investment Account Setup', description: 'Open investment account and start with index funds', level: 2, xp: 25, created_at: new Date().toISOString() },
  
  // Social Habits - Level 1
  { id: '15', goal_id: '12', name: 'Daily Check-in Text', description: 'Send a caring message to a friend or family member', level: 1, xp: 8, created_at: new Date().toISOString() },
  { id: '16', goal_id: '12', name: 'Compliment Someone', description: 'Give one genuine compliment daily', level: 1, xp: 10, created_at: new Date().toISOString() },
  
  // Social Habits - Level 2
  { id: '17', goal_id: '12', name: 'Weekly Coffee Date', description: 'Schedule regular one-on-one time with someone', level: 2, xp: 25, created_at: new Date().toISOString() },
  { id: '18', goal_id: '13', name: 'Practice Small Talk', description: 'Engage in friendly conversation with strangers', level: 2, xp: 18, created_at: new Date().toISOString() },
  
  // Sleep & Recovery Habits - Level 1
  { id: '19', goal_id: '17', name: 'Evening Wind-Down', description: 'Simple routine to signal bedtime to your body', level: 1, xp: 10, created_at: new Date().toISOString() },
  { id: '20', goal_id: '17', name: 'Consistent Bedtime', description: 'Go to bed at the same time every night', level: 1, xp: 12, created_at: new Date().toISOString() },
  
  // Sleep & Recovery Habits - Level 2
  { id: '21', goal_id: '17', name: 'Bedtime Relaxation Routine', description: 'Prepare your mind and body for restful sleep', level: 2, xp: 20, created_at: new Date().toISOString() },
  { id: '22', goal_id: '18', name: 'Morning Light Exposure', description: 'Get natural light within 30 minutes of waking', level: 2, xp: 15, created_at: new Date().toISOString() },
  
  // Sleep & Recovery Habits - Level 3
  { id: '23', goal_id: '17', name: 'Sleep Hygiene Mastery', description: 'Optimize your environment and habits for better sleep', level: 3, xp: 30, created_at: new Date().toISOString() },
  { id: '24', goal_id: '19', name: 'Advanced Recovery Practice', description: 'Implement comprehensive recovery techniques', level: 3, xp: 35, created_at: new Date().toISOString() },
  
  // Sleep & Recovery Habits - Level 4
  { id: '25', goal_id: '17', name: 'Complete Wellness Routine', description: 'Comprehensive mind-body wellness practice', level: 4, xp: 55, created_at: new Date().toISOString() },
];

export class DataService {
  private static isOfflineMode(): boolean {
    // Check if Supabase configuration is valid
    const isValidConfig = process.env.EXPO_PUBLIC_SUPABASE_URL && 
                         process.env.EXPO_PUBLIC_SUPABASE_URL !== 'your-supabase-url-here' &&
                         process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                         process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
                         process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';
    
    if (!isValidConfig) {
      console.log('📱 DataService: Using offline mode - Invalid Supabase configuration');
      return true;
    }
    
    // In development/testing, you can force offline mode
    if (process.env.NODE_ENV === 'development' && process.env.EXPO_PUBLIC_FORCE_OFFLINE === 'true') {
      console.log('📱 DataService: Using offline mode - Forced offline in development');
      return true;
    }
    
    return false;
  }

  static async getCategories(): Promise<Category[]> {
    if (this.isOfflineMode()) {
      return DEMO_CATEGORIES;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('DataService: Failed to fetch categories, using demo data:', error);
      return DEMO_CATEGORIES;
    }
  }

  static async getGoalsByCategory(categoryId: string): Promise<Goal[]> {
    if (this.isOfflineMode()) {
      return DEMO_GOALS.filter(goal => goal.category_id === categoryId);
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('DataService: Failed to fetch goals, using demo data:', error);
      return DEMO_GOALS.filter(goal => goal.category_id === categoryId);
    }
  }

  static async getGoalById(goalId: string): Promise<Goal | null> {
    if (this.isOfflineMode()) {
      return DEMO_GOALS.find(goal => goal.id === goalId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.warn('DataService: Failed to fetch goal by ID, using demo data:', error);
      return DEMO_GOALS.find(goal => goal.id === goalId) || null;
    }
  }

  static async getHabitsByGoal(goalId: string): Promise<Habit[]> {
    if (this.isOfflineMode()) {
      return DEMO_HABITS.filter(habit => habit.goal_id === goalId);
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('goal_id', goalId)
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('DataService: Failed to fetch habits, using demo data:', error);
      return DEMO_HABITS.filter(habit => habit.goal_id === goalId);
    }
  }

  static async getHabitById(habitId: string): Promise<Habit | null> {
    if (this.isOfflineMode()) {
      return DEMO_HABITS.find(habit => habit.id === habitId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.warn('DataService: Failed to fetch habit, using demo data:', error);
      return DEMO_HABITS.find(habit => habit.id === habitId) || null;
    }
  }

  static async getUserGoals(userId: string): Promise<UserGoal[]> {
    if (this.isOfflineMode()) {
      console.log('📱 DataService: Using offline mode - Returning empty user goals');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('DataService: Failed to fetch user goals, using offline fallback:', error);
      return [];
    }
  }

  static async getUserGoalProgress(userId: string, goalId: string): Promise<number> {
    if (this.isOfflineMode()) {
      console.log('📱 DataService: Using offline mode - Returning 0 progress');
      return 0;
    }

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('progress')
        .eq('user_id', userId)
        .eq('goal_id', goalId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.progress || 0;
    } catch (error) {
      console.warn('DataService: Failed to fetch user goal progress, using offline fallback:', error);
      return 0;
    }
  }

  static async startUserGoal(userId: string, goalId: string): Promise<void> {
    if (this.isOfflineMode()) {
      console.log('📱 DataService: Using offline mode - Simulating user goal start');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_goals')
        .upsert({
          user_id: userId,
          goal_id: goalId,
          progress: 0,
          started_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    } catch (error) {
      console.warn('DataService: Failed to start user goal, using offline fallback:', error);
      // In offline mode, just return without error
    }
  }

  static async getUserHabits(userId: string): Promise<UserHabit[]> {
    if (this.isOfflineMode()) {
      console.log('📱 DataService: Using offline mode - Returning empty user habits');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('DataService: Failed to fetch user habits, using offline fallback:', error);
      return [];
    }
  }

  static async getUserHabit(userId: string, habitId: string): Promise<UserHabit | null> {
    if (this.isOfflineMode()) {
      console.log('📱 DataService: Using offline mode - Returning null user habit');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.warn('DataService: Failed to fetch user habit, using offline fallback:', error);
      return null;
    }
  }

  static async toggleHabitCompletion(userId: string, habitId: string, xp: number): Promise<boolean> {
    console.log('🔄 Toggle habit completion:', { userId, habitId, xp });
    
    if (this.isOfflineMode()) {
      // In offline mode, just simulate successful completion
      console.log('📱 Offline mode: Simulating habit completion');
      return true;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already completed today
      const { data: existing } = await supabase
        .from('daily_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .eq('completed_date', today)
        .single();

    if (existing) {
      // Remove completion
      await supabase
        .from('daily_completions')
        .delete()
        .eq('id', existing.id);

      // Update user habit stats
      await supabase
        .from('user_habits')
        .upsert({
          user_id: userId,
          habit_id: habitId,
          completed_at: null,
          total_completions: Math.max(0, (await this.getUserHabit(userId, habitId))?.total_completions || 0 - 1),
        });

      // Update goal progress
      await this.updateGoalProgress(userId, habitId);

      return false;
    } else {
      // Add completion
      console.log('📝 Inserting completion with XP:', xp);
      const result = await supabase
        .from('daily_completions')
        .insert({
          user_id: userId,
          habit_id: habitId,
          completed_date: today,
          xp_earned: xp,
        });
      
      console.log('💾 Insert result:', result.error ? 'ERROR' : 'SUCCESS', result.error);

      // Update user habit stats
      const userHabit = await this.getUserHabit(userId, habitId);
      await supabase
        .from('user_habits')
        .upsert({
          user_id: userId,
          habit_id: habitId,
          completed_at: new Date().toISOString(),
          total_completions: (userHabit?.total_completions || 0) + 1,
          streak: (userHabit?.streak || 0) + 1,
        });

      // Calculate and update goal progress
      await this.updateGoalProgress(userId, habitId);
      
      return true;
    }
    } catch (error) {
      console.warn('DataService: Failed to toggle habit completion, simulating success:', error);
      return true; // Return success in offline mode
    }
  }

  static async updateGoalProgress(userId: string, habitId: string): Promise<void> {
    try {
      // Get the habit to find its goal
      const { data: habit } = await supabase
        .from('habits')
        .select('goal_id')
        .eq('id', habitId)
        .single();
      
      if (!habit) return;
      
      // Get all habits for this goal
      const { data: goalHabits } = await supabase
        .from('habits')
        .select('id')
        .eq('goal_id', habit.goal_id);
      
      if (!goalHabits || goalHabits.length === 0) return;
      
      // Get today's completions for this goal's habits
      const today = new Date().toISOString().split('T')[0];
      const { data: completions } = await supabase
        .from('daily_completions')
        .select('habit_id')
        .eq('user_id', userId)
        .eq('completed_date', today)
        .in('habit_id', goalHabits.map(h => h.id));
      
      // Calculate progress percentage
      const completedCount = completions?.length || 0;
      const totalHabits = goalHabits.length;
      const progressPercentage = Math.round((completedCount / totalHabits) * 100);
      
      // Update user_goals table
      await supabase
        .from('user_goals')
        .upsert({
          user_id: userId,
          goal_id: habit.goal_id,
          progress: progressPercentage,
          started_at: new Date().toISOString(),
        });
      
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  }

  static async recalculateAllGoalProgress(userId: string): Promise<void> {
    try {
      // Get all user's goals
      const userGoals = await this.getUserGoals(userId);
      
      for (const userGoal of userGoals) {
        // Get all habits for this goal
        const { data: goalHabits } = await supabase
          .from('habits')
          .select('id')
          .eq('goal_id', userGoal.goal_id);
        
        if (!goalHabits || goalHabits.length === 0) continue;
        
        // Get today's completions for this goal's habits
        const today = new Date().toISOString().split('T')[0];
        const { data: completions } = await supabase
          .from('daily_completions')
          .select('habit_id')
          .eq('user_id', userId)
          .eq('completed_date', today)
          .in('habit_id', goalHabits.map(h => h.id));
        
        // Calculate progress percentage
        const completedCount = completions?.length || 0;
        const totalHabits = goalHabits.length;
        const progressPercentage = Math.round((completedCount / totalHabits) * 100);
        
        // Update user_goals table
        await supabase
          .from('user_goals')
          .update({ progress: progressPercentage })
          .eq('user_id', userId)
          .eq('goal_id', userGoal.goal_id);
      }
    } catch (error) {
      console.error('Error recalculating goal progress:', error);
    }
  }

  // Debug method to check XP data
  static async debugXPData(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('🔍 DEBUG: Checking XP data for user:', userId, 'date:', today);
      
      // Check daily completions
      const { data: completions } = await supabase
        .from('daily_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed_date', today);
      
      console.log('📊 Daily completions:', completions);
      
      // Get habit details for each completion
      if (completions && completions.length > 0) {
        for (const completion of completions) {
          const { data: habit } = await supabase
            .from('habits')
            .select('name, xp')
            .eq('id', completion.habit_id)
            .single();
          
          console.log(`🎯 Habit: ${habit?.name}, Expected XP: ${habit?.xp}, Stored XP: ${completion.xp_earned}`);
        }
      }
      
      // Calculate total from database
      const totalXP = completions?.reduce((sum, c) => sum + (c.xp_earned || 0), 0) || 0;
      console.log('💰 Total XP from database:', totalXP);
      
    } catch (error) {
      console.error('❌ Debug XP error:', error);
    }
  }

  // Debug method to check database state
  static async debugGoalData(userId: string, goalId: string): Promise<void> {
    try {
      console.log('🔍 DEBUG: Checking goal data for:', { userId, goalId });
      
      // Check user_goals table
      const { data: userGoal } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_id', goalId)
        .single();
      
      console.log('📊 User goal data:', userGoal);
      
      // Check habits for this goal
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('goal_id', goalId);
      
      console.log('🎯 Habits for goal:', habits);
      
      // Check today's completions
      const today = new Date().toISOString().split('T')[0];
      const { data: completions } = await supabase
        .from('daily_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed_date', today);
      
      console.log('✅ Today\'s completions:', completions);
      
      // Check completions for this goal's habits only
      if (habits && habits.length > 0) {
        const { data: goalCompletions } = await supabase
          .from('daily_completions')
          .select('*')
          .eq('user_id', userId)
          .eq('completed_date', today)
          .in('habit_id', habits.map(h => h.id));
        
        console.log('🎯 Goal-specific completions:', goalCompletions);
      }
      
    } catch (error) {
      console.error('❌ Debug error:', error);
    }
  }

  // XP and Level System Methods
  
  // Recalculate today's XP from actual habit completions and store it correctly
  static async recalculateTodayXP(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('🔄 Recalculating today XP for:', { userId, today });
      
      // Get today's completions
      const { data: completions } = await supabase
        .from('daily_completions')
        .select('habit_id, xp_earned')
        .eq('user_id', userId)
        .eq('completed_date', today);
      
      if (!completions || completions.length === 0) {
        console.log('📊 No completions found for today');
        return 0;
      }
      
      let correctedTotalXP = 0;
      
      // For each completion, get the actual habit XP and update if needed
      for (const completion of completions) {
        const { data: habit } = await supabase
          .from('habits')
          .select('xp')
          .eq('id', completion.habit_id)
          .single();
        
        const actualXP = habit?.xp || 0;
        
        if (completion.xp_earned !== actualXP) {
          console.log(`🔧 Correcting XP for habit ${completion.habit_id}: ${completion.xp_earned} → ${actualXP}`);
          
          // Update the stored XP to match the actual habit XP
          await supabase
            .from('daily_completions')
            .update({ xp_earned: actualXP })
            .eq('user_id', userId)
            .eq('habit_id', completion.habit_id)
            .eq('completed_date', today);
        }
        
        correctedTotalXP += actualXP;
      }
      
      console.log('✅ Corrected total XP:', correctedTotalXP);
      return correctedTotalXP;
      
    } catch (error) {
      console.error('Error recalculating today XP:', error);
      return 0;
    }
  }

  static async getUserTotalXP(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('daily_completions')
        .select('xp_earned')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data?.reduce((sum, completion) => sum + (completion.xp_earned || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting user total XP:', error);
      return 0;
    }
  }

  static async getTodayXP(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_completions')
        .select('xp_earned')
        .eq('user_id', userId)
        .eq('completed_date', today);
      
      if (error) throw error;
      return data?.reduce((sum, completion) => sum + (completion.xp_earned || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting today XP:', error);
      return 0;
    }
  }

  static async getUserXPForDateRange(userId: string, startDate: string, endDate: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('daily_completions')
        .select('xp_earned')
        .eq('user_id', userId)
        .gte('completed_date', startDate)
        .lte('completed_date', endDate);
      
      if (error) throw error;
      return data?.reduce((sum, completion) => sum + (completion.xp_earned || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting user XP for date range:', error);
      return 0;
    }
  }

  static async getUserWeeklyXP(userId: string): Promise<number> {
    try {
      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      
      const startOfWeek = monday.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      return await this.getUserXPForDateRange(userId, startOfWeek, today);
    } catch (error) {
      console.error('Error getting user weekly XP:', error);
      return 0;
    }
  }

  static async getUserMonthlyXP(userId: string): Promise<number> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      return await this.getUserXPForDateRange(userId, startOfMonth, today);
    } catch (error) {
      console.error('Error getting user monthly XP:', error);
      return 0;
    }
  }

  static async getTodayCompletions(userId: string): Promise<DailyCompletion[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed_date', today);
    
    if (error) throw error;
    return data || [];
  }

  static async getTotalXP(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('daily_completions')
      .select('xp_earned')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.reduce((sum, completion) => sum + completion.xp_earned, 0) || 0;
  }

  // Record partial completion for interactive habits
  static async recordPartialCompletion(
    userId: string, 
    habitId: string, 
    xpEarned: number, 
    completionPercent: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if there's already a completion for today
      const { data: existing } = await supabase
        .from('daily_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .eq('completed_date', today)
        .single();

      if (existing) {
        // Update existing completion if this is better
        if (xpEarned > (existing.xp_earned || 0)) {
          await supabase
            .from('daily_completions')
            .update({
              xp_earned: xpEarned,
              completion_percent: completionPercent,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        }
      } else {
        // Create new partial completion record
        await supabase
          .from('daily_completions')
          .insert({
            user_id: userId,
            habit_id: habitId,
            completed_date: today,
            xp_earned: xpEarned,
            completion_percent: completionPercent,
            is_partial: true,
            completed_at: new Date().toISOString(),
          });
      }

      // Update user habit stats
      await supabase
        .from('user_habits')
        .upsert({
          user_id: userId,
          habit_id: habitId,
          last_completed: new Date().toISOString(),
          total_completions: (await this.getUserHabit(userId, habitId))?.total_completions || 0 + (completionPercent >= 1.0 ? 1 : 0),
        });

    } catch (error) {
      console.error('Error recording partial completion:', error);
      throw error;
    }
  }
}