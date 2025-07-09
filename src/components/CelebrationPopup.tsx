import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../theme';
import { CelebrationConfig } from '../context/CelebrationContext';

interface CelebrationPopupProps {
  visible: boolean;
  celebration: CelebrationConfig | null;
  onDismiss: () => void;
}

export const CelebrationPopup: React.FC<CelebrationPopupProps> = ({
  visible,
  celebration,
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && celebration) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Emoji bounce animation
      Animated.sequence([
        Animated.timing(emojiAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(emojiAnim, {
          toValue: 1.2,
          tension: 200,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(emojiAnim, {
          toValue: 1,
          tension: 200,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for high intensity celebrations
      if (celebration.intensity === 'high') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, celebration]);

  if (!celebration) return null;

  const getCelebrationContent = () => {
    switch (celebration.type) {
      case 'streak_milestone':
        return {
          emoji: '🔥',
          title: celebration.title || 'Streak Milestone!',
          subtitle: celebration.subtitle || 'You\'re on fire! Keep it up!',
          backgroundColor: '#FFF3E0',
          borderColor: '#FF6B35',
          textColor: '#FF6B35',
        };
      case 'level_up':
        return {
          emoji: '🆙',
          title: celebration.title || 'Level Up!',
          subtitle: celebration.subtitle || 'You\'ve reached a new level!',
          backgroundColor: '#F0FFF4',
          borderColor: theme.colors.primary.green,
          textColor: theme.colors.primary.green,
        };
      case 'achievement_unlocked':
        return {
          emoji: '🏆',
          title: celebration.title || 'Achievement Unlocked!',
          subtitle: celebration.subtitle || 'You\'ve earned a new badge!',
          backgroundColor: '#FFFBF0',
          borderColor: '#FFD700',
          textColor: '#F57F17',
        };
      case 'daily_goal':
        return {
          emoji: '🎯',
          title: celebration.title || 'Daily Goal Complete!',
          subtitle: celebration.subtitle || 'Amazing progress today!',
          backgroundColor: '#F3F8FF',
          borderColor: theme.colors.primary.blue,
          textColor: theme.colors.primary.blue,
        };
      default:
        return {
          emoji: '🎉',
          title: celebration.title || 'Celebration!',
          subtitle: celebration.subtitle || 'Great job!',
          backgroundColor: '#F8F3FF',
          borderColor: theme.colors.secondary.purple,
          textColor: theme.colors.secondary.purple,
        };
    }
  };

  const content = getCelebrationContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onDismiss} />
        <Animated.View
          style={[
            styles.popup,
            {
              backgroundColor: content.backgroundColor,
              borderColor: content.borderColor,
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.emoji,
              {
                transform: [{ scale: emojiAnim }],
              },
            ]}
          >
            {content.emoji}
          </Animated.Text>
          
          <Text style={[styles.title, { color: content.textColor }]}>
            {content.title}
          </Text>
          
          <Text style={[styles.subtitle, { color: content.textColor }]}>
            {content.subtitle}
          </Text>
          
          {celebration.message && (
            <Text style={[styles.message, { color: content.textColor }]}>
              {celebration.message}
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: content.textColor }]}
            onPress={onDismiss}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    width: '80%',
    maxWidth: 320,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    ...theme.shadows.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    opacity: 0.8,
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  continueButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  continueButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
  },
});