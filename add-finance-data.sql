-- Add Finance Goals and Habits to Supabase Database
-- Run this script in your Supabase SQL Editor

-- Insert Finance goals
INSERT INTO public.goals (category_id, name, description, duration) 
SELECT 
  c.id,
  goal_data.name,
  goal_data.description,
  goal_data.duration
FROM public.categories c,
(VALUES 
  ('Build Emergency Fund', 'Create financial security with a comprehensive safety net', '12-16 weeks'),
  ('Reduce Debt & Improve Credit', 'Pay down debt systematically and build creditworthiness', '16-24 weeks'),
  ('Start Investing & Building Wealth', 'Begin long-term wealth building through smart investments', '8-12 weeks'),
  ('Master Personal Finance', 'Develop comprehensive financial literacy and planning skills', '20-24 weeks')
) AS goal_data(name, description, duration)
WHERE c.name = 'Finance';

-- Now insert Finance habits
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
  -- Build Emergency Fund - Level 1
  ('Build Emergency Fund', 'Daily Expense Tracking', 'Track every expense to understand spending patterns', 1, 8),
  ('Build Emergency Fund', 'Emergency Fund Start', 'Begin saving $1 daily for emergency fund', 1, 10),
  
  -- Reduce Debt & Improve Credit - Level 1
  ('Reduce Debt & Improve Credit', 'Complete Debt Inventory', 'List all debts with balances and interest rates', 1, 8),
  ('Reduce Debt & Improve Credit', 'Make Minimum Payments', 'Ensure all minimum payments are made on time', 1, 12),
  
  -- Start Investing & Building Wealth - Level 1
  ('Start Investing & Building Wealth', 'Learn Investment Basics', 'Read about investing fundamentals daily', 1, 10),
  
  -- Master Personal Finance - Level 1
  ('Master Personal Finance', 'Daily Financial News', 'Read financial news to build money awareness', 1, 8),
  ('Master Personal Finance', 'Budget Awareness Check', 'Review daily spending against budget', 1, 10)
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
  -- Build Emergency Fund - Level 2
  ('Build Emergency Fund', 'Weekly Budget Review', 'Analyze weekly spending and adjust budget', 2, 18),
  ('Build Emergency Fund', 'Increased Emergency Savings', 'Save $5 daily for emergency fund', 2, 20),
  
  -- Reduce Debt & Improve Credit - Level 2
  ('Reduce Debt & Improve Credit', 'Extra Debt Payment', 'Pay extra $25/month toward highest interest debt', 2, 22),
  ('Reduce Debt & Improve Credit', 'Credit Score Monitoring', 'Check and track credit score monthly', 2, 15),
  
  -- Start Investing & Building Wealth - Level 2
  ('Start Investing & Building Wealth', 'Investment Account Setup', 'Open investment account and start with index funds', 2, 25),
  ('Start Investing & Building Wealth', 'Monthly Investment', 'Invest $50 monthly in diversified portfolio', 2, 20),
  
  -- Master Personal Finance - Level 2
  ('Master Personal Finance', 'Monthly Financial Review', 'Comprehensive monthly financial health check', 2, 18)
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
  -- Build Emergency Fund - Level 3
  ('Build Emergency Fund', 'Advanced Budget Optimization', 'Optimize budget for maximum emergency savings', 3, 30),
  ('Build Emergency Fund', 'Aggressive Emergency Savings', 'Save $10 daily for emergency fund completion', 3, 35),
  
  -- Reduce Debt & Improve Credit - Level 3
  ('Reduce Debt & Improve Credit', 'Significant Debt Payment', 'Pay extra $100/month toward debt elimination', 3, 40),
  ('Reduce Debt & Improve Credit', 'Credit Optimization Strategy', 'Implement advanced credit improvement tactics', 3, 32),
  
  -- Start Investing & Building Wealth - Level 3
  ('Start Investing & Building Wealth', 'Portfolio Diversification', 'Diversify investments and increase to $200/month', 3, 35),
  ('Start Investing & Building Wealth', 'Investment Research', 'Research and analyze investment opportunities weekly', 3, 30),
  
  -- Master Personal Finance - Level 3
  ('Master Personal Finance', 'Tax Strategy Planning', 'Develop tax optimization and planning strategies', 3, 38)
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
  -- Build Emergency Fund - Level 4
  ('Build Emergency Fund', 'Financial Automation System', 'Automate all savings and bill payments', 4, 50),
  ('Build Emergency Fund', 'Emergency Fund Mastery', 'Maintain 6-month emergency fund with $20+/day savings', 4, 55),
  
  -- Reduce Debt & Improve Credit - Level 4
  ('Reduce Debt & Improve Credit', 'Debt Freedom Strategy', 'Execute advanced debt elimination plan ($200+/month)', 4, 60),
  ('Reduce Debt & Improve Credit', 'Credit Score Mastery', 'Achieve and maintain excellent credit score (750+)', 4, 45),
  
  -- Start Investing & Building Wealth - Level 4
  ('Start Investing & Building Wealth', 'Advanced Investment Strategy', 'Invest $500+/month with sophisticated strategies', 4, 60),
  ('Start Investing & Building Wealth', 'Wealth Building Mastery', 'Implement comprehensive wealth building plan', 4, 55),
  
  -- Master Personal Finance - Level 4
  ('Master Personal Finance', 'Financial Planning Mastery', 'Complete financial planning and wealth optimization', 4, 50),
  ('Master Personal Finance', 'Money Mentorship', 'Help others with financial planning and education', 4, 45)
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
WHERE c.name = 'Finance'
GROUP BY c.name, g.name
ORDER BY g.name;

-- Show total counts
SELECT 
  'Finance Goals' as type,
  COUNT(*) as count
FROM goals g
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Finance'

UNION ALL

SELECT 
  'Finance Habits' as type,
  COUNT(*) as count
FROM habits h
JOIN goals g ON h.goal_id = g.id
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Finance';