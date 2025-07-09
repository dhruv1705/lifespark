-- Admin-only database policies for Lifespark Admin Panel
-- Run these in your Supabase SQL editor to secure admin access

-- 1. Create admin_users table to track admin privileges
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = user_email 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_admin(auth.email());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Policy for admin_users table - only admins can view/modify
CREATE POLICY "Admins can view admin_users" ON admin_users
    FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can insert admin_users" ON admin_users
    FOR INSERT WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update admin_users" ON admin_users
    FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "Admins can delete admin_users" ON admin_users
    FOR DELETE USING (is_current_user_admin());

-- 6. Enhanced policies for users table (admin read access)
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Recreate with admin access and proper user permissions
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (is_current_user_admin());

-- 7. Enhanced policies for daily_completions (admin read access)
DROP POLICY IF EXISTS "Users can view own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON daily_completions;
DROP POLICY IF EXISTS "Admins can view all completions" ON daily_completions;

CREATE POLICY "Users can view own completions" ON daily_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON daily_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON daily_completions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions" ON daily_completions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions" ON daily_completions
    FOR SELECT USING (is_current_user_admin());

-- 8. Enhanced policies for user_goals (admin read access)
DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can modify own goals" ON user_goals;
DROP POLICY IF EXISTS "Admins can view all user goals" ON user_goals;

CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own goals" ON user_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user goals" ON user_goals
    FOR SELECT USING (is_current_user_admin());

-- 9. Enhanced policies for user_habits (admin read access)
DROP POLICY IF EXISTS "Users can view own habits" ON user_habits;
DROP POLICY IF EXISTS "Users can modify own habits" ON user_habits;
DROP POLICY IF EXISTS "Admins can view all user habits" ON user_habits;

CREATE POLICY "Users can view own habits" ON user_habits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own habits" ON user_habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user habits" ON user_habits
    FOR SELECT USING (is_current_user_admin());

-- 10. Public read access for reference tables (categories, goals, habits)
-- These should be readable by all authenticated users and admins

-- Categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Goals
DROP POLICY IF EXISTS "Anyone can view goals" ON goals;
CREATE POLICY "Anyone can view goals" ON goals
    FOR SELECT USING (auth.role() = 'authenticated');

-- Habits
DROP POLICY IF EXISTS "Anyone can view habits" ON habits;
CREATE POLICY "Anyone can view habits" ON habits
    FOR SELECT USING (auth.role() = 'authenticated');

-- 11. Insert initial admin user (replace with your actual admin email)
INSERT INTO admin_users (email, role) VALUES 
    ('admin@lifespark.com', 'admin'),
    ('support@lifespark.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 12. Create functions for admin analytics (views don't support RLS policies)
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS TABLE (
    total_users BIGINT,
    active_users_7d BIGINT,
    total_completions BIGINT,
    avg_xp_per_completion NUMERIC,
    new_users_7d BIGINT,
    daily_active_users BIGINT
) AS $$
BEGIN
    -- Check if current user is admin
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE updated_at > NOW() - INTERVAL '7 days') as active_users_7d,
        (SELECT COUNT(*) FROM daily_completions) as total_completions,
        (SELECT ROUND(AVG(xp_earned)) FROM daily_completions) as avg_xp_per_completion,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d,
        (SELECT COUNT(DISTINCT user_id) FROM daily_completions WHERE created_at > NOW() - INTERVAL '1 day') as daily_active_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create trigger to update admin_users when auth.users changes
CREATE OR REPLACE FUNCTION sync_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Check if this user should be an admin based on email
        IF NEW.email LIKE '%@lifespark.com' OR NEW.email LIKE '%admin%' THEN
            INSERT INTO admin_users (user_id, email, role) 
            VALUES (NEW.id, NEW.email, 'admin')
            ON CONFLICT (email) DO UPDATE SET 
                user_id = NEW.id,
                updated_at = NOW();
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update admin_users if email changes
        UPDATE admin_users 
        SET email = NEW.email, updated_at = NOW()
        WHERE user_id = NEW.id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create trigger on auth.users
DROP TRIGGER IF EXISTS sync_admin_user_trigger ON auth.users;
CREATE TRIGGER sync_admin_user_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_admin_user();

-- 16. Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_daily_completions_created_at ON daily_completions(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_id ON daily_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Success message
SELECT 'Admin database policies have been successfully applied!' as message;