import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';
import { useCelebration } from '../context/CelebrationContext';
import { AnimatedNumber } from './AnimatedNumber';

interface DailyXPGoalProps {
  currentXP: number;
  goalXP: number;
  animated?: boolean;
}

export const DailyXPGoal: React.FC<DailyXPGoalProps> = ({ 
  currentXP, 
  goalXP, 
  animated = true 
}) => {
  const { triggerCelebration } = useCelebration();
  const progress = Math.min(currentXP / goalXP, 1);
  const progressPercentage = Math.round(progress * 100);
  const isGoalReached = currentXP >= goalXP;
  const wasGoalReached = useRef(false);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (animated) {
      // Scale animation on mount
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Progress ring animation
      Animated.timing(ringAnim, {
        toValue: progress,
        duration: 2000,
        useNativeDriver: false,
      }).start();
      
      // Linear progress animation
      Animated.timing(progressAnim, {
        toValue: progressPercentage,
        duration: 1800,
        useNativeDriver: false,
      }).start();
      
      // Goal reached celebration
      if (isGoalReached && !wasGoalReached.current) {
        wasGoalReached.current = true;
        
        // Trigger celebration
        triggerCelebration({
          type: 'daily_goal',
          intensity: 'high',
          duration: 4000,
          title: 'Daily Goal Crushed!',
          subtitle: `Amazing! You earned ${currentXP} XP today!`,
          message: 'Keep up the incredible momentum! 🔥',
        });
        
        Animated.sequence([
          Animated.timing(celebrationAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start();
      }
    } else {
      progressAnim.setValue(progressPercentage);
      ringAnim.setValue(progress);
      scaleAnim.setValue(1);
    }
  }, [animated, progress, progressPercentage, isGoalReached]);
  
  // Get time-based urgency styling
  const getTimeBasedStyle = () => {
    const hour = new Date().getHours();
    if (hour >= 20 && !isGoalReached) return 'urgent';
    if (hour >= 16 && !isGoalReached) return 'warning';
    return 'normal';
  };
  
  const timeStyle = getTimeBasedStyle();
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Daily XP Goal</Text>
          {timeStyle === 'urgent' && <Text style={styles.urgentIndicator}>⏰ Time Running Out!</Text>}
          {timeStyle === 'warning' && <Text style={styles.warningIndicator}>⚡ Evening Push!</Text>}
        </View>
        <Animated.View style={[
          styles.statusContainer,
          isGoalReached && { transform: [{ scale: pulseAnim }] }
        ]}>
          <Text style={[styles.status, isGoalReached && styles.statusCompleted]}>
            {isGoalReached ? '🎉 Goal Crushed!' : `${currentXP}/${goalXP} XP`}
          </Text>
        </Animated.View>
      </View>
      
      {/* Enhanced circular progress indicator */}
      <View style={styles.progressContainer}>
        <Animated.View style={[
          styles.circularProgress,
          isGoalReached && { transform: [{ scale: celebrationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1]
          }) }] }
        ]}>
          {/* Outer glow ring for completed state */}
          {isGoalReached && (
            <Animated.View style={[
              styles.glowRing,
              { 
                opacity: celebrationAnim,
                transform: [{ scale: pulseAnim }]
              }
            ]} />
          )}
          
          {/* Main progress ring with SVG-like effect */}
          <View style={[
            styles.progressRing, 
            { 
              borderColor: isGoalReached ? theme.colors.success : theme.colors.secondary.orange,
              borderWidth: 8
            }
          ]}>
            {/* Animated progress arc overlay */}
            <Animated.View style={[
              styles.progressArc,
              {
                backgroundColor: isGoalReached ? theme.colors.success : theme.colors.secondary.orange,
                transform: [{
                  rotate: ringAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]} />
            
            <View style={styles.innerCircle}>
              <Animated.Text style={[
                styles.percentageText, 
                isGoalReached && styles.percentageCompleted,
                { transform: [{ scale: isGoalReached ? pulseAnim : 1 }] }
              ]}>
                {isGoalReached ? '🏆' : `${progressPercentage}%`}
              </Animated.Text>
              {!isGoalReached && (
                <View style={styles.sparkles}>
                  <Text style={styles.sparkle}>✨</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
        
        <View style={styles.goalInfo}>
          <Animated.View style={[
            { transform: [{ scale: isGoalReached ? pulseAnim : 1 }] }
          ]}>
            <AnimatedNumber
              value={currentXP}
              style={styles.currentXP}
              duration={1800}
              animated={animated}
              bounceOnChange={true}
            />
          </Animated.View>
          <Text style={styles.goalLabel}>XP earned today</Text>
          {!isGoalReached && (
            <View style={styles.remainingContainer}>
              <View style={styles.remainingTextContainer}>
                <AnimatedNumber
                  value={goalXP - currentXP}
                  style={[styles.remaining, timeStyle === 'urgent' && styles.remainingUrgent]}
                  suffix=" XP to go"
                  duration={1500}
                  animated={animated}
                  bounceOnChange={true}
                />
              </View>
              <Text style={styles.motivation}>
                {progress > 0.8 ? "So close! 💪" : progress > 0.5 ? "Keep going! 🔥" : "You got this! 🚀"}
              </Text>
            </View>
          )}
          {isGoalReached && (
            <Animated.View style={[
              styles.achievementBadge,
              { opacity: celebrationAnim }
            ]}>
              <Text style={styles.achievementText}>Daily Champion! 🎖️</Text>
            </Animated.View>
          )}
        </View>
      </View>
      
      {/* Enhanced linear progress bar */}
      <View style={styles.linearProgressContainer}>
        <View style={[styles.linearProgressBar, timeStyle === 'urgent' && styles.progressBarUrgent]}>
          <Animated.View 
            style={[
              styles.linearProgressFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp'
                }),
                backgroundColor: isGoalReached ? theme.colors.success : theme.colors.secondary.orange,
              }
            ]} 
          />
          {/* Progress shine effect */}
          <Animated.View style={[
            styles.progressShine,
            { opacity: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }) }
          ]} />
        </View>
        
        {/* Progress milestones */}
        <View style={styles.milestones}>
          {[25, 50, 75, 100].map((milestone) => (
            <View 
              key={milestone}
              style={[
                styles.milestone,
                progressPercentage >= milestone && styles.milestoneReached
              ]}
            >
              <Text style={[
                styles.milestoneText,
                progressPercentage >= milestone && styles.milestoneTextReached
              ]}>
                {milestone === 100 ? '🏆' : milestone === 75 ? '⭐' : milestone === 50 ? '🔥' : '💪'}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      {isGoalReached && (
        <Animated.View style={[
          styles.celebrationContainer,
          { 
            opacity: celebrationAnim,
            transform: [{ scale: celebrationAnim }]
          }
        ]}>
          <Text style={styles.celebrationText}>Incredible! 🌟</Text>
          <Text style={styles.celebrationSubtext}>Daily goal absolutely crushed!</Text>
          <View style={styles.confetti}>
            <Text style={styles.confettiPiece}>🎉</Text>
            <Text style={styles.confettiPiece}>✨</Text>
            <Text style={styles.confettiPiece}>🎊</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  
  // Header Styles
  header: {
    marginBottom: theme.spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  urgentIndicator: {
    fontSize: theme.typography.sizes.sm,
    color: '#E53E3E',
    fontWeight: theme.typography.weights.medium,
    backgroundColor: '#FED7D7',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  warningIndicator: {
    fontSize: theme.typography.sizes.sm,
    color: '#D69E2E',
    fontWeight: theme.typography.weights.medium,
    backgroundColor: '#FAF089',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  status: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusCompleted: {
    color: theme.colors.success,
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  
  // Enhanced Progress Container
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  circularProgress: {
    marginRight: theme.spacing.lg,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: theme.colors.success + '20',
    top: -10,
    left: -10,
    borderWidth: 2,
    borderColor: theme.colors.success + '40',
  },
  progressRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: theme.colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  progressArc: {
    position: 'absolute',
    width: 3,
    height: 35,
    top: -3,
    borderRadius: 2,
    transformOrigin: '1.5px 38px',
  },
  innerCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  percentageText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
  },
  percentageCompleted: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.xl,
  },
  sparkles: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  sparkle: {
    fontSize: 12,
    opacity: 0.7,
  },
  
  // Goal Info Styles
  goalInfo: {
    flex: 1,
  },
  currentXP: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  goalLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.weights.medium,
  },
  remainingContainer: {
    alignItems: 'flex-start',
  },
  remainingTextContainer: {
    alignItems: 'flex-start',
  },
  remaining: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.secondary.orange,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs / 2,
  },
  remainingUrgent: {
    color: '#E53E3E',
  },
  motivation: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  achievementBadge: {
    backgroundColor: '#F0FFF4',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.success,
    alignSelf: 'flex-start',
  },
  achievementText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.success,
    fontWeight: theme.typography.weights.bold,
  },
  
  // Enhanced Linear Progress
  linearProgressContainer: {
    marginBottom: theme.spacing.lg,
  },
  linearProgressBar: {
    height: 12,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  progressBarUrgent: {
    backgroundColor: '#FED7D7',
  },
  linearProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: theme.borderRadius.md,
  },
  
  // Milestone Styles
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
  },
  milestone: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.neutral.mediumGray,
  },
  milestoneReached: {
    backgroundColor: theme.colors.secondary.orange,
    borderColor: theme.colors.secondary.orange,
    shadowColor: theme.colors.secondary.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  milestoneText: {
    fontSize: 14,
    opacity: 0.5,
  },
  milestoneTextReached: {
    opacity: 1,
  },
  
  // Celebration Styles
  celebrationContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: 'linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 100%)',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.success,
    ...theme.shadows.lg,
  },
  celebrationText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  celebrationSubtext: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  confetti: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  confettiPiece: {
    fontSize: 18,
  },
});