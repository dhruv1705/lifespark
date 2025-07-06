# Lifespark - Duolingo for Life Goals

A React Native app inspired by Duolingo that helps users build positive life habits through gamification.

## 🎯 Features

- **Categories**: Physical Health, Mental Health, Finance, Social
- **Goals**: Specific objectives within each category (8-16 week duration)
- **Habits**: Daily actions with level progression (Foundation → Building → Power → Mastery)
- **XP System**: Earn points for completing habits
- **Progress Tracking**: Visual progress bars and completion statistics
- **Authentication**: Secure user accounts with Supabase

## 🏗️ Architecture

```
Categories (Life Areas)
├── Physical Health 💪
├── Mental Health 🧠  
├── Finance 💰
└── Social 👥
    └── Goals (Specific Objectives)
        ├── Lose Weight (8-12 weeks)
        ├── Build Muscle (12-16 weeks)
        └── Improve Cardio (6-8 weeks)
            └── Habits (Daily Actions)
                ├── Level 1: Foundation
                ├── Level 2: Building
                ├── Level 3: Power
                └── Level 4: Mastery
```

## 🚀 Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account

### Installation

1. **Clone and install dependencies**
   ```bash
   cd LifesparkApp
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL script in `supabase-setup.sql` in your Supabase SQL editor
   - Copy your project URL and anon key

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the app**
   ```bash
   npm start
   ```

## 📱 Usage

1. **Sign up/Sign in** with email and password
2. **Choose a category** from the main screen
3. **Select a goal** to work towards
4. **Complete daily habits** to earn XP and level up
5. **Track your progress** with visual indicators

## 🎮 Gamification Elements

- **XP Points**: 8-30 XP per habit completion
- **Levels**: Foundation (1) → Building (2) → Power (3) → Mastery (4)
- **Streaks**: Track consecutive days of habit completion
- **Progress Bars**: Visual feedback for goal completion
- **Achievements**: Unlock badges for milestones

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Navigation**: React Navigation 6
- **State Management**: React Context + Local State
- **Styling**: StyleSheet (React Native)

## 📊 Database Schema

- `users` - User profiles and authentication
- `categories` - Life areas (Physical Health, etc.)
- `goals` - Specific objectives within categories
- `habits` - Daily actions with XP values
- `user_goals` - User's goal enrollments and progress
- `user_habits` - User's habit tracking and streaks
- `daily_completions` - Daily habit completion records

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with Supabase Auth

## 🚧 Future Enhancements

- Push notifications for habit reminders
- Social features (friends, leaderboards)
- Advanced analytics and insights
- Custom habit creation
- Achievement system expansion
- Offline mode support