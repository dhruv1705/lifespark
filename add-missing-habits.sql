-- Insert additional habits for Build Muscle goal
INSERT INTO public.habits (goal_id, name, description, level, xp)
SELECT 
  g.id,
  habit_name,
  habit_description,
  habit_level,
  habit_xp
FROM public.goals g,
(VALUES 
  ('10 Push-ups', 'Daily push-ups to build upper body strength', 1, 12),
  ('10 Squats', 'Daily squats to build leg strength', 1, 12),
  ('5-min Plank Hold', 'Core strengthening exercise', 1, 10),
  ('20 Push-ups + 20 Squats', 'Increased bodyweight training', 2, 20),
  ('Gym Session (3x/week)', 'Structured weight training workout', 2, 35),
  ('Progressive Overload', 'Increase weights or reps weekly', 3, 40),
  ('Full Body Circuit', 'Complete bodyweight circuit training', 3, 45),
  ('Advanced Compound Lifts', 'Deadlifts, squats, bench press routine', 4, 50)
) AS habits(habit_name, habit_description, habit_level, habit_xp)
WHERE g.name = 'Build Muscle';

-- Insert additional habits for Improve Cardio goal
INSERT INTO public.habits (goal_id, name, description, level, xp)
SELECT 
  g.id,
  habit_name,
  habit_description,
  habit_level,
  habit_xp
FROM public.goals g,
(VALUES 
  ('5-min Walk', 'Daily gentle walk to build cardio base', 1, 8),
  ('Climb 2 Flights of Stairs', 'Daily stair climbing for cardio', 1, 10),
  ('10-min Dance/Movement', 'Fun cardio activity', 1, 12),
  ('15-min Brisk Walk', 'Moderate intensity walking', 2, 18),
  ('20-min Bike Ride', 'Cycling for cardiovascular fitness', 2, 25),
  ('30-min Cardio Session', 'Structured cardio workout', 3, 35),
  ('45-min Mixed Cardio', 'Varied cardio activities', 3, 40),
  ('60-min Endurance Training', 'Long-form cardio for endurance', 4, 50)
) AS habits(habit_name, habit_description, habit_level, habit_xp)
WHERE g.name = 'Improve Cardio';