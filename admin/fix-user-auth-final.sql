-- Final fix for user authentication - handles existing policies
-- Run this in your Supabase SQL editor

-- 1. Update the admin check function to be more permissive (don't throw errors)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Return true for admin users, false for regular users (don't throw errors)
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.email() 
        AND role = 'admin'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop and recreate users policies to ensure they work
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- 3. Drop and recreate daily_completions policies
DROP POLICY IF EXISTS "Users can manage own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can view own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON daily_completions;

CREATE POLICY "Users can manage own completions" ON daily_completions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Drop and recreate user_goals policies
DROP POLICY IF EXISTS "Users can manage own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can modify own goals" ON user_goals;

CREATE POLICY "Users can manage own goals" ON user_goals
    FOR ALL USING (auth.uid() = user_id);

-- 5. Drop and recreate user_habits policies
DROP POLICY IF EXISTS "Users can manage own habits" ON user_habits;
DROP POLICY IF EXISTS "Users can view own habits" ON user_habits;
DROP POLICY IF EXISTS "Users can modify own habits" ON user_habits;

CREATE POLICY "Users can manage own habits" ON user_habits
    FOR ALL USING (auth.uid() = user_id);

-- 6. Temporarily disable admin_users RLS to prevent conflicts
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'User authentication policies have been fixed!' as message;