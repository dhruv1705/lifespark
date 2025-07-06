import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme } from '../theme';

interface VisualProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
  showPercentage?: boolean;
}

const { width } = Dimensions.get('window');

export const VisualProgressRing: React.FC<VisualProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = theme.colors.primary.blue,
  backgroundColor = theme.colors.border,
  children,
  animated = true,
  showPercentage = true,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress, animated]);

  const animatedStrokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Circle */}
      <View
        style={[
          styles.backgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      
      {/* Progress Arc - Simplified approach */}
      <Animated.View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: color,
            borderRightColor: progress > 0.25 ? color : 'transparent',
            borderBottomColor: progress > 0.5 ? color : 'transparent',
            borderLeftColor: progress > 0.75 ? color : 'transparent',
            transform: [
              { rotate: '-90deg' },
              {
                scale: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children || (
          showPercentage && (
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  progressCircle: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  progressText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
});