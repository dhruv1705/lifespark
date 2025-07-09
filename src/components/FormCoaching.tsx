import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';

interface FormCoachingProps {
  exercise: 'squat' | 'pushup' | 'stretch';
  phase: 'prep' | 'down' | 'up' | 'hold' | 'rest';
  isActive: boolean;
  tips?: string[];
}

const { width } = Dimensions.get('window');

const FORM_GRAPHICS = {
  squat: {
    prep: {
      icon: '🏃‍♂️',
      title: 'Ready Position',
      tips: ['Feet shoulder-width apart', 'Toes slightly out', 'Core engaged'],
      color: theme.colors.primary.blue,
    },
    down: {
      icon: '⬇️',
      title: 'Lower Down',
      tips: ['Sit back like a chair', 'Knees behind toes', 'Chest up'],
      color: theme.colors.primary.orange,
    },
    up: {
      icon: '⬆️',
      title: 'Drive Up',
      tips: ['Push through heels', 'Squeeze glutes', 'Stand tall'],
      color: theme.colors.primary.green,
    },
    hold: {
      icon: '💪',
      title: 'Hold Strong',
      tips: ['Maintain form', 'Breathe steady', 'Feel the burn'],
      color: theme.colors.primary.purple,
    },
    rest: {
      icon: '😌',
      title: 'Rest & Reset',
      tips: ['Shake it out', 'Deep breaths', 'Prepare for next'],
      color: theme.colors.text.secondary,
    },
  },
  pushup: {
    prep: {
      icon: '🤲',
      title: 'Plank Position',
      tips: ['Hands under shoulders', 'Straight line', 'Core tight'],
      color: theme.colors.primary.blue,
    },
    down: {
      icon: '⬇️',
      title: 'Lower Chest',
      tips: ['Control the descent', 'Elbows at 45°', 'Keep form'],
      color: theme.colors.primary.orange,
    },
    up: {
      icon: '⬆️',
      title: 'Push Up',
      tips: ['Explosive power', 'Full extension', 'Breathe out'],
      color: theme.colors.primary.green,
    },
    hold: {
      icon: '🔥',
      title: 'Hold Plank',
      tips: ['Straight body', 'Engage core', 'Steady breathing'],
      color: theme.colors.primary.purple,
    },
    rest: {
      icon: '🧘‍♂️',
      title: 'Child\'s Pose',
      tips: ['Knees to chest', 'Relax shoulders', 'Breathe deeply'],
      color: theme.colors.text.secondary,
    },
  },
  stretch: {
    prep: {
      icon: '🧘‍♀️',
      title: 'Find Your Center',
      tips: ['Stand tall', 'Breathe deeply', 'Listen to body'],
      color: theme.colors.primary.blue,
    },
    down: {
      icon: '🌊',
      title: 'Gentle Movement',
      tips: ['Move slowly', 'No forcing', 'Feel the stretch'],
      color: theme.colors.primary.orange,
    },
    up: {
      icon: '🌱',
      title: 'Return Center',
      tips: ['Slow return', 'Maintain breath', 'Stay present'],
      color: theme.colors.primary.green,
    },
    hold: {
      icon: '🕯️',
      title: 'Hold & Breathe',
      tips: ['Steady hold', 'Deep breaths', 'Relax into it'],
      color: theme.colors.primary.purple,
    },
    rest: {
      icon: '☮️',
      title: 'Rest & Reflect',
      tips: ['Notice changes', 'Breathe naturally', 'Feel gratitude'],
      color: theme.colors.text.secondary,
    },
  },
};

export const FormCoaching: React.FC<FormCoachingProps> = ({
  exercise,
  phase,
  isActive,
  tips,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const formData = FORM_GRAPHICS[exercise][phase];

  useEffect(() => {
    if (isActive) {
      // Animate in and pulse
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse when active
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: formData.color,
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{formData.icon}</Text>
        <Text style={styles.title}>{formData.title}</Text>
      </View>

      <View style={styles.tipsContainer}>
        {(tips || formData.tips).map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Visual form indicator */}
      <View style={styles.formIndicator}>
        <View style={[styles.indicatorDot, { backgroundColor: formData.color }]} />
        <View style={styles.indicatorLine} />
        <View style={[styles.indicatorDot, { backgroundColor: formData.color }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    flex: 1,
  },
  tipsContainer: {
    marginBottom: theme.spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  tipBullet: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    marginRight: theme.spacing.xs,
    marginTop: 2,
  },
  tipText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.typography.sizes.sm,
    flex: 1,
  },
  formIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.inverse,
  },
  indicatorLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: theme.spacing.sm,
  },
});