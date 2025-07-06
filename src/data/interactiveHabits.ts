import { Habit, HabitStep } from '../types';

// Push-ups habit data with rep-based structure
export const pushUpsSteps: HabitStep[] = [
  {
    id: 'pushup-prep',
    title: 'Warm-up',
    description: 'Prepare your body for strength building',
    duration: 30,
    instructions: [
      'Get into plank position',
      'Check your form - straight line from head to heels',
      'Do 5 arm circles to warm up shoulders',
      'Take a deep breath - you\'ve got this!'
    ]
  },
  {
    id: 'pushup-1',
    title: 'Push-up #1',
    description: 'Perfect form, controlled movement',
    duration: 15,
    instructions: [
      'Lower your chest toward the floor',
      'Keep your core tight and engaged',
      'Push up explosively but controlled',
      'Focus on quality over speed'
    ]
  },
  {
    id: 'pushup-2',
    title: 'Push-up #2',
    description: 'Building momentum and strength',
    duration: 15,
    instructions: [
      'Reset your position if needed',
      'Lower down slowly, 2-3 seconds',
      'Feel your chest and arms working',
      'Push up with power!'
    ]
  },
  {
    id: 'pushup-3',
    title: 'Push-up #3',
    description: 'Finding your rhythm',
    duration: 15,
    instructions: [
      'You\'re in the zone now',
      'Maintain that perfect plank',
      'Breathe out as you push up',
      'Feel stronger with each rep'
    ]
  },
  {
    id: 'pushup-4',
    title: 'Push-up #4',
    description: 'Strength is building',
    duration: 15,
    instructions: [
      'Halfway to your goal!',
      'Keep that core engaged',
      'Lower with control',
      'Explode up with confidence'
    ]
  },
  {
    id: 'pushup-5',
    title: 'Push-up #5',
    description: 'Halfway there, powerhouse!',
    duration: 20,
    instructions: [
      'Take an extra moment to reset',
      'You\'re building real strength',
      'Perfect form is your priority',
      'Show that floor who\'s boss!'
    ]
  },
  {
    id: 'pushup-6',
    title: 'Push-up #6',
    description: 'Past the halfway mark',
    duration: 15,
    instructions: [
      'Your muscles are getting stronger',
      'Every rep counts',
      'Lower down, feel the stretch',
      'Power back up!'
    ]
  },
  {
    id: 'pushup-7',
    title: 'Push-up #7',
    description: 'Digging deep for strength',
    duration: 15,
    instructions: [
      'This is where champions are made',
      'Your body is capable of amazing things',
      'Controlled descent',
      'Explosive ascent'
    ]
  },
  {
    id: 'pushup-8',
    title: 'Push-up #8',
    description: 'Almost there, stay strong!',
    duration: 15,
    instructions: [
      'Only 2 more after this one',
      'You\'re crushing this challenge',
      'Feel that strength in your arms',
      'Push through like the warrior you are'
    ]
  },
  {
    id: 'pushup-9',
    title: 'Push-up #9',
    description: 'One more after this!',
    duration: 15,
    instructions: [
      'You can taste victory',
      'Every muscle working together',
      'Perfect form to the finish',
      'One more rep to glory!'
    ]
  },
  {
    id: 'pushup-10',
    title: 'Push-up #10',
    description: 'FINAL REP - FINISH STRONG!',
    duration: 20,
    instructions: [
      'This is it - your moment!',
      'Lower down with pride',
      'Feel every muscle working',
      'EXPLODE UP AND CELEBRATE!'
    ]
  }
];

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

  // Check if this is the push-ups habit
  if (baseHabit.name.toLowerCase().includes('push-up') || 
      baseHabit.name.toLowerCase().includes('pushup') ||
      baseHabit.name.toLowerCase().includes('push up')) {
    return {
      ...baseHabit,
      executionType: 'guided',
      duration: 195, // ~3.25 minutes total (30s prep + 11 reps × 15s average)
      steps: pushUpsSteps,
      instructions: [
        'Find space for your body length',
        'Warm up with arm circles first',
        'Focus on proper form over speed',
        'Keep your core engaged throughout',
        'Push through - you\'ve got this!'
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