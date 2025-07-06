import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';

interface WeeklyDaySelectorProps {
  selectedDay: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  onDaySelect: (day: number) => void;
}

const DAYS = [
  { value: 1, label: 'Mon', fullName: 'Monday' },
  { value: 2, label: 'Tue', fullName: 'Tuesday' },
  { value: 3, label: 'Wed', fullName: 'Wednesday' },
  { value: 4, label: 'Thu', fullName: 'Thursday' },
  { value: 5, label: 'Fri', fullName: 'Friday' },
  { value: 6, label: 'Sat', fullName: 'Saturday' },
  { value: 0, label: 'Sun', fullName: 'Sunday' },
];

export const WeeklyDaySelector: React.FC<WeeklyDaySelectorProps> = ({
  selectedDay,
  onDaySelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Day of Week</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayButton,
              selectedDay === day.value && styles.dayButtonActive
            ]}
            onPress={() => onDaySelect(day.value)}
          >
            <Text style={[
              styles.dayLabel,
              selectedDay === day.value && styles.dayLabelActive
            ]}>
              {day.label}
            </Text>
            <Text style={[
              styles.dayFullName,
              selectedDay === day.value && styles.dayFullNameActive
            ]}>
              {day.fullName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  dayButton: {
    minWidth: 70,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    borderColor: theme.colors.primary.green,
    backgroundColor: theme.colors.primary.green + '10',
  },
  dayLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  dayLabelActive: {
    color: theme.colors.primary.green,
  },
  dayFullName: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  dayFullNameActive: {
    color: theme.colors.primary.green,
  },
});