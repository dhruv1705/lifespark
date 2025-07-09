-- Add Social Goals and Habits to Supabase Database
-- Run this script in your Supabase SQL Editor

-- Insert Social goals
INSERT INTO public.goals (category_id, name, description, duration) 
SELECT 
  c.id,
  goal_data.name,
  goal_data.description,
  goal_data.duration
FROM public.categories c,
(VALUES 
  ('Build Meaningful Connections', 'Develop authentic relationships and deepen existing bonds', '6-8 weeks'),
  ('Improve Communication Skills', 'Master effective communication and active listening', '8-12 weeks'),
  ('Expand Social Network', 'Meet new people and create valuable social connections', '10-12 weeks'),
  ('Strengthen Family Relationships', 'Build closer bonds with family members', '6-10 weeks'),
  ('Develop Leadership & Influence', 'Build skills to positively influence and lead others', '12-16 weeks')
) AS goal_data(name, description, duration)
WHERE c.name = 'Social';

-- Now insert Social habits
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
  -- Build Meaningful Connections - Level 1
  ('Build Meaningful Connections', 'Daily Check-in Text', 'Send a caring message to a friend or family member', 1, 8),
  ('Build Meaningful Connections', 'Compliment Someone', 'Give one genuine compliment daily', 1, 10),
  
  -- Improve Communication Skills - Level 1
  ('Improve Communication Skills', 'Active Listening Practice', 'Practice focused listening in conversations', 1, 12),
  ('Improve Communication Skills', 'Eye Contact Practice', 'Maintain good eye contact during conversations', 1, 10),
  
  -- Expand Social Network - Level 1
  ('Expand Social Network', 'Greet New People', 'Say hello to someone new each day', 1, 8),
  
  -- Strengthen Family Relationships - Level 1
  ('Strengthen Family Relationships', 'Family Quality Time', 'Spend 15 minutes of focused time with family', 1, 15),
  ('Strengthen Family Relationships', 'Gratitude Expression', 'Thank a family member for something specific', 1, 8),
  
  -- Develop Leadership & Influence - Level 1
  ('Develop Leadership & Influence', 'Practice Encouragement', 'Encourage someone working toward a goal', 1, 10)
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
  -- Build Meaningful Connections - Level 2
  ('Build Meaningful Connections', 'Weekly Coffee Date', 'Schedule regular one-on-one time with someone', 2, 25),
  ('Build Meaningful Connections', 'Deep Conversation', 'Have one meaningful conversation beyond small talk', 2, 20),
  
  -- Improve Communication Skills - Level 2
  ('Improve Communication Skills', 'Practice Small Talk', 'Engage in friendly conversation with strangers', 2, 18),
  ('Improve Communication Skills', 'Conflict Resolution', 'Address misunderstandings constructively', 2, 22),
  
  -- Expand Social Network - Level 2
  ('Expand Social Network', 'Join a Group Activity', 'Participate in community or hobby groups', 2, 20),
  ('Expand Social Network', 'Social Media Engagement', 'Meaningful interaction on social platforms', 2, 15),
  
  -- Strengthen Family Relationships - Level 2
  ('Strengthen Family Relationships', 'Family Game Night', 'Organize fun activities for family bonding', 2, 20),
  ('Strengthen Family Relationships', 'Family Meal Together', 'Share meals without distractions', 2, 18),
  
  -- Develop Leadership & Influence - Level 2
  ('Develop Leadership & Influence', 'Take Initiative', 'Lead a small project or volunteer for responsibility', 2, 25)
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
  -- Build Meaningful Connections - Level 3
  ('Build Meaningful Connections', 'Host a Gathering', 'Organize social events or dinner parties', 3, 35),
  ('Build Meaningful Connections', 'Mentor Someone', 'Share knowledge and support someone''s growth', 3, 32),
  
  -- Improve Communication Skills - Level 3
  ('Improve Communication Skills', 'Public Speaking', 'Present to groups or speak at events', 3, 38),
  ('Improve Communication Skills', 'Difficult Conversations', 'Navigate challenging discussions with grace', 3, 35),
  
  -- Expand Social Network - Level 3
  ('Expand Social Network', 'Network Building', 'Attend networking events and make connections', 3, 30),
  ('Expand Social Network', 'Cross-Cultural Connections', 'Build relationships with people from different backgrounds', 3, 32),
  
  -- Strengthen Family Relationships - Level 3
  ('Strengthen Family Relationships', 'Family Tradition Creation', 'Start or maintain meaningful family traditions', 3, 30),
  ('Strengthen Family Relationships', 'Family Goal Support', 'Actively support family members'' personal goals', 3, 35),
  
  -- Develop Leadership & Influence - Level 3
  ('Develop Leadership & Influence', 'Volunteer Leadership', 'Take leadership roles in volunteer work', 3, 35),
  ('Develop Leadership & Influence', 'Team Building', 'Organize activities that bring people together', 3, 30)
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
  -- Build Meaningful Connections - Level 4
  ('Build Meaningful Connections', 'Relationship Counseling', 'Help others resolve relationship conflicts', 4, 50),
  ('Build Meaningful Connections', 'Connection Facilitation', 'Help others build meaningful relationships', 4, 45),
  
  -- Improve Communication Skills - Level 4
  ('Improve Communication Skills', 'Social Skills Teaching', 'Teach communication or social skills to others', 4, 45),
  ('Improve Communication Skills', 'Communication Coaching', 'Coach others in effective communication', 4, 50),
  
  -- Expand Social Network - Level 4
  ('Expand Social Network', 'Advanced Networking', 'Build strategic professional relationships', 4, 60),
  ('Expand Social Network', 'Community Building', 'Create new communities or groups', 4, 55),
  
  -- Strengthen Family Relationships - Level 4
  ('Strengthen Family Relationships', 'Family Legacy Building', 'Create lasting positive family impact', 4, 55),
  ('Strengthen Family Relationships', 'Multi-generational Bonding', 'Bridge connections across family generations', 4, 50),
  
  -- Develop Leadership & Influence - Level 4
  ('Develop Leadership & Influence', 'Community Leadership', 'Lead community initiatives or organizations', 4, 55),
  ('Develop Leadership & Influence', 'Social Innovation', 'Create new social programs or initiatives', 4, 60)
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
WHERE c.name = 'Social'
GROUP BY c.name, g.name
ORDER BY g.name;

-- Show total counts
SELECT 
  'Social Goals' as type,
  COUNT(*) as count
FROM goals g
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Social'

UNION ALL

SELECT 
  'Social Habits' as type,
  COUNT(*) as count
FROM habits h
JOIN goals g ON h.goal_id = g.id
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Social';