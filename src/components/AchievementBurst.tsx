import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';

interface AchievementBurstProps {
  show: boolean;
  achievement: {
    title: string;
    description: string;
    icon: string;
    color?: string;
  };
  onComplete?: () => void;
  duration?: number;
}

const { width, height } = Dimensions.get('window');

export const AchievementBurst: React.FC<AchievementBurstProps> = ({
  show,
  achievement,
  onComplete,
  duration = 2500,
}) => {
  const slideAnim = useRef(new Animated.Value(-height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      // Slide in from top
      Animated.sequence([
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 100,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 150,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        
        // Bounce animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ),
        
        // Slide out after duration
        Animated.timing(slideAnim, {
          toValue: -height,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset animations
        slideAnim.setValue(-height);
        scaleAnim.setValue(0);
        opacityAnim.setValue(0);
        bounceAnim.setValue(0);
        onComplete?.();
      });
    }
  }, [show]);

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={[styles.card, { backgroundColor: achievement.color || theme.colors.primary.blue }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ translateY: bounceTransform }],
            },
          ]}
        >
          <Text style={styles.icon}>{achievement.icon}</Text>
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>

        {/* Sparkle effects */}
        <View style={styles.sparkleContainer}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.sparkle,
                {
                  transform: [
                    { rotate: `${i * 45}deg` },
                    {
                      translateX: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 20],
                      }),
                    },
                    {
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    minWidth: width * 0.8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
});