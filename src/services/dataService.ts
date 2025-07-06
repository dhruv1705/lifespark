import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type UserGoal = Database['public']['Tables']['user_goals']['Row'];
type UserHabit = Database['public']['Tables']['user_habits']['Row'];
type DailyCompletion = Database['public']['Tables']['daily_completions']['Row'];

export class DataService {
  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  }

  static async getGoalsByCategory(categoryId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  }

  static async getGoalById(goalId: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getHabitsByGoal(goalId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('goal_id', goalId)
      .order('level', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async getUserGoals(userId: string): Promise<UserGoal[]> {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  static async getUserGoalProgress(userId: string, goalId: string): Promise<number> {
    const { data, error } = await supabase
      .from('user_goals')
      .select('progress')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data?.progress || 0;
  }

  static async startUserGoal(userId: string, goalId: string): Promise<void> {
    const { error } = await supabase
      .from('user_goals')
      .upsert({
        user_id: userId,
        goal_id: goalId,
        progress: 0,
        started_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  }

  static async getUserHabits(userId: string): Promise<UserHabit[]> {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  static async getUserHabit(userId: string, habitId: string): Promise<UserHabit | null> {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async toggleHabitCompletion(userId: string, habitId: string, xp: number): Promise<boolean> {
    console.log('🔄 Toggle habit completion:', { userId, habitId, xp });
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
}