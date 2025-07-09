import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme';
import { Database } from '../lib/database.types';

type Goal = Database['public']['Tables']['goals']['Row'];

export interface FilterState {
  timeFilter: 'daily' | 'weekly' | 'monthly';
  statusFilter: 'completed' | 'pending' | 'all';
  goalFilter: string[] | 'all'; // Array of goal IDs or 'all'
}

interface FilterTabProps {
  isExpanded: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableGoals: Goal[];
}

export const FilterTab: React.FC<FilterTabProps> = ({
  isExpanded,
  onToggle,
  filters,
  onFiltersChange,
  availableGoals,
}) => {
  const updateFilter = (filterType: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [filterType]: value,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.statusFilter !== 'all') count++;
    if (filters.goalFilter !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    onFiltersChange({
      timeFilter: 'daily',
      statusFilter: 'all',
      goalFilter: 'all',
    });
  };

  const renderTimeFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Time Period</Text>
      <View style={styles.filterRow}>
        {(['daily', 'weekly', 'monthly'] as const).map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.filterButton,
              filters.timeFilter === time && styles.activeFilterButton
            ]}
            onPress={() => updateFilter('timeFilter', time)}
          >
            <Text style={[
              styles.filterButtonText,
              filters.timeFilter === time && styles.activeFilterButtonText
            ]}>
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Status</Text>
      <View style={styles.filterRow}>
        {(['all', 'completed', 'pending'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filters.statusFilter === status && styles.activeFilterButton
            ]}
            onPress={() => updateFilter('statusFilter', status)}
          >
            <Text style={[
              styles.filterButtonText,
              filters.statusFilter === status && styles.activeFilterButtonText
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGoalFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Goals</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.goalFilter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => updateFilter('goalFilter', 'all')}
          >
            <Text style={[
              styles.filterButtonText,
              filters.goalFilter === 'all' && styles.activeFilterButtonText
            ]}>
              All Goals
            </Text>
          </TouchableOpacity>
          
          {availableGoals.map((goal) => {
            const isSelected = Array.isArray(filters.goalFilter) && 
                              filters.goalFilter.includes(goal.id);
            
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.filterButton,
                  isSelected && styles.activeFilterButton
                ]}
                onPress={() => {
                  if (filters.goalFilter === 'all') {
                    updateFilter('goalFilter', [goal.id]);
                  } else if (Array.isArray(filters.goalFilter)) {
                    if (filters.goalFilter.includes(goal.id)) {
                      const newGoals = filters.goalFilter.filter(id => id !== goal.id);
                      updateFilter('goalFilter', newGoals.length > 0 ? newGoals : 'all');
                    } else {
                      updateFilter('goalFilter', [...filters.goalFilter, goal.id]);
                    }
                  }
                }}
              >
                <Text style={[
                  styles.filterButtonText,
                  isSelected && styles.activeFilterButtonText
                ]}>
                  {goal.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Filters</Text>
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.filterContent}>
          {renderTimeFilter()}
          {renderStatusFilter()}
          {renderGoalFilter()}
          
          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <Text style={styles.clearButtonText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  filterBadge: {
    backgroundColor: theme.colors.primary.green,
    borderRadius: theme.borderRadius.round,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  filterBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  expandIcon: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  filterTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary.green,
    borderColor: theme.colors.primary.green,
  },
  filterButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  activeFilterButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.semibold,
  },
  clearButton: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary.orange,
    marginTop: theme.spacing.sm,
  },
  clearButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
});