import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { DataService } from '../services/dataService';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  created_at: string;
}

interface InterestItem {
  category: Category;
  isSelected: boolean;
}

export default function InterestsScreen() {
  const navigation = useNavigation();
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndInterests();
  }, []);

  const loadUserAndInterests = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Load all categories
      const categories = await DataService.getCategories();
      
      // Load user's current interests
      const userInterests = await DataService.getUserInterests(user.id);
      const selectedCategoryIds = userInterests.map(interest => interest.category_id);

      // Combine data
      const interestItems: InterestItem[] = categories.map(category => ({
        category,
        isSelected: selectedCategoryIds.includes(category.id),
      }));

      setInterests(interestItems);
    } catch (error) {
      console.error('Error loading interests:', error);
      Alert.alert('Error', 'Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (categoryId: string) => {
    setInterests(prev => 
      prev.map(item => 
        item.category.id === categoryId 
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const saveInterests = async () => {
    if (!userId) return;

    const selectedInterests = interests.filter(item => item.isSelected);
    
    if (selectedInterests.length === 0) {
      Alert.alert(
        'Select at least one interest',
        'Please select at least one area of interest to personalize your experience.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setSaving(true);

    try {
      await DataService.saveUserInterests(userId, selectedInterests.map(item => item.category.id));
      
      Alert.alert(
        'Interests Updated',
        'Your interests have been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving interests:', error);
      Alert.alert('Error', 'Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  const selectAll = () => {
    setInterests(prev => prev.map(item => ({ ...item, isSelected: true })));
  };

  const deselectAll = () => {
    setInterests(prev => prev.map(item => ({ ...item, isSelected: false })));
  };

  const selectedCount = interests.filter(item => item.isSelected).length;
  const allSelected = selectedCount === interests.length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.green} />
          <Text style={styles.loadingText}>Loading interests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Interests</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveInterests}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary.green} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Select the areas you're most interested in. Only content from these categories will appear in your Home section.
          </Text>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {selectedCount} of {interests.length} selected
            </Text>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={allSelected ? deselectAll : selectAll}
            >
              <Text style={styles.selectAllText}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.interestsList}>
          {interests.map(item => (
            <TouchableOpacity
              key={item.category.id}
              style={[
                styles.interestCard,
                item.isSelected && styles.interestCardSelected,
              ]}
              onPress={() => toggleInterest(item.category.id)}
            >
              <View style={styles.interestContent}>
                <View style={styles.interestHeader}>
                  <Text style={styles.interestEmoji}>{item.category.emoji}</Text>
                  <View style={styles.interestInfo}>
                    <Text style={[
                      styles.interestName,
                      item.isSelected && styles.interestNameSelected,
                    ]}>
                      {item.category.name}
                    </Text>
                    <Text style={[
                      styles.interestDescription,
                      item.isSelected && styles.interestDescriptionSelected,
                    ]}>
                      {item.category.description}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.checkbox,
                  item.isSelected && styles.checkboxSelected,
                ]}>
                  {item.isSelected && (
                    <Ionicons name="checkmark" size={18} color="white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  saveButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.green,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  description: {
    padding: theme.spacing.lg,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  selectAllButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  selectAllText: {
    fontSize: 14,
    color: theme.colors.primary.green,
    fontWeight: '600',
  },
  interestsList: {
    paddingHorizontal: theme.spacing.lg,
  },
  interestCard: {
    marginBottom: theme.spacing.sm,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  interestCardSelected: {
    borderColor: theme.colors.primary.green,
    backgroundColor: theme.colors.primary.green + '08',
  },
  interestContent: {
    padding: theme.spacing.md,
  },
  interestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  interestEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  interestInfo: {
    flex: 1,
  },
  interestName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  interestNameSelected: {
    color: theme.colors.primary.green,
  },
  interestDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  interestDescriptionSelected: {
    color: theme.colors.text.primary,
  },
  checkbox: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.neutral.mediumGray,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary.green,
    borderColor: theme.colors.primary.green,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});