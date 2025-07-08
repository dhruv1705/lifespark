import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface MonthlyDaySelectorProps {
  selectedDay: number; // 1-31
  onDaySelect: (day: number) => void;
}

export const MonthlyDaySelector: React.FC<MonthlyDaySelectorProps> = ({
  selectedDay,
  onDaySelect,
}) => {
  const incrementDay = () => {
    if (selectedDay < 31) {
      onDaySelect(selectedDay + 1);
    }
  };

  const decrementDay = () => {
    if (selectedDay > 1) {
      onDaySelect(selectedDay - 1);
    }
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatDay = (day: number): string => {
    return `${day}${getOrdinalSuffix(day)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Day of Month</Text>
      <View style={styles.selectorContainer}>
        <TouchableOpacity 
          style={[styles.button, selectedDay <= 1 && styles.buttonDisabled]}
          onPress={decrementDay}
          disabled={selectedDay <= 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={selectedDay <= 1 ? theme.colors.text.secondary : theme.colors.primary.green} 
          />
        </TouchableOpacity>
        
        <View style={styles.dayDisplay}>
          <Text style={styles.dayNumber}>{selectedDay}</Text>
          <Text style={styles.dayOrdinal}>{getOrdinalSuffix(selectedDay)}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, selectedDay >= 31 && styles.buttonDisabled]}
          onPress={incrementDay}
          disabled={selectedDay >= 31}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={selectedDay >= 31 ? theme.colors.text.secondary : theme.colors.primary.green} 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.preview}>
        Monthly reminder on the {formatDay(selectedDay)} of each month
      </Text>
      
      <Text style={styles.note}>
        💡 For months with fewer days, the reminder will be set to the last day of that month.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.green,
    marginBottom: theme.spacing.md,
  },
  button: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  dayDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginHorizontal: theme.spacing.xl,
    minWidth: 80,
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 36,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary.green,
  },
  dayOrdinal: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary.green,
    marginLeft: 2,
  },
  preview: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  note: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});