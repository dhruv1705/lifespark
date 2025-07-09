import React from 'react';
import { ConfettiCelebration } from './ConfettiCelebration';
import { CelebrationPopup } from './CelebrationPopup';
import { useCelebration } from '../context/CelebrationContext';

export const CelebrationOverlay: React.FC = () => {
  const { currentCelebration, showConfetti, showPopup, dismissCelebration } = useCelebration();

  const getConfettiProps = () => {
    if (!currentCelebration) return { visible: false };

    const baseProps = {
      visible: showConfetti,
      intensity: currentCelebration.intensity,
      duration: currentCelebration.duration || 3000,
    };

    switch (currentCelebration.type) {
      case 'habit_completed':
        return {
          ...baseProps,
          colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107'],
          emojis: ['✅', '🌟', '💪', '🎯'],
        };
      case 'streak_milestone':
        return {
          ...baseProps,
          colors: ['#FF6B35', '#FF8F00', '#FFA726', '#FFB74D'],
          emojis: ['🔥', '⚡', '💥', '🌟'],
        };
      case 'level_up':
        return {
          ...baseProps,
          colors: ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7'],
          emojis: ['🆙', '🏆', '⭐', '🌟'],
        };
      case 'achievement_unlocked':
        return {
          ...baseProps,
          colors: ['#FFD700', '#FFA726', '#FF8F00', '#FF6F00'],
          emojis: ['🏆', '🏅', '⭐', '🌟'],
        };
      case 'daily_goal':
        return {
          ...baseProps,
          colors: ['#2196F3', '#42A5F5', '#64B5F6', '#90CAF9'],
          emojis: ['🎯', '✨', '🏆', '🌟'],
        };
      default:
        return baseProps;
    }
  };

  return (
    <>
      <ConfettiCelebration {...getConfettiProps()} />
      <CelebrationPopup
        visible={showPopup}
        celebration={currentCelebration}
        onDismiss={dismissCelebration}
      />
    </>
  );
};