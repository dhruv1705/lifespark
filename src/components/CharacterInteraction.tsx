import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotivationMascot } from './MotivationMascot';
import { useCharacter } from '../context/CharacterContext';
import { theme } from '../theme';

interface CharacterInteractionProps {
  size?: 'small' | 'medium' | 'large';
  showInstructions?: boolean;
  context?: 'progress' | 'habits' | 'general';
}

export const CharacterInteraction: React.FC<CharacterInteractionProps> = ({
  size = 'medium',
  showInstructions = true,
  context = 'general',
}) => {
  const { characterState, interactWithCharacter, getMotivationalMessage, triggerCharacterMessage } = useCharacter();
  const [showTapHint, setShowTapHint] = useState(true);

  useEffect(() => {
    // Hide tap hint after a few seconds
    const timer = setTimeout(() => {
      setShowTapHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleCharacterPress = () => {
    setShowTapHint(false);
    
    // Generate context-specific messages
    if (context === 'progress') {
      const progressMessages = [
        "Look at all this amazing progress! 📈",
        "Your dedication is really paying off!",
        "Each milestone brings you closer to your goals!",
        "I'm so proud of how far you've come!",
        "This progress chart tells an incredible story!"
      ];
      const message = progressMessages[Math.floor(Math.random() * progressMessages.length)];
      triggerCharacterMessage(message, 'proud');
    } else if (context === 'habits') {
      const habitMessages = [
        "Building habits is like growing a garden! 🌱",
        "Consistency is your superpower!",
        "Every habit completed makes you stronger!",
        "Small actions, big results!",
        "You're creating positive change!"
      ];
      const message = habitMessages[Math.floor(Math.random() * habitMessages.length)];
      triggerCharacterMessage(message, 'encouraging');
    } else {
      interactWithCharacter();
    }
  };

  const getContextualTipMessage = () => {
    switch (context) {
      case 'progress':
        return "Tap me to celebrate your progress! 🎉";
      case 'habits':
        return "Tap me for habit building tips! 💡";
      default:
        return "Tap me for motivation! ✨";
    }
  };

  return (
    <View style={styles.container}>
      <MotivationMascot
        characterType={characterState.characterType}
        mood={characterState.mood}
        evolution={characterState.evolution}
        message={characterState.currentMessage}
        size={size}
        onPress={handleCharacterPress}
        showMessage={!!characterState.currentMessage}
        animated={true}
      />
      
      {showInstructions && showTapHint && !characterState.currentMessage && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {getContextualTipMessage()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.neutral.lightGray,
    ...theme.shadows.sm,
  },
  instructionText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});