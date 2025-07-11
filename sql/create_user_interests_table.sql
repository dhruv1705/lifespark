-- Create user_interests table for storing user category preferences
-- Run this SQL in your Supabase dashboard under SQL Editor

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of user_id and category_id
  UNIQUE(user_id, category_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_active ON user_interests(user_id, is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own interests
CREATE POLICY "Users can view their own interests" ON user_interests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interests" ON user_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests" ON user_interests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests" ON user_interests
  FOR DELETE USING (auth.uid() = user_id);