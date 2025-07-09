import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { theme } from '../theme';

interface DynamicInstructionsProps {
  instructions: string[];
  stepDuration: number; // Total step duration in seconds
  isActive: boolean; // Whether the timer is running
  isPaused: boolean; // Whether the timer is paused
  stepTimeRemaining: number; // Current step time remaining
  onInstructionChange?: (currentIndex: number, instruction: string) => void;
}

export const DynamicInstructions: React.FC<DynamicInstructionsProps> = ({
  instructions,
  stepDuration,
  isActive,
  isPaused,
  stepTimeRemaining,
  onInstructionChange,
}) => {
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const fadeAnim = new Animated.Value(1);

  // Calculate how long each instruction should display
  const instructionDuration = Math.floor(stepDuration / instructions.length);
  const currentInstruction = instructions[currentInstructionIndex] || '';
  
  // Calculate elapsed time from remaining time
  const stepTimeElapsed = stepDuration - stepTimeRemaining;
  
  // Determine which instruction should be showing based on elapsed time
  const expectedInstructionIndex = Math.min(
    Math.floor(stepTimeElapsed / instructionDuration),
    instructions.length - 1
  );

  // Update instruction index when it should change
  useEffect(() => {
    if (expectedInstructionIndex !== currentInstructionIndex && expectedInstructionIndex >= 0) {
      // Fade out current instruction
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Move to next instruction
        setCurrentInstructionIndex(expectedInstructionIndex);
        
        // Notify parent of instruction change
        if (onInstructionChange) {
          onInstructionChange(expectedInstructionIndex, instructions[expectedInstructionIndex]);
        }

        // Fade in new instruction
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [expectedInstructionIndex, currentInstructionIndex, onInstructionChange, instructions]);

  // Reset when instructions change or step restarts
  useEffect(() => {
    setCurrentInstructionIndex(0);
    fadeAnim.setValue(1);
  }, [instructions, stepDuration]);

  // Calculate progress for current instruction
  const instructionTimeElapsed = stepTimeElapsed % instructionDuration;
  const instructionProgress = instructionTimeElapsed / instructionDuration;

  if (instructions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {currentInstructionIndex + 1} of {instructions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(instructionProgress * 100, 100)}%` }
            ]} 
          />
        </View>
      </View>

      {/* Dynamic Instruction */}
      <Animated.View style={[styles.instructionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.instructionText}>
          {currentInstruction}
        </Text>
      </Animated.View>

      {/* Instruction Dots */}
      <View style={styles.dotsContainer}>
        {instructions.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              index === currentInstructionIndex && styles.activeDot,
              index < currentInstructionIndex && styles.completedDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: 2,
    marginLeft: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.green,
    borderRadius: 2,
  },
  instructionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    minHeight: 80,
  },
  instructionText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
    flexShrink: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.neutral.lightGray,
  },
  activeDot: {
    backgroundColor: theme.colors.primary.green,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedDot: {
    backgroundColor: theme.colors.primary.blue,
  },
});