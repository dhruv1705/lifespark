import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';

interface RepCounterProps {
  currentRep: number;
  totalReps: number;
  onRepComplete?: () => void;
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  animated?: boolean;
}

const { width } = Dimensions.get('window');

export const RepCounter: React.FC<RepCounterProps> = ({
  currentRep,
  totalReps,
  onRepComplete,
  isActive = false,
  size = 'large',
  color = theme.colors.primary.blue,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    small: { containerSize: 80, fontSize: theme.typography.sizes.lg },
    medium: { containerSize: 120, fontSize: theme.typography.sizes.xl },
    large: { containerSize: 160, fontSize: theme.typography.sizes.heading },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (animated && isActive) {
      // Pulse animation for active state
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, animated]);

  useEffect(() => {
    if (animated) {
      // Celebration animation when rep increases
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Color animation
      Animated.timing(colorAnim, {
        toValue: currentRep / totalReps,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentRep, animated]);

  const interpolatedColor = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      '#2196F3', // blue
      '#FF9800', // orange
      '#4CAF50', // green
    ],
  });

  const progress = currentRep / totalReps;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: config.containerSize,
          height: config.containerSize,
          borderRadius: config.containerSize / 2,
        },
      ]}
      onPress={onRepComplete}
      disabled={!onRepComplete}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.innerContainer,
          {
            width: config.containerSize,
            height: config.containerSize,
            borderRadius: config.containerSize / 2,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
          animated ? { backgroundColor: interpolatedColor } : { backgroundColor: color },
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.repText, { fontSize: config.fontSize }]}>
            {currentRep}
          </Text>
          <Text style={styles.totalText}>
            of {totalReps}
          </Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress * 100}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Celebration particles effect */}
      {isActive && (
        <View style={styles.particlesContainer}>
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  transform: [
                    {
                      rotate: `${i * 60}deg`,
                    },
                    {
                      translateY: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  repText: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  totalText: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    top: -20,
  },
});