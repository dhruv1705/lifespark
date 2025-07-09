import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

export type NodeStatus = 'current' | 'completed' | 'locked' | 'bonus';

interface JourneyNodeProps {
  id: string;
  title: string;
  emoji: string;
  status: NodeStatus;
  progress?: number; // 0-100 for current nodes
  onPress: () => void;
  position: 'left' | 'right' | 'center';
}

export const JourneyNode: React.FC<JourneyNodeProps> = ({
  id,
  title,
  emoji,
  status,
  progress = 0,
  onPress,
  position,
}) => {
  const getNodeStyle = () => {
    switch (status) {
      case 'current':
        return [styles.nodeBase, styles.currentNode];
      case 'completed':
        return [styles.nodeBase, styles.completedNode];
      case 'locked':
        return [styles.nodeBase, styles.lockedNode];
      case 'bonus':
        return [styles.nodeBase, styles.bonusNode];
      default:
        return [styles.nodeBase, styles.lockedNode];
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'current':
        return theme.colors.text.primary;
      case 'completed':
        return theme.colors.text.primary;
      case 'locked':
        return theme.colors.text.disabled;
      case 'bonus':
        return theme.colors.text.primary;
      default:
        return theme.colors.text.disabled;
    }
  };

  const getNodeOpacity = () => {
    switch (status) {
      case 'current':
        return 1;
      case 'completed':
        return 1;
      case 'locked':
        return 0.5;
      case 'bonus':
        return 1;
      default:
        return 0.5;
    }
  };

  const renderProgressIndicator = () => {
    if (status === 'current' && progress > 0) {
      return (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      );
    }
    return null;
  };

  const renderStars = () => {
    if (status === 'completed') {
      return (
        <View style={styles.starsContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.star}>⭐</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, styles[`${position}Container`]]}>
      <TouchableOpacity
        style={[getNodeStyle(), { opacity: getNodeOpacity() }]}
        onPress={onPress}
        disabled={false}
        activeOpacity={0.7}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        {renderProgressIndicator()}
        {renderStars()}
      </TouchableOpacity>
      
      <View style={[styles.labelContainer, styles[`${position}Label`]]}>
        <Text style={[styles.nodeTitle, { color: getTextColor() }]} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  leftContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.xl,
  },
  rightContainer: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
    marginRight: theme.spacing.xl,
  },
  centerContainer: {
    alignSelf: 'center',
  },
  nodeBase: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...theme.shadows.md,
  },
  currentNode: {
    backgroundColor: theme.colors.primary.blue,
    borderWidth: 4,
    borderColor: theme.colors.primary.green,
  },
  completedNode: {
    backgroundColor: theme.colors.primary.green,
    borderWidth: 2,
    borderColor: theme.colors.primary.green,
  },
  lockedNode: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  bonusNode: {
    backgroundColor: theme.colors.secondary.purple,
    borderWidth: 3,
    borderColor: theme.colors.secondary.orange,
  },
  emoji: {
    fontSize: 32,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.text.inverse,
    borderRadius: 1.5,
  },
  starsContainer: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  star: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  labelContainer: {
    maxWidth: 140,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  leftLabel: {
    marginLeft: theme.spacing.md,
    alignItems: 'flex-start',
  },
  rightLabel: {
    marginRight: theme.spacing.md,
    alignItems: 'flex-end',
  },
  centerLabel: {
    alignItems: 'center',
  },
  nodeTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
});