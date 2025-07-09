-- Add Sleep & Recovery category and its goals/habits to Supabase Database
-- Run this script in your Supabase SQL Editor

-- First, add the Sleep & Recovery category
INSERT INTO public.categories (name, emoji, description) VALUES 
('Sleep & Recovery', '😴', 'Improve rest, recovery, and sleep quality');

-- Get the category ID for Sleep & Recovery
DO $$
DECLARE
    sleep_category_id uuid;
    goal_enhance_sleep_id uuid;
    goal_optimize_schedule_id uuid;
    goal_master_recovery_id uuid;
BEGIN
    -- Get the Sleep & Recovery category ID
    SELECT id INTO sleep_category_id FROM public.categories WHERE name = 'Sleep & Recovery';
    
    -- Add Sleep & Recovery goals
    INSERT INTO public.goals (category_id, name, description, duration) VALUES 
    (sleep_category_id, 'Enhance Sleep Quality', 'Improve rest and recovery through better sleep hygiene', '3-4 weeks'),
    (sleep_category_id, 'Optimize Sleep Schedule', 'Establish consistent sleep-wake patterns', '2-3 weeks'),
    (sleep_category_id, 'Master Recovery Techniques', 'Learn advanced recovery and restoration methods', '4-6 weeks');
    
    -- Get the goal IDs
    SELECT id INTO goal_enhance_sleep_id FROM public.goals WHERE name = 'Enhance Sleep Quality' AND category_id = sleep_category_id;
    SELECT id INTO goal_optimize_schedule_id FROM public.goals WHERE name = 'Optimize Sleep Schedule' AND category_id = sleep_category_id;
    SELECT id INTO goal_master_recovery_id FROM public.goals WHERE name = 'Master Recovery Techniques' AND category_id = sleep_category_id;

    -- Add Sleep & Recovery habits
    -- Level 1: Foundation
    INSERT INTO public.habits (goal_id, name, description, level, xp) VALUES 
    (goal_enhance_sleep_id, 'Evening Wind-Down', 'Simple routine to signal bedtime to your body', 1, 10),
    (goal_enhance_sleep_id, 'Consistent Bedtime', 'Go to bed at the same time every night', 1, 12),
    (goal_optimize_schedule_id, 'Morning Light Exposure', 'Get natural light within 30 minutes of waking', 1, 15);

    -- Level 2: Building
    INSERT INTO public.habits (goal_id, name, description, level, xp) VALUES 
    (goal_enhance_sleep_id, 'Bedtime Relaxation Routine', 'Prepare your mind and body for restful sleep', 2, 20),
    (goal_optimize_schedule_id, 'Sleep Environment Optimization', 'Create the ideal sleep environment', 2, 25),
    (goal_master_recovery_id, 'Recovery Breathing', 'Use breathing techniques for recovery', 2, 18);

    -- Level 3: Power
    INSERT INTO public.habits (goal_id, name, description, level, xp) VALUES 
    (goal_enhance_sleep_id, 'Sleep Hygiene Mastery', 'Optimize your environment and habits for better sleep', 3, 30),
    (goal_optimize_schedule_id, 'Advanced Sleep Scheduling', 'Master circadian rhythm optimization', 3, 35),
    (goal_master_recovery_id, 'Advanced Recovery Practice', 'Implement comprehensive recovery techniques', 3, 35);

    -- Level 4: Mastery
    INSERT INTO public.habits (goal_id, name, description, level, xp) VALUES 
    (goal_enhance_sleep_id, 'Complete Wellness Routine', 'Comprehensive mind-body wellness practice', 4, 55),
    (goal_optimize_schedule_id, 'Sleep Optimization Mastery', 'Master all aspects of sleep optimization', 4, 50),
    (goal_master_recovery_id, 'Recovery Mastery', 'Master advanced recovery and restoration techniques', 4, 60);

END $$;

-- Remove the old sleep goal from Mental Health category (if it exists)
DELETE FROM public.goals WHERE name = 'Enhance Sleep Quality' AND category_id IN (
    SELECT id FROM public.categories WHERE name = 'Mental Health'
);

-- Verify the insertion
SELECT 
  c.name as category,
  g.name as goal,
  COUNT(h.id) as habit_count
FROM categories c
LEFT JOIN goals g ON c.id = g.category_id
LEFT JOIN habits h ON g.id = h.goal_id
WHERE c.name = 'Sleep & Recovery'
GROUP BY c.name, g.name
ORDER BY g.name;

-- Show total counts for Sleep & Recovery
SELECT 
  'Sleep & Recovery Goals' as type,
  COUNT(*) as count
FROM goals g
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Sleep & Recovery'

UNION ALL

SELECT 
  'Sleep & Recovery Habits' as type,
  COUNT(*) as count
FROM habits h
JOIN goals g ON h.goal_id = g.id
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Sleep & Recovery';