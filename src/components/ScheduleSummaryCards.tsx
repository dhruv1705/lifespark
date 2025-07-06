import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';

interface ScheduleSummaryCardsProps {
  totalTasks: number;
  completedTasks: number;
  label: string;
}

export const ScheduleSummaryCards: React.FC<ScheduleSummaryCardsProps> = ({
  totalTasks,
  completedTasks,
  label,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.number}>{totalTasks}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={[
          styles.number, 
          { color: completedTasks > 0 ? theme.colors.primary.green : theme.colors.primary.blue }
        ]}>
          {completedTasks}
        </Text>
        <Text style={styles.label}>Completed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  number: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary.blue,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});