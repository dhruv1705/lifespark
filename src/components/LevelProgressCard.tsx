import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { UserLevel, getLevelDefinition } from '../utils/levelSystem';
import { theme } from '../theme';

interface LevelProgressCardProps {
  userLevel: UserLevel;
  animated?: boolean;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({ 
  userLevel, 
  animated = true 
}) => {
  const levelDef = getLevelDefinition(userLevel.level);
  const nextLevelDef = getLevelDefinition(userLevel.level + 1);
  
  const progressWidth = userLevel.progressToNextLevel * 100;
  const xpToNextLevel = userLevel.xpForNextLevel - userLevel.currentXP;
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    if (animated) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: progressWidth,
        duration: 1500,
        useNativeDriver: false,
      }).start();
      
      // Pulsing glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Scale animation on mount
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      progressAnim.setValue(progressWidth);
      scaleAnim.setValue(1);
    }
  }, [animated, progressWidth]);
  
  // Get level tier for gem styling
  const getLevelTier = (level: number) => {
    if (level >= 10) return 'legendary';
    if (level >= 7) return 'epic';
    if (level >= 4) return 'rare';
    return 'common';
  };
  
  const tier = getLevelTier(userLevel.level);
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Header with level and title */}
      <View style={styles.header}>
        {/* Duolingo-style gem with tier styling */}
        <Animated.View style={[styles.gemContainer, { opacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.8]
        }) }]}>
          <View style={[styles.gemOuter, styles[`gem${tier.charAt(0).toUpperCase() + tier.slice(1)}`]]}>
            <View style={[styles.gemInner, styles[`gemInner${tier.charAt(0).toUpperCase() + tier.slice(1)}`]]}>
              <Text style={styles.levelEmoji}>{levelDef.emoji}</Text>
              <Text style={styles.levelNumber}>{userLevel.level}</Text>
            </View>
            {/* Glow effect */}
            <Animated.View 
              style={[
                styles.gemGlow, 
                { 
                  opacity: glowAnim,
                  backgroundColor: levelDef.color + '40'
                }
              ]} 
            />
          </View>
        </Animated.View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.levelTitle}>{userLevel.title}</Text>
          <Text style={styles.totalXP}>{userLevel.currentXP.toLocaleString()} XP</Text>
          <View style={styles.tierBadge}>
            <Text style={[styles.tierText, { color: levelDef.color }]}>{tier.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      {/* Enhanced Progress bar with animation */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp'
                }),
                backgroundColor: levelDef.color,
              }
            ]} 
          />
          {/* Progress shine effect */}
          <Animated.View 
            style={[
              styles.progressShine,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8]
                })
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {userLevel.level === 50 ? '👑 MAX LEVEL ACHIEVED!' : `${xpToNextLevel} XP to ${nextLevelDef.title}`}
        </Text>
        
        {/* Level pathway preview */}
        <View style={styles.levelPathway}>
          {[...Array(3)].map((_, index) => {
            const pathLevel = userLevel.level + index;
            const pathLevelDef = getLevelDefinition(pathLevel);
            const isActive = index === 0;
            const isNext = index === 1;
            
            return (
              <View key={pathLevel} style={[
                styles.pathwayGem,
                isActive && styles.pathwayGemActive,
                isNext && styles.pathwayGemNext
              ]}>
                <Text style={[
                  styles.pathwayEmoji,
                  isActive && styles.pathwayEmojiActive
                ]}>
                  {pathLevelDef.emoji}
                </Text>
                <Text style={[
                  styles.pathwayLevel,
                  isActive && { color: levelDef.color }
                ]}>
                  {pathLevel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Enhanced XP breakdown */}
      <View style={styles.xpBreakdown}>
        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>Current Progress</Text>
          <View style={styles.xpValues}>
            <Text style={styles.currentLevelXP}>
              {(userLevel.currentXP - userLevel.xpForCurrentLevel).toLocaleString()}
            </Text>
            <Text style={styles.xpSeparator}>/</Text>
            <Text style={styles.nextLevelXP}>
              {userLevel.totalXPNeeded.toLocaleString()} XP
            </Text>
          </View>
        </View>
        
        {/* XP Bonus indicator */}
        {userLevel.level >= 3 && (
          <View style={styles.bonusIndicator}>
            <Text style={styles.bonusText}>🔥 XP Bonus Active</Text>
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  // Duolingo-style Gem Styles
  gemContainer: {
    marginRight: theme.spacing.lg,
  },
  gemOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gemInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  gemGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -5,
    left: -5,
  },
  
  // Gem Tier Styles
  gemCommon: {
    backgroundColor: '#9E9E9E',
    shadowColor: '#9E9E9E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gemInnerCommon: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  gemRare: {
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  gemInnerRare: {
    backgroundColor: '#E3F2FD',
    borderColor: '#90CAF9',
  },
  gemEpic: {
    backgroundColor: '#9C27B0',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  gemInnerEpic: {
    backgroundColor: '#F3E5F5',
    borderColor: '#CE93D8',
  },
  gemLegendary: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  gemInnerLegendary: {
    backgroundColor: '#FFFDE7',
    borderColor: '#FFEB3B',
  },
  
  levelEmoji: {
    fontSize: 18,
    position: 'absolute',
    top: 6,
  },
  levelNumber: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  
  titleContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  totalXP: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  tierBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  
  // Enhanced Progress Styles
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: 16,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
  },
  progressText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.md,
  },
  
  // Level Pathway Styles
  levelPathway: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  pathwayGem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.neutral.mediumGray,
  },
  pathwayGemActive: {
    backgroundColor: theme.colors.secondary.orange,
    borderColor: theme.colors.secondary.orange,
    shadowColor: theme.colors.secondary.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pathwayGemNext: {
    backgroundColor: theme.colors.primary.blue + '30',
    borderColor: theme.colors.primary.blue,
  },
  pathwayEmoji: {
    fontSize: 16,
    opacity: 0.6,
  },
  pathwayEmojiActive: {
    opacity: 1,
  },
  pathwayLevel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  
  // Enhanced XP Breakdown
  xpBreakdown: {
    alignItems: 'center',
  },
  xpCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  xpLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
  },
  xpValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLevelXP: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
  },
  xpSeparator: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.neutral.mediumGray,
    marginHorizontal: theme.spacing.xs,
  },
  nextLevelXP: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.neutral.mediumGray,
  },
  bonusIndicator: {
    backgroundColor: '#FFF3E0',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  bonusText: {
    fontSize: theme.typography.sizes.sm,
    color: '#F57C00',
    fontWeight: theme.typography.weights.medium,
  },
});