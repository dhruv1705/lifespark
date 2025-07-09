-- Complete rollback to original database state
-- This will restore normal user authentication by removing all admin-related changes

-- 1. Drop all admin-related functions and tables
DROP FUNCTION IF EXISTS get_admin_analytics() CASCADE;
DROP FUNCTION IF EXISTS sync_admin_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin(TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;
DROP TRIGGER IF EXISTS sync_admin_user_trigger ON auth.users;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. Remove ALL policies from users table and recreate basic ones
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;

-- Create simple, permissive policies for users
CREATE POLICY "Users can manage own data" ON users
    FOR ALL USING (auth.uid() = id);

-- 3. Remove ALL policies from daily_completions and recreate basic ones
DROP POLICY IF EXISTS "Users can view own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can manage own completions" ON daily_completions;
DROP POLICY IF EXISTS "Admins can view all completions" ON daily_completions;

-- Create simple, permissive policies for daily_completions
CREATE POLICY "Users can manage own completions" ON daily_completions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Remove ALL policies from user_goals and recreate basic ones
DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can modify own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can manage own goals" ON user_goals;
DROP POLICY IF EXISTS "Admins can view all user goals" ON user_goals;

-- Create simple, permissive policies for user_goals
CREATE POLICY "Users can manage own goals" ON user_goals
    FOR ALL USING (auth.uid() = user_id);

-- 5. Remove ALL policies from user_habits and recreate basic ones
DROP POLICY IF EXISTS "Users can view own habits" ON user_habits;
DROP POLICY IF EXISTS "Users can modify own habits" ON user_habits;
DROP POLICY IF EXISTS "Users can manage own habits" ON user_habits;
DROP POLICY IF EXISTS "Admins can view all user habits" ON user_habits;

-- Create simple, permissive policies for user_habits
CREATE POLICY "Users can manage own habits" ON user_habits
    FOR ALL USING (auth.uid() = user_id);

-- 6. Ensure categories, goals, and habits tables are publicly readable for authenticated users
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view goals" ON goals;
DROP POLICY IF EXISTS "Anyone can view habits" ON habits;

CREATE POLICY "Authenticated users can view categories" ON categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view goals" ON goals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view habits" ON habits
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Drop admin-related indexes
DROP INDEX IF EXISTS idx_admin_users_email;

-- Success message
SELECT 'Database has been rolled back to original state. User authentication should work normally now!' as message;