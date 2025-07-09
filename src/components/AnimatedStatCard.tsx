import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { useCelebration } from '../context/CelebrationContext';
import { AnimatedNumber } from './AnimatedNumber';

interface AnimatedStatCardProps {
  emoji: string;
  value: string | number;
  label: string;
  progress: number; // 0-1
  progressColor: string;
  backgroundColor: string;
  borderColor: string;
  valueColor: string;
  onPress?: () => void;
  animated?: boolean;
  delay?: number;
}

export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
  emoji,
  value,
  label,
  progress,
  progressColor,
  backgroundColor,
  borderColor,
  valueColor,
  onPress,
  animated = true,
  delay = 0,
}) => {
  const { triggerCelebration } = useCelebration();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const iconBounceAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      // Enhanced staggered entrance animation with bounce
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Enhanced progress bar animation with bounce
      Animated.sequence([
        Animated.delay(delay + 200),
        Animated.timing(progressAnim, {
          toValue: progress * 0.8,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.spring(progressAnim, {
          toValue: progress,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
      
      // More dynamic icon bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounceAnim, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(iconBounceAnim, {
            toValue: 0.95,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(iconBounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Enhanced glow effect with more variation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
      progressAnim.setValue(progress);
    }
  }, [animated, progress, delay]);
  
  const handlePress = () => {
    if (onPress) {
      // Enhanced press animation with celebration trigger
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Trigger celebration for high progress cards
      if (progress > 0.8) {
        triggerCelebration({
          type: 'habit_completed',
          intensity: 'low',
          duration: 2000,
        });
      }
      
      onPress();
    }
  };
  
  const CardContent = (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor,
        borderColor,
        transform: [{ scale: scaleAnim }],
      }
    ]}>
      {/* Glow effect */}
      <Animated.View style={[
        styles.glowEffect,
        {
          opacity: glowAnim,
          backgroundColor: progressColor + '20',
        }
      ]} />
      
      {/* Icon container */}
      <Animated.View style={[
        styles.iconContainer,
        { transform: [{ scale: iconBounceAnim }] }
      ]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
      
      {/* Value with animated number */}
      {typeof value === 'number' ? (
        <AnimatedNumber
          value={value}
          style={[styles.value, { color: valueColor }]}
          duration={1500}
          animated={animated}
          bounceOnChange={true}
        />
      ) : (
        <Text style={[styles.value, { color: valueColor }]}>
          {value}
        </Text>
      )}
      
      {/* Label */}
      <Text style={styles.label}>{label}</Text>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp'
              }),
              backgroundColor: progressColor,
            }
          ]} />
        </View>
      </View>
      
      {/* Sparkle effects for high progress */}
      {progress > 0.8 && (
        <View style={styles.sparkleContainer}>
          <Animated.Text style={[
            styles.sparkle,
            {
              opacity: glowAnim,
              transform: [{ scale: iconBounceAnim }]
            }
          ]}>
            ✨
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
  
  return onPress ? (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      {CardContent}
    </TouchableOpacity>
  ) : (
    CardContent
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '47%',
    minHeight: 120,
    maxHeight: 140,
    marginBottom: theme.spacing.md,
    marginHorizontal: '1.5%',
    ...theme.shadows.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.xl,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  emoji: {
    fontSize: 20,
  },
  value: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
    lineHeight: 18,
    minWidth: '100%',
  },
  progressContainer: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    ...theme.shadows.sm,
  },
  sparkleContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  sparkle: {
    fontSize: 16,
  },
});