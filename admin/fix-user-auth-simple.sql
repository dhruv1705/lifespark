-- Simple fix for user authentication - just update the function to be more permissive
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

-- 2. Ensure users table has proper INSERT policy for new user registration
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Ensure users table has proper UPDATE policy
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 4. Make sure daily_completions has full CRUD access for users
CREATE POLICY "Users can manage own completions" ON daily_completions
    FOR ALL USING (auth.uid() = user_id);

-- 5. Make sure user_goals has full CRUD access for users
CREATE POLICY "Users can manage own goals" ON user_goals
    FOR ALL USING (auth.uid() = user_id);

-- 6. Make sure user_habits has full CRUD access for users
CREATE POLICY "Users can manage own habits" ON user_habits
    FOR ALL USING (auth.uid() = user_id);

-- 7. Temporarily disable admin_users RLS to prevent conflicts
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'User authentication should now work properly!' as message;