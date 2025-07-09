import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { MascotMood, MascotEvolution, CharacterType } from '../components/MotivationMascot';
import { settingsStorage } from '../services/settingsStorage';

interface UserProgress {
  totalXP: number;
  currentStreak: number;
  completedHabitsToday: number;
  level: number;
  habitsThisWeek: number;
}

interface CharacterState {
  characterType: CharacterType;
  mood: MascotMood;
  evolution: MascotEvolution;
  currentMessage: string;
  lastInteraction: Date;
  personalityTraits: string[];
}

interface CharacterContextType {
  characterState: CharacterState;
  updateCharacterProgress: (progress: UserProgress) => void;
  triggerCharacterMessage: (message: string, mood?: MascotMood) => void;
  getMotivationalMessage: (context: 'morning' | 'evening' | 'achievement' | 'encouragement') => string;
  interactWithCharacter: () => void;
  selectCharacter: (characterType: CharacterType) => void;
  availableCharacters: CharacterType[];
  isCharacterSelected: boolean;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [characterState, setCharacterState] = useState<CharacterState>({
    characterType: 'plant', // Default to plant for existing users
    mood: 'happy',
    evolution: 'sprout',
    currentMessage: '',
    lastInteraction: new Date(),
    personalityTraits: ['encouraging', 'friendly', 'wise'],
  });

  const [isCharacterSelected, setIsCharacterSelected] = useState(false);
  const availableCharacters: CharacterType[] = ['plant', 'dog', 'cat', 'owl', 'penguin'];

  // Load saved character preferences on mount
  useEffect(() => {
    const loadCharacterPreferences = async () => {
      try {
        const selectedCharacter = await settingsStorage.getSelectedCharacter();
        const hasCompleted = await settingsStorage.hasCompletedCharacterSelection();
        
        setCharacterState(prev => ({
          ...prev,
          characterType: selectedCharacter,
          personalityTraits: getCharacterPersonality(selectedCharacter),
        }));
        
        setIsCharacterSelected(hasCompleted);
      } catch (error) {
        console.error('Error loading character preferences:', error);
      }
    };
    
    loadCharacterPreferences();
  }, []);

  // Calculate evolution based on user progress
  const calculateEvolution = (progress: UserProgress): MascotEvolution => {
    const { totalXP, currentStreak, level } = progress;
    
    if (totalXP >= 1000 || currentStreak >= 50 || level >= 10) {
      return 'legendary';
    } else if (totalXP >= 500 || currentStreak >= 20 || level >= 7) {
      return 'flourishing';
    } else if (totalXP >= 200 || currentStreak >= 10 || level >= 4) {
      return 'blooming';
    } else if (totalXP >= 50 || currentStreak >= 3 || level >= 2) {
      return 'growing';
    } else {
      return 'sprout';
    }
  };

  // Determine mood based on recent activity
  const calculateMood = (progress: UserProgress): MascotMood => {
    const { completedHabitsToday, currentStreak, habitsThisWeek } = progress;
    const hour = new Date().getHours();
    
    // Time-based moods
    if (hour >= 22 || hour <= 6) {
      return 'sleepy';
    }
    
    // Achievement-based moods
    if (completedHabitsToday >= 5) {
      return 'celebrating';
    } else if (completedHabitsToday >= 3) {
      return 'proud';
    } else if (currentStreak >= 7) {
      return 'excited';
    } else if (habitsThisWeek < 3) {
      return 'worried';
    } else if (completedHabitsToday >= 1) {
      return 'happy';
    } else {
      return 'encouraging';
    }
  };

  const updateCharacterProgress = useCallback((progress: UserProgress) => {
    const newEvolution = calculateEvolution(progress);
    const newMood = calculateMood(progress);
    
    setCharacterState(prev => ({
      ...prev,
      mood: newMood,
      evolution: newEvolution,
    }));
  }, []);

  const triggerCharacterMessage = useCallback((message: string, mood?: MascotMood) => {
    setCharacterState(prev => ({
      ...prev,
      currentMessage: message,
      mood: mood || prev.mood,
      lastInteraction: new Date(),
    }));

    // Clear message after 4 seconds
    setTimeout(() => {
      setCharacterState(prev => ({
        ...prev,
        currentMessage: '',
      }));
    }, 4000);
  }, []);

  const getMotivationalMessage = useCallback((context: 'morning' | 'evening' | 'achievement' | 'encouragement'): string => {
    const messages = {
      morning: [
        "Good morning! Ready to crush today's habits?",
        "Rise and shine! Let's make today amazing!",
        "Morning, champion! What shall we accomplish today?",
        "A new day, a new chance to grow! 🌱",
        "Good morning! I believe in you today!"
      ],
      evening: [
        "How did today go? I'm proud of your efforts!",
        "Evening reflection time - you did great today!",
        "Another day of growth complete! Well done!",
        "Time to rest and recharge for tomorrow! 🌙",
        "You showed up today, and that's what matters!"
      ],
      achievement: [
        "Incredible work! You're absolutely crushing it! 🔥",
        "That's what I'm talking about! Amazing!",
        "You're becoming unstoppable! Keep going!",
        "Wow! That achievement was epic! 🏆",
        "Look at you go! I'm so proud! ✨"
      ],
      encouragement: [
        "Don't give up! You're closer than you think!",
        "Every small step counts! Keep moving forward!",
        "I believe in you! You've got this! 💪",
        "Progress isn't always perfect, and that's okay!",
        "Remember why you started - you're worth it!"
      ]
    };

    const contextMessages = messages[context];
    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
  }, []);

  const selectCharacter = useCallback(async (characterType: CharacterType) => {
    try {
      // Save to storage
      await settingsStorage.selectCharacter(characterType);
      
      // Update state
      setCharacterState(prev => ({
        ...prev,
        characterType,
        personalityTraits: getCharacterPersonality(characterType),
      }));
      setIsCharacterSelected(true);
      
      // Welcome message for new character
      const welcomeMessages = {
        plant: "Hello! I'm excited to grow with you! 🌱",
        dog: "Woof! I'm your loyal companion! Ready for adventure! 🐕",
        cat: "Meow... I suppose I'll help you with your habits. 😸",
        owl: "Hoot! Wise habits lead to a wise life. Let's learn together! 🦉",
        penguin: "Squawk! Let's march towards your goals together! 🐧"
      };
      
      triggerCharacterMessage(welcomeMessages[characterType], 'excited');
    } catch (error) {
      console.error('Error selecting character:', error);
    }
  }, [triggerCharacterMessage]);

  const getCharacterPersonality = (characterType: CharacterType): string[] => {
    const personalities = {
      plant: ['encouraging', 'patient', 'growing'],
      dog: ['loyal', 'enthusiastic', 'supportive'],
      cat: ['independent', 'wise', 'sassy'],
      owl: ['wise', 'patient', 'knowledgeable'],
      penguin: ['determined', 'community-focused', 'resilient']
    };
    
    return personalities[characterType];
  };

  const interactWithCharacter = useCallback(() => {
    const characterMessages = {
      plant: [
        "Growing strong together! 🌱",
        "Every day you bloom a little more!",
        "Rooting for you always! 🌿",
        "Watch yourself flourish! 🌺"
      ],
      dog: [
        "You're the best human ever! 🐕",
        "Woof! Let's play... I mean, work on habits!",
        "I believe in you 100%! 🎾",
        "Every habit is a new trick learned!"
      ],
      cat: [
        "I suppose you're doing... adequately. 😸",
        "Purr... not bad for a human.",
        "I'm impressed. Don't let it go to your head. 😏",
        "You've earned my respect today. 🐾"
      ],
      owl: [
        "Wisdom grows with each habit! 🦉",
        "Remember, knowledge is earned through practice.",
        "Every step forward is a lesson learned. 📚",
        "The wise build habits, habits build the wise."
      ],
      penguin: [
        "Waddle on! We're marching to success! 🐧",
        "Together we slide towards greatness!",
        "Cold never stopped a penguin! ❄️",
        "March with me towards your goals! 👑"
      ]
    };

    const messages = characterMessages[characterState.characterType];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    triggerCharacterMessage(randomMessage, 'happy');
  }, [characterState.characterType, triggerCharacterMessage]);

  // Auto-generate contextual messages based on time
  useEffect(() => {
    const generateContextualMessage = () => {
      const hour = new Date().getHours();
      let context: 'morning' | 'evening' | 'encouragement' = 'encouragement';
      
      if (hour >= 6 && hour <= 11) {
        context = 'morning';
      } else if (hour >= 18 && hour <= 22) {
        context = 'evening';
      }
      
      // Show contextual message occasionally
      if (Math.random() > 0.8) {
        const message = getMotivationalMessage(context);
        triggerCharacterMessage(message);
      }
    };

    // Check for contextual messages every 30 minutes
    const interval = setInterval(generateContextualMessage, 30 * 60 * 1000);
    
    // Generate initial message
    setTimeout(generateContextualMessage, 2000);

    return () => clearInterval(interval);
  }, [getMotivationalMessage, triggerCharacterMessage]);

  return (
    <CharacterContext.Provider
      value={{
        characterState,
        updateCharacterProgress,
        triggerCharacterMessage,
        getMotivationalMessage,
        interactWithCharacter,
        selectCharacter,
        availableCharacters,
        isCharacterSelected,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};