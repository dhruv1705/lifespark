export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          emoji: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          emoji: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          emoji?: string;
          description?: string;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string;
          duration: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description: string;
          duration: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          duration?: string;
          created_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          goal_id: string;
          name: string;
          description: string;
          level: number;
          xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          name: string;
          description: string;
          level: number;
          xp: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          name?: string;
          description?: string;
          level?: number;
          xp?: number;
          created_at?: string;
        };
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          progress: number;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          progress?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          progress?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      user_habits: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          completed_at: string | null;
          streak: number;
          total_completions: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          completed_at?: string | null;
          streak?: number;
          total_completions?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string;
          completed_at?: string | null;
          streak?: number;
          total_completions?: number;
          created_at?: string;
        };
      };
      daily_completions: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          completed_date: string;
          xp_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          completed_date: string;
          xp_earned: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string;
          completed_date?: string;
          xp_earned?: number;
          created_at?: string;
        };
      };
      user_interests: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}