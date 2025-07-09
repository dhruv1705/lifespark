import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MotivationMascot } from './MotivationMascot';
import { useCharacter } from '../context/CharacterContext';
import { theme } from '../theme';

interface HabitSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'health' | 'productivity' | 'mindfulness' | 'learning' | 'social';
  estimatedTime: string;
  characterMessage: string;
}

interface CharacterHabitSuggestionsProps {
  userLevel: number;
  currentStreak: number;
  completedCategories: string[];
  onSuggestionSelect?: (suggestion: HabitSuggestion) => void;
}

export const CharacterHabitSuggestions: React.FC<CharacterHabitSuggestionsProps> = ({
  userLevel,
  currentStreak,
  completedCategories,
  onSuggestionSelect,
}) => {
  const { characterState, triggerCharacterMessage } = useCharacter();
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<HabitSuggestion | null>(null);

  // Generate personalized habit suggestions based on user progress
  const generateSuggestions = (): HabitSuggestion[] => {
    const allSuggestions: HabitSuggestion[] = [
      // Easy habits for beginners
      {
        id: 'drink-water',
        title: 'Drink a Glass of Water',
        description: 'Start your day with hydration',
        difficulty: 'easy',
        category: 'health',
        estimatedTime: '1 min',
        characterMessage: 'Hydration is the foundation of feeling great! 💧'
      },
      {
        id: 'deep-breath',
        title: 'Take 3 Deep Breaths',
        description: 'Simple mindfulness practice',
        difficulty: 'easy',
        category: 'mindfulness',
        estimatedTime: '1 min',
        characterMessage: 'Breathing deeply helps calm your mind and body! 🌬️'
      },
      {
        id: 'make-bed',
        title: 'Make Your Bed',
        description: 'Start the day with accomplishment',
        difficulty: 'easy',
        category: 'productivity',
        estimatedTime: '2 min',
        characterMessage: 'A made bed sets the tone for a productive day! 🛏️'
      },
      
      // Medium difficulty habits
      {
        id: 'walk-10min',
        title: '10-Minute Walk',
        description: 'Get your body moving',
        difficulty: 'medium',
        category: 'health',
        estimatedTime: '10 min',
        characterMessage: 'Walking boosts your energy and clears your mind! 🚶‍♀️'
      },
      {
        id: 'journal-gratitude',
        title: 'Write 3 Gratitudes',
        description: 'Practice daily gratitude',
        difficulty: 'medium',
        category: 'mindfulness',
        estimatedTime: '5 min',
        characterMessage: 'Gratitude transforms how we see the world! ✨'
      },
      {
        id: 'read-pages',
        title: 'Read 5 Pages',
        description: 'Daily learning habit',
        difficulty: 'medium',
        category: 'learning',
        estimatedTime: '10 min',
        characterMessage: 'Every page you read makes you wiser! 📚'
      },
      
      // Advanced habits for experienced users
      {
        id: 'workout-30min',
        title: '30-Minute Workout',
        description: 'Full exercise session',
        difficulty: 'hard',
        category: 'health',
        estimatedTime: '30 min',
        characterMessage: 'You\'re ready for bigger challenges! Let\'s get strong! 💪'
      },
      {
        id: 'meditation-15min',
        title: '15-Minute Meditation',
        description: 'Deep mindfulness practice',
        difficulty: 'hard',
        category: 'mindfulness',
        estimatedTime: '15 min',
        characterMessage: 'Advanced meditation will bring you inner peace! 🧘‍♀️'
      },
      {
        id: 'call-friend',
        title: 'Call a Friend',
        description: 'Strengthen relationships',
        difficulty: 'medium',
        category: 'social',
        estimatedTime: '15 min',
        characterMessage: 'Connection with others enriches your life! 📞'
      },
    ];

    // Filter suggestions based on user level and current habits
    let filteredSuggestions = allSuggestions.filter(suggestion => {
      // Beginner users (level 1-3): only easy and some medium habits
      if (userLevel <= 3) {
        return suggestion.difficulty === 'easy' || 
               (suggestion.difficulty === 'medium' && currentStreak >= 3);
      }
      // Intermediate users (level 4-7): easy and medium habits
      else if (userLevel <= 7) {
        return suggestion.difficulty !== 'hard';
      }
      // Advanced users (level 8+): all habits
      else {
        return true;
      }
    });

    // Prioritize categories user hasn't explored much
    const unexploredCategories = ['health', 'productivity', 'mindfulness', 'learning', 'social']
      .filter(cat => !completedCategories.includes(cat));
    
    if (unexploredCategories.length > 0) {
      const unexploredSuggestions = filteredSuggestions.filter(s => 
        unexploredCategories.includes(s.category)
      );
      
      if (unexploredSuggestions.length >= 3) {
        filteredSuggestions = unexploredSuggestions;
      }
    }

    // Return 3-4 suggestions
    return filteredSuggestions.slice(0, 4);
  };

  useEffect(() => {
    const newSuggestions = generateSuggestions();
    setSuggestions(newSuggestions);
  }, [userLevel, currentStreak, completedCategories]);

  const handleSuggestionPress = (suggestion: HabitSuggestion) => {
    setSelectedSuggestion(suggestion);
    triggerCharacterMessage(suggestion.characterMessage, 'encouraging');
    onSuggestionSelect?.(suggestion);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.primary.green;
      case 'medium': return theme.colors.secondary.orange;
      case 'hard': return theme.colors.secondary.purple;
      default: return theme.colors.text.secondary;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'health': return '💪';
      case 'productivity': return '⚡';
      case 'mindfulness': return '🧘‍♀️';
      case 'learning': return '📚';
      case 'social': return '👥';
      default: return '✨';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MotivationMascot
          characterType={characterState.characterType}
          mood={characterState.mood}
          evolution={characterState.evolution}
          size="small"
          animated={true}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>Habit Suggestions</Text>
          <Text style={styles.subtitle}>
            {characterState.evolution === 'sprout' 
              ? "Let's start with something simple!"
              : characterState.evolution === 'legendary'
              ? "Ready for your next challenge?"
              : "Here are some ideas for you!"
            }
          </Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.suggestionCard,
              selectedSuggestion?.id === suggestion.id && styles.selectedCard
            ]}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.categoryEmoji}>
                {getCategoryEmoji(suggestion.category)}
              </Text>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(suggestion.difficulty) + '20' }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(suggestion.difficulty) }
                ]}>
                  {suggestion.difficulty}
                </Text>
              </View>
            </View>
            
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.estimatedTime}>⏱️ {suggestion.estimatedTime}</Text>
              <Text style={styles.tryItText}>Tap to try!</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs / 2,
  },
  suggestionsContainer: {
    paddingRight: theme.spacing.md,
  },
  suggestionCard: {
    width: 160,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral.lightGray,
    ...theme.shadows.sm,
  },
  selectedCard: {
    borderColor: theme.colors.primary.blue,
    borderWidth: 2,
    backgroundColor: theme.colors.primary.blue + '10',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'capitalize',
  },
  suggestionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  suggestionDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimatedTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  tryItText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary.blue,
    fontWeight: theme.typography.weights.medium,
  },
});