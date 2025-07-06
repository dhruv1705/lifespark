-- Enable Row Level Security
alter table if exists public.users enable row level security;
alter table if exists public.categories enable row level security;
alter table if exists public.goals enable row level security;
alter table if exists public.habits enable row level security;
alter table if exists public.user_goals enable row level security;
alter table if exists public.user_habits enable row level security;
alter table if exists public.daily_completions enable row level security;

-- Create tables
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  emoji text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.goals (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  description text not null,
  duration text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.habits (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  name text not null,
  description text not null,
  level integer not null default 1,
  xp integer not null default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.user_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade not null,
  progress integer default 0 not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, goal_id)
);

create table public.user_habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_at timestamp with time zone,
  streak integer default 0 not null,
  total_completions integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, habit_id)
);

create table public.daily_completions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_date date not null,
  xp_earned integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, habit_id, completed_date)
);

-- Row Level Security Policies

-- Users can only see and update their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Categories are readable by all authenticated users
create policy "Categories are viewable by authenticated users" on public.categories
  for select using (auth.role() = 'authenticated');

-- Goals are readable by all authenticated users
create policy "Goals are viewable by authenticated users" on public.goals
  for select using (auth.role() = 'authenticated');

-- Habits are readable by all authenticated users
create policy "Habits are viewable by authenticated users" on public.habits
  for select using (auth.role() = 'authenticated');

-- User goals - users can only see/modify their own
create policy "Users can view own goals" on public.user_goals
  for select using (auth.uid() = user_id);

create policy "Users can insert own goals" on public.user_goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update own goals" on public.user_goals
  for update using (auth.uid() = user_id);

-- User habits - users can only see/modify their own
create policy "Users can view own habits" on public.user_habits
  for select using (auth.uid() = user_id);

create policy "Users can insert own habits" on public.user_habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update own habits" on public.user_habits
  for update using (auth.uid() = user_id);

-- Daily completions - users can only see/modify their own
create policy "Users can view own completions" on public.daily_completions
  for select using (auth.uid() = user_id);

create policy "Users can insert own completions" on public.daily_completions
  for insert with check (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert default categories
insert into public.categories (name, emoji, description) values
  ('Physical Health', '💪', 'Build strength, endurance, and overall fitness'),
  ('Mental Health', '🧠', 'Improve mindfulness, reduce stress, and boost mood'),
  ('Finance', '💰', 'Build wealth, save money, and financial planning'),
  ('Social', '👥', 'Strengthen relationships and social connections');

-- Insert default goals for Physical Health category
insert into public.goals (category_id, name, description, duration) 
select 
  c.id,
  goal_name,
  goal_description,
  goal_duration
from public.categories c,
(values 
  ('Lose Weight', 'Achieve healthy weight through diet and exercise', '8-12 weeks'),
  ('Build Muscle', 'Increase muscle mass and strength', '12-16 weeks'),
  ('Improve Cardio', 'Enhance cardiovascular endurance', '6-8 weeks')
) as goals(goal_name, goal_description, goal_duration)
where c.name = 'Physical Health';

-- Insert default habits for the Lose Weight goal
insert into public.habits (goal_id, name, description, level, xp)
select 
  g.id,
  habit_name,
  habit_description,
  habit_level,
  habit_xp
from public.goals g,
(values 
  ('5-min Morning Stretch', 'Start your day with gentle stretching', 1, 10),
  ('Track Water Intake', 'Log your daily water consumption', 1, 8),
  ('Healthy Breakfast', 'Start with a nutritious meal', 1, 15),
  ('20-min Morning Run', 'Cardiovascular exercise to start the day', 2, 25),
  ('Meal Prep Sunday', 'Prepare healthy meals for the week', 2, 30)
) as habits(habit_name, habit_description, habit_level, habit_xp)
where g.name = 'Lose Weight';

-- Insert default habits for the Build Muscle goal
insert into public.habits (goal_id, name, description, level, xp)
select 
  g.id,
  habit_name,
  habit_description,
  habit_level,
  habit_xp
from public.goals g,
(values 
  ('10 Push-ups', 'Daily push-ups to build upper body strength', 1, 12),
  ('10 Squats', 'Daily squats to build leg strength', 1, 12),
  ('5-min Plank Hold', 'Core strengthening exercise', 1, 10),
  ('20 Push-ups + 20 Squats', 'Increased bodyweight training', 2, 20),
  ('Gym Session (3x/week)', 'Structured weight training workout', 2, 35),
  ('Progressive Overload', 'Increase weights or reps weekly', 3, 40),
  ('Full Body Circuit', 'Complete bodyweight circuit training', 3, 45),
  ('Advanced Compound Lifts', 'Deadlifts, squats, bench press routine', 4, 50)
) as habits(habit_name, habit_description, habit_level, habit_xp)
where g.name = 'Build Muscle';

-- Insert default habits for the Improve Cardio goal
insert into public.habits (goal_id, name, description, level, xp)
select 
  g.id,
  habit_name,
  habit_description,
  habit_level,
  habit_xp
from public.goals g,
(values 
  ('5-min Walk', 'Daily gentle walk to build cardio base', 1, 8),
  ('Climb 2 Flights of Stairs', 'Daily stair climbing for cardio', 1, 10),
  ('10-min Dance/Movement', 'Fun cardio activity', 1, 12),
  ('15-min Brisk Walk', 'Moderate intensity walking', 2, 18),
  ('20-min Bike Ride', 'Cycling for cardiovascular fitness', 2, 25),
  ('30-min Cardio Session', 'Structured cardio workout', 3, 35),
  ('45-min Mixed Cardio', 'Varied cardio activities', 3, 40),
  ('60-min Endurance Training', 'Long-form cardio for endurance', 4, 50)
) as habits(habit_name, habit_description, habit_level, habit_xp)
where g.name = 'Improve Cardio';