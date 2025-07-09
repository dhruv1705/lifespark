import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CategoryCard } from '../components/CategoryCard';
import { CompactToggle } from '../components/CompactToggle';
import { JourneyView } from '../components/JourneyView';
import { DataService } from '../services/dataService';
import { settingsStorage } from '../services/settingsStorage';
import { RootStackParamList } from '../types';
import { Database } from '../lib/database.types';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { dataSync, DATA_SYNC_EVENTS } from '../utils/dataSync';

type Category = Database['public']['Tables']['categories']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];

type CategoriesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Categories'>;

interface CategoriesScreenProps {
  navigation: CategoriesScreenNavigationProp;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJourneyView, setIsJourneyView] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
    loadViewPreference();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await DataService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadViewPreference = async () => {
    try {
      const viewMode = await settingsStorage.getHomeViewMode();
      setIsJourneyView(viewMode === 'journey');
    } catch (error) {
      console.error('Error loading view preference:', error);
    }
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Goals', { categoryId: category.id });
  };

  const handleHabitToggle = async (habit: Habit) => {
    if (!user) return;
    
    try {
      const wasCompleted = await DataService.toggleHabitCompletion(user.id, habit.id, habit.xp);
      
      // Emit event to notify other screens about XP change
      dataSync.emit(DATA_SYNC_EVENTS.HABIT_TOGGLED, {
        habitId: habit.id,
        completed: wasCompleted,
        xp: habit.xp,
        userId: user.id
      });
      
      console.log('🔄 Habit toggle event emitted from Categories:', { 
        habitId: habit.id, 
        completed: wasCompleted, 
        xp: habit.xp 
      });
      
    } catch (error) {
      console.error('Error toggling habit from Categories:', error);
    }
  };

  const handleViewToggle = async (journeyView: boolean) => {
    setIsJourneyView(journeyView);
    await settingsStorage.setHomeViewMode(journeyView ? 'journey' : 'grid');
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard
      category={{
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        description: item.description,
      }}
      onPress={() => handleCategoryPress(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.blue} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderGridView = () => (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderJourneyView = () => (
    <JourneyView 
      categories={categories} 
      isJourneyView={isJourneyView}
      onToggle={handleViewToggle}
      onHabitToggle={handleHabitToggle}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {!isJourneyView && (
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Life Area</Text>
          <Text style={styles.subtitle}>What would you like to improve today?</Text>
        </View>
      )}
      
      {!isJourneyView && (
        <CompactToggle
          isJourneyView={isJourneyView}
          onToggle={handleViewToggle}
        />
      )}
      
      {isJourneyView ? renderJourneyView() : renderGridView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md - theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  list: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  journeyToggle: {
    marginTop: theme.spacing.md,
    marginBottom: 0,
  },
});