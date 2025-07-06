import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

interface SimpleProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
}

export const SimpleProgressRing: React.FC<SimpleProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#2196F3',
  backgroundColor = '#E0E0E0',
  children,
  animated = true,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(animatedProgress, {
          toValue: progress,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animatedProgress.setValue(progress);
      scaleAnim.setValue(1);
    }
  }, [progress, animated]);

  const progressDegrees = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 360],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      {/* Background Circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      
      {/* Progress Indicator - Simple approach */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, size - strokeWidth * 2],
              }),
              height: strokeWidth,
              backgroundColor: color,
              borderRadius: strokeWidth / 2,
            },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  progressContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '70%',
    height: '70%',
  },
  progressBar: {
    position: 'absolute',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});