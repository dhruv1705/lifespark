import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions 
} from 'react-native';
import { MotivationMascot, CharacterType } from '../components/MotivationMascot';
import { useCharacter } from '../context/CharacterContext';
import { theme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

interface CharacterSelectionScreenProps {
  onComplete: () => void;
}

interface CharacterInfo {
  type: CharacterType;
  name: string;
  personality: string[];
  description: string;
  welcomeMessage: string;
}

const characterInfo: CharacterInfo[] = [
  {
    type: 'plant',
    name: 'Nature Buddy',
    personality: ['Patient', 'Encouraging', 'Growing'],
    description: 'Grows with you through every season of life',
    welcomeMessage: 'Let\'s bloom together! 🌱'
  },
  {
    type: 'dog',
    name: 'Loyal Companion',
    personality: ['Enthusiastic', 'Loyal', 'Supportive'],
    description: 'Your faithful friend who never gives up on you',
    welcomeMessage: 'Ready for adventure! 🐕'
  },
  {
    type: 'cat',
    name: 'Independent Mentor',
    personality: ['Wise', 'Independent', 'Sassy'],
    description: 'Offers wisdom with a touch of attitude',
    welcomeMessage: 'I suppose I\'ll help you... 😸'
  },
  {
    type: 'owl',
    name: 'Wise Guide',
    personality: ['Knowledgeable', 'Patient', 'Wise'],
    description: 'Ancient wisdom for modern habits',
    welcomeMessage: 'Knowledge grows with practice! 🦉'
  },
  {
    type: 'penguin',
    name: 'Determined Leader',
    personality: ['Resilient', 'Community-focused', 'Determined'],
    description: 'Marches towards goals with unstoppable spirit',
    welcomeMessage: 'Let\'s waddle to success! 🐧'
  }
];

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({ onComplete }) => {
  const { selectCharacter } = useCharacter();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [previewCharacter, setPreviewCharacter] = useState<CharacterType>('plant');
  const [showPreview, setShowPreview] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCharacterSelect = (characterType: CharacterType) => {
    setSelectedCharacter(characterType);
    setPreviewCharacter(characterType);
    setShowPreview(true);
    
    // Preview animation
    Animated.spring(previewAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleConfirmSelection = () => {
    if (selectedCharacter) {
      selectCharacter(selectedCharacter);
      onComplete();
    }
  };

  const handleSkip = () => {
    selectCharacter('plant'); // Default to plant
    onComplete();
  };

  const getPersonalityColor = (trait: string) => {
    const colors = {
      'Patient': theme.colors.primary.green,
      'Encouraging': theme.colors.primary.green,
      'Growing': theme.colors.primary.green,
      'Enthusiastic': theme.colors.secondary.orange,
      'Loyal': theme.colors.secondary.orange,
      'Supportive': theme.colors.secondary.orange,
      'Wise': theme.colors.secondary.purple,
      'Independent': theme.colors.secondary.purple,
      'Sassy': theme.colors.secondary.purple,
      'Knowledgeable': theme.colors.primary.blue,
      'Resilient': theme.colors.primary.blue,
      'Community-focused': theme.colors.primary.blue,
      'Determined': theme.colors.primary.blue,
    };
    return colors[trait] || theme.colors.text.secondary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Buddy!</Text>
          <Text style={styles.subtitle}>
            Select a companion to guide you on your habit journey
          </Text>
        </View>

        {showPreview && (
          <Animated.View 
            style={[
              styles.previewContainer,
              {
                opacity: previewAnim,
                transform: [{ scale: previewAnim }],
              }
            ]}
          >
            <MotivationMascot
              characterType={previewCharacter}
              mood="happy"
              evolution="sprout"
              size="large"
              animated={true}
            />
            <Text style={styles.previewText}>
              {characterInfo.find(c => c.type === previewCharacter)?.welcomeMessage}
            </Text>
          </Animated.View>
        )}

        <View style={styles.charactersGrid}>
          {characterInfo.map((character) => (
            <TouchableOpacity
              key={character.type}
              style={[
                styles.characterCard,
                selectedCharacter === character.type && styles.selectedCard
              ]}
              onPress={() => handleCharacterSelect(character.type)}
            >
              <View style={styles.characterPreview}>
                <MotivationMascot
                  characterType={character.type}
                  mood="happy"
                  evolution="blooming"
                  size="medium"
                  animated={true}
                />
              </View>
              
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterDescription}>{character.description}</Text>
              
              <View style={styles.personalityTags}>
                {character.personality.map((trait) => (
                  <View 
                    key={trait}
                    style={[
                      styles.personalityTag,
                      { backgroundColor: getPersonalityColor(trait) + '20' }
                    ]}
                  >
                    <Text style={[
                      styles.personalityText,
                      { color: getPersonalityColor(trait) }
                    ]}>
                      {trait}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.selectIndicator}>
                <Text style={styles.selectText}>
                  {selectedCharacter === character.type ? 'Selected! ✓' : 'Tap to select'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionButtons}>
          {selectedCharacter && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmSelection}
            >
              <Text style={styles.confirmButtonText}>
                Continue with {characterInfo.find(c => c.type === selectedCharacter)?.name}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  previewText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  charactersGrid: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  characterCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.neutral.lightGray,
    ...theme.shadows.sm,
  },
  selectedCard: {
    borderColor: theme.colors.primary.blue,
    backgroundColor: theme.colors.primary.blue + '10',
  },
  characterPreview: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  characterName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  characterDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  personalityTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  personalityText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  selectIndicator: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral.lightGray,
  },
  selectText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary.blue,
  },
  actionButtons: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary.blue,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  confirmButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: 'white',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  skipButtonText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
});