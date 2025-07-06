import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface DailyXPGoalProps {
  currentXP: number;
  goalXP: number;
  animated?: boolean;
}

export const DailyXPGoal: React.FC<DailyXPGoalProps> = ({ 
  currentXP, 
  goalXP, 
  animated = false 
}) => {
  const progress = Math.min(currentXP / goalXP, 1);
  const progressPercentage = Math.round(progress * 100);
  const isGoalReached = currentXP >= goalXP;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily XP Goal</Text>
        <Text style={[styles.status, isGoalReached && styles.statusCompleted]}>
          {isGoalReached ? '🎉 Goal Reached!' : `${currentXP}/${goalXP} XP`}
        </Text>
      </View>
      
      {/* Circular progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.circularProgress}>
          <View style={[styles.progressRing, { borderColor: isGoalReached ? theme.colors.success : theme.colors.secondary.orange }]}>
            <View style={styles.innerCircle}>
              <Text style={[styles.percentageText, isGoalReached && styles.percentageCompleted]}>
                {isGoalReached ? '✓' : `${progressPercentage}%`}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.goalInfo}>
          <Text style={styles.currentXP}>{currentXP.toLocaleString()}</Text>
          <Text style={styles.goalLabel}>XP earned today</Text>
          {!isGoalReached && (
            <Text style={styles.remaining}>
              {(goalXP - currentXP).toLocaleString()} XP to go
            </Text>
          )}
        </View>
      </View>
      
      {/* Linear progress bar */}
      <View style={styles.linearProgressContainer}>
        <View style={styles.linearProgressBar}>
          <View 
            style={[
              styles.linearProgressFill, 
              { 
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: isGoalReached ? theme.colors.success : theme.colors.secondary.orange,
              }
            ]} 
          />
        </View>
      </View>
      
      {isGoalReached && (
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationText}>Amazing work! 🌟</Text>
          <Text style={styles.celebrationSubtext}>You've reached your daily goal!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  status: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  statusCompleted: {
    color: theme.colors.success,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  circularProgress: {
    marginRight: 20,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: theme.colors.secondary.orange,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
  },
  percentageCompleted: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.title,
  },
  goalInfo: {
    flex: 1,
  },
  currentXP: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  goalLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  remaining: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.secondary.orange,
    fontWeight: theme.typography.weights.medium,
  },
  linearProgressContainer: {
    marginBottom: theme.spacing.lg,
  },
  linearProgressBar: {
    height: 8,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  linearProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.sm,
  },
  celebrationContainer: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#f8fff8',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  celebrationText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  celebrationSubtext: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
});