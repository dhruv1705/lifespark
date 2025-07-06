import { Category, Goal, Habit } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Physical Health',
    emoji: '💪',
    description: 'Build strength, endurance, and overall fitness',
  },
  {
    id: '2',
    name: 'Mental Health',
    emoji: '🧠',
    description: 'Improve mindfulness, reduce stress, and boost mood',
  },
  {
    id: '3',
    name: 'Finance',
    emoji: '💰',
    description: 'Build wealth, save money, and financial planning',
  },
  {
    id: '4',
    name: 'Social',
    emoji: '👥',
    description: 'Strengthen relationships and social connections',
  },
];

export const goals: Goal[] = [
  {
    id: '1',
    categoryId: '1',
    name: 'Lose Weight',
    description: 'Achieve healthy weight through diet and exercise',
    duration: '8-12 weeks',
    progress: 72,
  },
  {
    id: '2',
    categoryId: '1',
    name: 'Build Muscle',
    description: 'Increase muscle mass and strength',
    duration: '12-16 weeks',
    progress: 45,
  },
  {
    id: '3',
    categoryId: '1',
    name: 'Improve Cardio',
    description: 'Enhance cardiovascular endurance',
    duration: '6-8 weeks',
    progress: 88,
  },
];

export const habits: Habit[] = [
  // Level 1: Foundation
  {
    id: '1',
    goalId: '1',
    name: '5-min Morning Stretch',
    description: 'Start your day with gentle stretching',
    level: 1,
    xp: 10,
    completed: true,
  },
  {
    id: '2',
    goalId: '1',
    name: 'Track Water Intake',
    description: 'Log your daily water consumption',
    level: 1,
    xp: 8,
    completed: false,
  },
  {
    id: '3',
    goalId: '1',
    name: 'Healthy Breakfast',
    description: 'Start with a nutritious meal',
    level: 1,
    xp: 15,
    completed: true,
  },
  // Level 2: Building
  {
    id: '4',
    goalId: '1',
    name: '20-min Morning Run',
    description: 'Cardiovascular exercise to start the day',
    level: 2,
    xp: 25,
    completed: false,
  },
  {
    id: '5',
    goalId: '1',
    name: 'Meal Prep Sunday',
    description: 'Prepare healthy meals for the week',
    level: 2,
    xp: 30,
    completed: false,
  },
];