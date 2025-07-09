import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CelebrationConfig {
  type: 'habit_completed' | 'streak_milestone' | 'daily_goal' | 'level_up' | 'achievement_unlocked';
  intensity: 'low' | 'medium' | 'high';
  duration?: number;
  message?: string;
  emoji?: string;
  title?: string;
  subtitle?: string;
}

interface CelebrationContextType {
  triggerCelebration: (config: CelebrationConfig) => void;
  currentCelebration: CelebrationConfig | null;
  showConfetti: boolean;
  showPopup: boolean;
  dismissCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export const useCelebration = () => {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
};

interface CelebrationProviderProps {
  children: ReactNode;
}

export const CelebrationProvider: React.FC<CelebrationProviderProps> = ({ children }) => {
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationConfig | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const triggerCelebration = useCallback((config: CelebrationConfig) => {
    setCurrentCelebration(config);
    setShowConfetti(true);
    
    // Show popup for certain celebration types
    if (config.type === 'streak_milestone' || config.type === 'level_up' || config.type === 'achievement_unlocked') {
      setShowPopup(true);
    }

    // Auto-dismiss after duration
    const duration = config.duration || 3000;
    setTimeout(() => {
      setShowConfetti(false);
      setTimeout(() => {
        setShowPopup(false);
        setCurrentCelebration(null);
      }, 500); // Small delay to let confetti finish
    }, duration);
  }, []);

  const dismissCelebration = useCallback(() => {
    setShowConfetti(false);
    setShowPopup(false);
    setTimeout(() => {
      setCurrentCelebration(null);
    }, 300);
  }, []);

  return (
    <CelebrationContext.Provider
      value={{
        triggerCelebration,
        currentCelebration,
        showConfetti,
        showPopup,
        dismissCelebration,
      }}
    >
      {children}
    </CelebrationContext.Provider>
  );
};