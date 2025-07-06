import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserLevel, getLevelDefinition } from '../utils/levelSystem';
import { theme } from '../theme';

interface LevelProgressCardProps {
  userLevel: UserLevel;
  animated?: boolean;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({ 
  userLevel, 
  animated = false 
}) => {
  const levelDef = getLevelDefinition(userLevel.level);
  const nextLevelDef = getLevelDefinition(userLevel.level + 1);
  
  const progressWidth = userLevel.progressToNextLevel * 100;
  const xpToNextLevel = userLevel.xpForNextLevel - userLevel.currentXP;
  
  return (
    <View style={styles.container}>
      {/* Header with level and title */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelEmoji}>{levelDef.emoji}</Text>
          <Text style={styles.levelNumber}>{userLevel.level}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.levelTitle}>{userLevel.title}</Text>
          <Text style={styles.totalXP}>{userLevel.currentXP.toLocaleString()} XP</Text>
        </View>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressWidth}%`,
                backgroundColor: levelDef.color,
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {userLevel.level === 50 ? 'MAX LEVEL!' : `${xpToNextLevel} XP to ${nextLevelDef.title}`}
        </Text>
      </View>
      
      {/* XP breakdown */}
      <View style={styles.xpBreakdown}>
        <Text style={styles.currentLevelXP}>
          {(userLevel.currentXP - userLevel.xpForCurrentLevel).toLocaleString()}
        </Text>
        <Text style={styles.xpSeparator}>/</Text>
        <Text style={styles.nextLevelXP}>
          {userLevel.totalXPNeeded.toLocaleString()} XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.secondary.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    shadowColor: theme.colors.secondary.orange,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  levelEmoji: {
    fontSize: 20,
    position: 'absolute',
    top: 2,
  },
  levelNumber: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    marginTop: 20,
  },
  titleContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  totalXP: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.neutral.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    ...theme.shadows.sm,
  },
  progressText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  xpBreakdown: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLevelXP: {
    fontSize: theme.typography.sizes.lg,
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
});