import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'milestone' | 'streak' | 'perfect' | 'speed' | 'consistency' | 'special';

export interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  emoji: string;
  unlocked: boolean;
  progress?: number; // 0-1 for partially completed achievements
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  id,
  title,
  description,
  category,
  rarity,
  emoji,
  unlocked,
  progress = 0,
  animated = true,
  size = 'medium',
  showProgress = true,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const unlockAnim = useRef(new Animated.Value(unlocked ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (animated) {
      // Mount animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Progress animation
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1500,
        useNativeDriver: false,
      }).start();
      
      // Unlock animation
      if (unlocked) {
        Animated.sequence([
          Animated.timing(unlockAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          // Glow animation for unlocked badges
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0.3,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start();
      }
      
      // Pulse animation for badges close to unlocking
      if (!unlocked && progress > 0.7) {
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
      }
    } else {
      scaleAnim.setValue(1);
      progressAnim.setValue(progress);
      unlockAnim.setValue(unlocked ? 1 : 0);
    }
  }, [animated, progress, unlocked]);
  
  // Get size-specific dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small': return { badge: 60, inner: 50, emoji: 20, title: 12, desc: 10 };
      case 'large': return { badge: 120, inner: 100, emoji: 32, title: 18, desc: 14 };
      default: return { badge: 80, inner: 68, emoji: 24, title: 14, desc: 12 };
    }
  };
  
  const dimensions = getSizeDimensions();
  
  // Get rarity-specific colors
  const getRarityColors = () => {
    switch (rarity) {
      case 'common':
        return {
          outer: '#9E9E9E',
          inner: '#F5F5F5',
          glow: '#BDBDBD',
          border: '#E0E0E0',
          text: '#616161',
        };
      case 'rare':
        return {
          outer: '#2196F3',
          inner: '#E3F2FD',
          glow: '#64B5F6',
          border: '#90CAF9',
          text: '#1976D2',
        };
      case 'epic':
        return {
          outer: '#9C27B0',
          inner: '#F3E5F5',
          glow: '#BA68C8',
          border: '#CE93D8',
          text: '#7B1FA2',
        };
      case 'legendary':
        return {
          outer: '#FFD700',
          inner: '#FFFDE7',
          glow: '#FFE082',
          border: '#FFEB3B',
          text: '#F57F17',
        };
      default:
        return {
          outer: '#9E9E9E',
          inner: '#F5F5F5',
          glow: '#BDBDBD',
          border: '#E0E0E0',
          text: '#616161',
        };
    }
  };
  
  const colors = getRarityColors();
  
  // Get category icon
  const getCategoryIcon = () => {
    switch (category) {
      case 'milestone': return '🏁';
      case 'streak': return '🔥';
      case 'perfect': return '⭐';
      case 'speed': return '⚡';
      case 'consistency': return '📈';
      case 'special': return '🎁';
      default: return '🏆';
    }
  };
  
  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] },
      size === 'small' && styles.containerSmall,
      size === 'large' && styles.containerLarge,
    ]}>
      {/* Glow effect for unlocked badges */}
      {unlocked && (
        <Animated.View style={[
          styles.glowRing,
          {
            width: dimensions.badge + 20,
            height: dimensions.badge + 20,
            borderRadius: (dimensions.badge + 20) / 2,
            backgroundColor: colors.glow + '30',
            opacity: glowAnim,
          }
        ]} />
      )}
      
      {/* Main badge circle */}
      <Animated.View style={[
        styles.badgeOuter,
        {
          width: dimensions.badge,
          height: dimensions.badge,
          borderRadius: dimensions.badge / 2,
          backgroundColor: unlocked ? colors.outer : '#BDBDBD',
          opacity: unlockAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1]
          }),
          transform: [{ scale: pulseAnim }],
        }
      ]}>
        {/* Progress ring for partially completed achievements */}
        {showProgress && !unlocked && progress > 0 && (
          <Animated.View style={[
            styles.progressRing,
            {
              width: dimensions.badge,
              height: dimensions.badge,
              borderRadius: dimensions.badge / 2,
              borderWidth: 4,
              borderColor: colors.outer + '60',
              borderTopColor: colors.outer,
              transform: [{
                rotate: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }
          ]} />
        )}
        
        {/* Inner badge circle */}
        <View style={[
          styles.badgeInner,
          {
            width: dimensions.inner,
            height: dimensions.inner,
            borderRadius: dimensions.inner / 2,
            backgroundColor: unlocked ? colors.inner : '#F5F5F5',
            borderColor: unlocked ? colors.border : '#E0E0E0',
          }
        ]}>
          {/* Achievement emoji */}
          <Text style={[
            styles.badgeEmoji,
            { 
              fontSize: dimensions.emoji,
              opacity: unlocked ? 1 : 0.4,
            }
          ]}>
            {unlocked ? emoji : '🔒'}
          </Text>
          
          {/* Category indicator */}
          {unlocked && (
            <View style={styles.categoryIndicator}>
              <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
            </View>
          )}
        </View>
      </Animated.View>
      
      {/* Badge information */}
      {size !== 'small' && (
        <View style={styles.badgeInfo}>
          <Text style={[
            styles.badgeTitle,
            { 
              fontSize: dimensions.title,
              color: unlocked ? colors.text : theme.colors.text.secondary,
            }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.badgeDescription,
            { fontSize: dimensions.desc }
          ]}>
            {unlocked ? description : 'Locked - Keep working to unlock!'}
          </Text>
          
          {/* Progress indicator for locked badges */}
          {!unlocked && showProgress && progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    backgroundColor: colors.outer,
                  }
                ]} />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}% Complete
              </Text>
            </View>
          )}
          
          {/* Rarity indicator */}
          <View style={[
            styles.rarityBadge,
            { backgroundColor: colors.outer + '20', borderColor: colors.outer }
          ]}>
            <Text style={[styles.rarityText, { color: colors.text }]}>
              {rarity.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    position: 'relative',
  },
  containerSmall: {
    padding: theme.spacing.sm,
  },
  containerLarge: {
    padding: theme.spacing.lg,
  },
  
  // Glow effect
  glowRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
  },
  
  // Badge styles
  badgeOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  badgeInner: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    ...theme.shadows.sm,
    position: 'relative',
  },
  badgeEmoji: {
    textAlign: 'center',
  },
  categoryIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  categoryIcon: {
    fontSize: 10,
  },
  
  // Badge information
  badgeInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    maxWidth: 200,
  },
  badgeTitle: {
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  badgeDescription: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  
  // Progress styles
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    ...theme.shadows.sm,
  },
  progressText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  
  // Rarity badge
  rarityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
});