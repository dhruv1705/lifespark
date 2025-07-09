-- Add Mental Health Goals and Habits to Supabase Database
-- Run this script in your Supabase SQL Editor

-- First, let's get the Mental Health category ID
-- Insert Mental Health goals
INSERT INTO public.goals (category_id, name, description, duration) 
SELECT 
  c.id,
  goal_data.name,
  goal_data.description,
  goal_data.duration
FROM public.categories c,
(VALUES 
  ('Reduce Stress & Anxiety', 'Learn effective stress management and relaxation techniques', '4-6 weeks'),
  ('Improve Mood & Emotional Regulation', 'Build emotional resilience and positive thinking patterns', '6-8 weeks'),
  ('Build Mindfulness & Presence', 'Develop awareness, focus, and mindful living practices', '8-10 weeks'),
  ('Enhance Sleep Quality', 'Improve rest and recovery through better sleep hygiene', '3-4 weeks'),
  ('Boost Confidence & Self-Esteem', 'Build positive self-image and inner strength', '10-12 weeks')
) AS goal_data(name, description, duration)
WHERE c.name = 'Mental Health';

-- Now insert Mental Health habits
-- Level 1: Foundation Habits
INSERT INTO public.habits (goal_id, name, description, level, xp)
SELECT 
  g.id,
  habit_data.name,
  habit_data.description,
  habit_data.level,
  habit_data.xp
FROM public.goals g,
(VALUES 
  -- Reduce Stress & Anxiety - Level 1
  ('Reduce Stress & Anxiety', '2-Minute Breathing Exercise', 'Simple breathing technique to reduce stress', 1, 10),
  
  -- Improve Mood & Emotional Regulation - Level 1
  ('Improve Mood & Emotional Regulation', 'Daily Gratitude Practice', 'Write down three things you''re grateful for', 1, 8),
  ('Improve Mood & Emotional Regulation', 'Evening Reflection', 'Reflect on your day and emotions', 1, 8),
  
  -- Build Mindfulness & Presence - Level 1
  ('Build Mindfulness & Presence', 'Mindful Morning Moment', 'Take a moment to be present and aware', 1, 12),
  
  -- Boost Confidence & Self-Esteem - Level 1
  ('Boost Confidence & Self-Esteem', 'Positive Affirmations', 'Start your day with empowering self-talk', 1, 10)
) AS habit_data(goal_name, name, description, level, xp)
WHERE g.name = habit_data.goal_name;

-- Level 2: Building Habits
INSERT INTO public.habits (goal_id, name, description, level, xp)
SELECT 
  g.id,
  habit_data.name,
  habit_data.description,
  habit_data.level,
  habit_data.xp
FROM public.goals g,
(VALUES 
  -- Build Mindfulness & Presence - Level 2
  ('Build Mindfulness & Presence', '5-Minute Meditation', 'Build focus and awareness through meditation', 2, 20),
  ('Build Mindfulness & Presence', 'Mindful Walking', 'Take a walk focusing on present moment', 2, 22),
  
  -- Reduce Stress & Anxiety - Level 2
  ('Reduce Stress & Anxiety', 'Stress Relief Journaling', 'Write about your stressors and solutions', 2, 18),
  ('Reduce Stress & Anxiety', 'Progressive Muscle Relaxation', 'Systematically relax each muscle group', 2, 25),
  
  -- Improve Mood & Emotional Regulation - Level 2
  ('Improve Mood & Emotional Regulation', 'Mood Check-in', 'Assess and acknowledge your current emotions', 2, 15)
) AS habit_data(goal_name, name, description, level, xp)
WHERE g.name = habit_data.goal_name;

-- Level 3: Power Habits
INSERT INTO public.habits (goal_id, name, description, level, xp)
SELECT 
  g.id,
  habit_data.name,
  habit_data.description,
  habit_data.level,
  habit_data.xp
FROM public.goals g,
(VALUES 
  -- Build Mindfulness & Presence - Level 3
  ('Build Mindfulness & Presence', '10-Minute Focused Meditation', 'Deepen your meditation practice', 3, 35),
  ('Build Mindfulness & Presence', 'Mindfulness Body Scan', 'Full body awareness and relaxation', 3, 40),
  
  -- Improve Mood & Emotional Regulation - Level 3
  ('Improve Mood & Emotional Regulation', 'Emotional Regulation Practice', 'Learn to manage and respond to emotions', 3, 30),
  
  -- Boost Confidence & Self-Esteem - Level 3
  ('Boost Confidence & Self-Esteem', 'Visualization Exercise', 'Use mental imagery for confidence and calm', 3, 35),
  
  -- Reduce Stress & Anxiety - Level 3
  ('Reduce Stress & Anxiety', 'Deep Breathing Mastery', 'Advanced breathing techniques for stress relief', 3, 32)
) AS habit_data(goal_name, name, description, level, xp)
WHERE g.name = habit_data.goal_name;

-- Level 4: Mastery Habits
INSERT INTO public.habits (goal_id, name, description, level, xp)
SELECT 
  g.id,
  habit_data.name,
  habit_data.description,
  habit_data.level,
  habit_data.xp
FROM public.goals g,
(VALUES 
  -- Build Mindfulness & Presence - Level 4
  ('Build Mindfulness & Presence', '15-Minute Zen Meditation', 'Advanced meditation for inner peace', 4, 50),
  ('Build Mindfulness & Presence', 'Mindful Life Integration', 'Bring mindfulness into all daily activities', 4, 45),
  
  -- Enhance Sleep Quality - Level 4
  ('Enhance Sleep Quality', 'Complete Wellness Routine', 'Comprehensive mind-body wellness practice', 4, 55),
  
  -- Boost Confidence & Self-Esteem - Level 4
  ('Boost Confidence & Self-Esteem', 'Advanced Visualization', 'Master visualization for personal growth', 4, 60),
  
  -- Improve Mood & Emotional Regulation - Level 4
  ('Improve Mood & Emotional Regulation', 'Emotional Mastery Practice', 'Complete emotional awareness and regulation', 4, 50)
) AS habit_data(goal_name, name, description, level, xp)
WHERE g.name = habit_data.goal_name;

-- Add some additional habits to reach 20 total mental health habits
INSERT INTO public.habits (goal_id, name, description, level, xp)
SELECT 
  g.id,
  habit_data.name,
  habit_data.description,
  habit_data.level,
  habit_data.xp
FROM public.goals g,
(VALUES 
  -- Additional Level 2 habits
  ('Enhance Sleep Quality', 'Bedtime Relaxation Routine', 'Prepare your mind and body for restful sleep', 2, 20),
  ('Boost Confidence & Self-Esteem', 'Self-Compassion Practice', 'Treat yourself with kindness and understanding', 2, 18),
  
  -- Additional Level 3 habits
  ('Enhance Sleep Quality', 'Sleep Hygiene Mastery', 'Optimize your environment and habits for better sleep', 3, 30),
  ('Reduce Stress & Anxiety', 'Anxiety Management Toolkit', 'Build a toolkit of techniques for managing anxiety', 3, 38),
  
  -- Additional Level 1 habit
  ('Enhance Sleep Quality', 'Evening Wind-Down', 'Simple routine to signal bedtime to your body', 1, 10)
) AS habit_data(goal_name, name, description, level, xp)
WHERE g.name = habit_data.goal_name;

-- Verify the insertion
SELECT 
  c.name as category,
  g.name as goal,
  COUNT(h.id) as habit_count
FROM categories c
LEFT JOIN goals g ON c.id = g.category_id
LEFT JOIN habits h ON g.id = h.goal_id
WHERE c.name = 'Mental Health'
GROUP BY c.name, g.name
ORDER BY g.name;

-- Show total counts
SELECT 
  'Mental Health Goals' as type,
  COUNT(*) as count
FROM goals g
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Mental Health'

UNION ALL

SELECT 
  'Mental Health Habits' as type,
  COUNT(*) as count
FROM habits h
JOIN goals g ON h.goal_id = g.id
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Mental Health';