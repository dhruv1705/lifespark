import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { theme } from '../theme';
import { Database } from '../lib/database.types';

type Goal = Database['public']['Tables']['goals']['Row'];

interface GoalDropdownProps {
  goals: Goal[];
  selectedGoal: Goal;
  onSelectGoal: (goal: Goal) => void;
}

export const GoalDropdown: React.FC<GoalDropdownProps> = ({
  goals,
  selectedGoal,
  onSelectGoal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoalSelect = (goal: Goal) => {
    onSelectGoal(goal);
    setIsOpen(false);
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      style={[
        styles.goalItem,
        item.id === selectedGoal.id && styles.selectedGoalItem
      ]}
      onPress={() => handleGoalSelect(item)}
    >
      <Text style={[
        styles.goalItemText,
        item.id === selectedGoal.id && styles.selectedGoalItemText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.dropdownButtonText}>{selectedGoal.name}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Goal</Text>
            <FlatList
              data={goals}
              renderItem={renderGoalItem}
              keyExtractor={(item) => item.id}
              style={styles.goalList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary.green,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.blue,
    ...theme.shadows.md,
    minWidth: 200,
  },
  dropdownButtonText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginRight: theme.spacing.sm,
  },
  dropdownArrow: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.inverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxHeight: '60%',
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  goalList: {
    maxHeight: 300,
  },
  goalItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 200,
  },
  selectedGoalItem: {
    backgroundColor: theme.colors.primary.green,
    borderColor: theme.colors.primary.green,
  },
  goalItemText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  selectedGoalItemText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.semibold,
  },
});