import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Habit } from '../types';
import { theme } from '../theme';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle }) => {
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Foundation';
      case 2: return 'Building';
      case 3: return 'Power';
      case 4: return 'Mastery';
      default: return 'Level ' + level;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return theme.colors.levels.foundation;
      case 2: return theme.colors.levels.building;
      case 3: return theme.colors.levels.power;
      case 4: return theme.colors.levels.mastery;
      default: return theme.colors.neutral.mediumGray;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, habit.completed && styles.completedCard]} 
      onPress={onToggle}
    >
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.name}>{habit.name}</Text>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(habit.level) }]}>
            <Text style={styles.levelText}>{getLevelLabel(habit.level)}</Text>
          </View>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.xp}>+{habit.xp} XP</Text>
          <View style={[styles.checkbox, habit.completed && styles.checkedBox]}>
            {habit.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </View>
      <Text style={styles.description}>{habit.description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
  },
  completedCard: {
    borderLeftColor: theme.colors.success,
    backgroundColor: '#f8fff8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftHeader: {
    flex: 1,
  },
  rightHeader: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.bold,
  },
  xp: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
    marginBottom: theme.spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkmark: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
});