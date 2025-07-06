import { Habit, HabitStep } from '../types';

// Morning Stretch habit data with guided steps
export const morningStretchSteps: HabitStep[] = [
  {
    id: 'stretch-1',
    title: 'Neck Rolls',
    description: 'Gently roll your head to release neck tension',
    duration: 30,
    instructions: [
      'Stand or sit up straight',
      'Slowly drop your chin to your chest',
      'Gently roll your head to the right shoulder',
      'Continue rolling back and to the left',
      'Complete 3-4 slow, controlled circles each direction'
    ]
  },
  {
    id: 'stretch-2',
    title: 'Shoulder Shrugs & Rolls',
    description: 'Release shoulder tension and improve mobility',
    duration: 45,
    instructions: [
      'Lift both shoulders up to your ears',
      'Hold for 2 seconds, then release',
      'Repeat 5 times',
      'Now roll shoulders backward in large circles',
      'Complete 5 backward rolls, then 5 forward rolls'
    ]
  },
  {
    id: 'stretch-3',
    title: 'Arm Circles',
    description: 'Warm up your shoulder joints and arms',
    duration: 30,
    instructions: [
      'Extend both arms out to your sides',
      'Make small circles forward for 10 seconds',
      'Make larger circles forward for 10 seconds',
      'Reverse direction and repeat',
      'Keep your core engaged throughout'
    ]
  },
  {
    id: 'stretch-4',
    title: 'Torso Twists',
    description: 'Gently stretch your spine and core',
    duration: 60,
    instructions: [
      'Place hands on your hips',
      'Keep your hips facing forward',
      'Slowly twist your torso to the right',
      'Hold for 3 seconds, return to center',
      'Twist to the left and hold',
      'Repeat 8-10 times each direction'
    ]
  },
  {
    id: 'stretch-5',
    title: 'Standing Forward Fold',
    description: 'Stretch your back, hamstrings, and shoulders',
    duration: 45,
    instructions: [
      'Stand with feet hip-width apart',
      'Slowly bend forward from your hips',
      'Let your arms hang naturally',
      'Bend your knees slightly if needed',
      'Hold and breathe deeply',
      'Slowly roll up to standing'
    ]
  },
  {
    id: 'stretch-6',
    title: 'Gentle Back Arch',
    description: 'Open your chest and stretch your front body',
    duration: 30,
    instructions: [
      'Place hands on your lower back',
      'Slowly arch backward, looking up',
      'Only go as far as comfortable',
      'Hold for 10 seconds',
      'Return to neutral and repeat 2-3 times',
      'Finish with a gentle forward fold'
    ]
  }
];

// Function to get enhanced habit data for interactive habits
export const getInteractiveHabitData = (habitId: string, baseHabit: Habit): Habit => {
  // Check if this is the morning stretch habit
  if (baseHabit.name.toLowerCase().includes('morning stretch') || 
      baseHabit.name.toLowerCase().includes('stretch')) {
    return {
      ...baseHabit,
      executionType: 'guided',
      duration: 300, // 5 minutes total
      steps: morningStretchSteps,
      instructions: [
        'Find a quiet space with room to move',
        'Wear comfortable clothing',
        'Move slowly and listen to your body',
        'Breathe deeply throughout each stretch',
        'Stop if you feel any pain'
      ]
    };
  }

  // For other habits, return as simple toggle for now
  return {
    ...baseHabit,
    executionType: 'simple'
  };
};

// Helper function to calculate total duration of all steps
export const calculateTotalDuration = (steps: HabitStep[]): number => {
  return steps.reduce((total, step) => total + step.duration, 0);
};