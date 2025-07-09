import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

export type MascotMood = 'happy' | 'excited' | 'encouraging' | 'celebrating' | 'sleepy' | 'worried' | 'proud';
export type MascotEvolution = 'sprout' | 'growing' | 'blooming' | 'flourishing' | 'legendary';
export type CharacterType = 'plant' | 'dog' | 'cat' | 'owl' | 'penguin';

interface MotivationMascotProps {
  mood: MascotMood;
  evolution: MascotEvolution;
  characterType: CharacterType;
  message?: string;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showMessage?: boolean;
}

export const MotivationMascot: React.FC<MotivationMascotProps> = ({
  mood,
  evolution,
  characterType,
  message,
  animated = true,
  size = 'medium',
  onPress,
  showMessage = true,
}) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const [isBlinking, setIsBlinking] = useState(false);

  // Character definitions by type and evolution
  const getCharacterDefinitions = () => {
    const characters = {
      plant: {
        sprout: { emoji: '🌱', name: 'Sprout' },
        growing: { emoji: '🌿', name: 'Buddy' },
        blooming: { emoji: '🌺', name: 'Bloom' },
        flourishing: { emoji: '🌳', name: 'Sage' },
        legendary: { emoji: '✨🌟✨', name: 'Legend' }
      },
      dog: {
        sprout: { emoji: '🐕‍🦺', name: 'Pup' },
        growing: { emoji: '🐕', name: 'Buddy' },
        blooming: { emoji: '🐩', name: 'Dapper' },
        flourishing: { emoji: '🐕‍🎓', name: 'Graduate' },
        legendary: { emoji: '✨🐕‍🦺✨', name: 'Hero' }
      },
      cat: {
        sprout: { emoji: '🐱', name: 'Kitten' },
        growing: { emoji: '🐈', name: 'Cat' },
        blooming: { emoji: '🐈‍⬛', name: 'Sleek' },
        flourishing: { emoji: '😺', name: 'Wise' },
        legendary: { emoji: '✨😻✨', name: 'Majesty' }
      },
      owl: {
        sprout: { emoji: '🐣', name: 'Owlet' },
        growing: { emoji: '🦆', name: 'Young' },
        blooming: { emoji: '🦉', name: 'Wise' },
        flourishing: { emoji: '🦉📚', name: 'Scholar' },
        legendary: { emoji: '✨🦉✨', name: 'Oracle' }
      },
      penguin: {
        sprout: { emoji: '🥚', name: 'Egg' },
        growing: { emoji: '🐣', name: 'Chick' },
        blooming: { emoji: '🐧', name: 'Penguin' },
        flourishing: { emoji: '🐧👑', name: 'Royal' },
        legendary: { emoji: '✨🐧✨', name: 'Emperor' }
      }
    };
    
    return characters[characterType][evolution];
  };

  // Get character appearance based on type and evolution
  const getCharacterAppearance = () => {
    const character = getCharacterDefinitions();
    
    const themes = {
      plant: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
        glow: '#4CAF50',
      },
      dog: {
        backgroundColor: '#FFF8E1',
        borderColor: '#FF9800',
        glow: '#FF9800',
      },
      cat: {
        backgroundColor: '#F3E5F5',
        borderColor: '#9C27B0',
        glow: '#9C27B0',
      },
      owl: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
        glow: '#2196F3',
      },
      penguin: {
        backgroundColor: '#E8F5E8',
        borderColor: '#00BCD4',
        glow: '#00BCD4',
      }
    };
    
    return {
      character: character.emoji,
      name: character.name,
      ...themes[characterType]
    };
  };

  // Get character-specific mood expressions
  const getMoodExpression = () => {
    const base = getCharacterAppearance();
    
    const characterMoodEmojis = {
      plant: {
        happy: '😊', excited: '🤩', celebrating: '🥳', encouraging: '💪',
        sleepy: '😴', worried: '😟', proud: '😌'
      },
      dog: {
        happy: '😊', excited: '🤩', celebrating: '🥳', encouraging: '💪',
        sleepy: '😴', worried: '😟', proud: '😌'
      },
      cat: {
        happy: '😸', excited: '😻', celebrating: '😹', encouraging: '😺',
        sleepy: '😴', worried: '🙀', proud: '😏'
      },
      owl: {
        happy: '😊', excited: '🤩', celebrating: '🥳', encouraging: '💪',
        sleepy: '😴', worried: '😟', proud: '🧠'
      },
      penguin: {
        happy: '😊', excited: '🤩', celebrating: '🥳', encouraging: '💪',
        sleepy: '😴', worried: '😟', proud: '👑'
      }
    };
    
    const characterSparkles = {
      plant: {
        happy: '✨', excited: '🌟', celebrating: '🌺', encouraging: '💪',
        sleepy: '💤', worried: '💭', proud: '🌿'
      },
      dog: {
        happy: '🎾', excited: '🦴', celebrating: '🎉', encouraging: '💪',
        sleepy: '💤', worried: '💭', proud: '🏆'
      },
      cat: {
        happy: '😻', excited: '🐾', celebrating: '🎊', encouraging: '💪',
        sleepy: '💤', worried: '💭', proud: '👑'
      },
      owl: {
        happy: '📚', excited: '💡', celebrating: '🎓', encouraging: '💪',
        sleepy: '💤', worried: '💭', proud: '🌟'
      },
      penguin: {
        happy: '❄️', excited: '🧊', celebrating: '🎉', encouraging: '💪',
        sleepy: '💤', worried: '💭', proud: '👑'
      }
    };
    
    return {
      ...base,
      expression: characterMoodEmojis[characterType][mood] || '😊',
      sparkles: characterSparkles[characterType][mood] || '✨'
    };
  };

  const appearance = getMoodExpression();
  const sizeConfig = getSizeConfig(size);
  
  // Get character-specific animation timing
  const getAnimationTiming = () => {
    const timings = {
      plant: { bounceSpeed: 2500, intensity: 1.1, blinkInterval: 4000 },
      dog: { bounceSpeed: 800, intensity: 1.3, blinkInterval: 2000 },
      cat: { bounceSpeed: 3000, intensity: 1.05, blinkInterval: 5000 },
      owl: { bounceSpeed: 2000, intensity: 1.08, blinkInterval: 3500 },
      penguin: { bounceSpeed: 1500, intensity: 1.15, blinkInterval: 3000 }
    };
    
    return timings[characterType];
  };
  
  const animationTiming = getAnimationTiming();

  useEffect(() => {
    if (!animated) return;

    // Character-specific bounce animation
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: animationTiming.intensity,
          duration: animationTiming.bounceSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1 - (animationTiming.intensity - 1) / 2,
          duration: animationTiming.bounceSpeed * 0.75,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: animationTiming.bounceSpeed * 0.5,
          useNativeDriver: true,
        }),
      ])
    );

    // Character-specific glow effect
    const glowIntensity = mood === 'celebrating' || mood === 'excited' ? 1 : 0.3;
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: glowIntensity,
          duration: animationTiming.bounceSpeed * 0.75,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: animationTiming.bounceSpeed * 0.75,
          useNativeDriver: true,
        }),
      ])
    );

    bounceLoop.start();
    glowLoop.start();

    // Character-specific blinking
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsBlinking(true);
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start(() => setIsBlinking(false));
      }
    }, animationTiming.blinkInterval);

    return () => {
      bounceLoop.stop();
      glowLoop.stop();
      clearInterval(blinkInterval);
    };
  }, [animated, mood, characterType, animationTiming]);

  // Show message animation
  useEffect(() => {
    if (message && showMessage) {
      Animated.sequence([
        Animated.timing(messageAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(messageAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [message, showMessage]);

  const handlePress = () => {
    if (onPress) {
      // Character-specific press animation
      const pressAnimations = {
        plant: { compress: 0.9, expand: 1.1, duration: 200 },
        dog: { compress: 0.85, expand: 1.4, duration: 100 },
        cat: { compress: 0.95, expand: 1.05, duration: 300 },
        owl: { compress: 0.9, expand: 1.15, duration: 150 },
        penguin: { compress: 0.9, expand: 1.2, duration: 120 }
      };
      
      const pressConfig = pressAnimations[characterType];
      
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: pressConfig.compress,
          duration: pressConfig.duration / 2,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: pressConfig.expand,
          tension: 300,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: pressConfig.duration,
          useNativeDriver: true,
        }),
      ]).start();

      onPress();
    }
  };

  const MascotContent = (
    <View style={[styles.container, sizeConfig.container]}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          sizeConfig.glow,
          {
            backgroundColor: appearance.glow + '30',
            opacity: glowAnim,
          },
        ]}
      />

      {/* Main character */}
      <Animated.View
        style={[
          styles.character,
          sizeConfig.character,
          {
            backgroundColor: appearance.backgroundColor,
            borderColor: appearance.borderColor,
            transform: [
              { scale: bounceAnim },
              { scaleY: isBlinking ? blinkAnim : 1 },
            ],
          },
        ]}
      >
        <Text style={[styles.characterEmoji, sizeConfig.emoji]}>
          {appearance.character}
        </Text>
        
        {/* Mood expression overlay */}
        <View style={styles.expressionOverlay}>
          <Text style={[styles.expression, sizeConfig.expression]}>
            {appearance.expression}
          </Text>
        </View>
      </Animated.View>

      {/* Floating sparkles */}
      <Animated.View
        style={[
          styles.sparkles,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      >
        <Text style={[styles.sparkle, sizeConfig.sparkles]}>
          {appearance.sparkles}
        </Text>
      </Animated.View>

      {/* Character name */}
      <Text style={[styles.name, sizeConfig.name]}>
        {appearance.name}
      </Text>

      {/* Message bubble */}
      {message && showMessage && (
        <Animated.View
          style={[
            styles.messageBubble,
            sizeConfig.message,
            {
              opacity: messageAnim,
              transform: [
                {
                  translateY: messageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.messageText, sizeConfig.messageText]}>
            {message}
          </Text>
          {/* Speech bubble tail */}
          <View style={styles.bubbleTail} />
        </Animated.View>
      )}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      {MascotContent}
    </TouchableOpacity>
  ) : (
    MascotContent
  );
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: { width: 80, height: 80 },
        character: { width: 60, height: 60 },
        glow: { width: 70, height: 70 },
        emoji: { fontSize: 24 },
        expression: { fontSize: 12 },
        sparkles: { fontSize: 14 },
        name: { fontSize: 10 },
        message: { maxWidth: 120 },
        messageText: { fontSize: 11 },
      };
    case 'large':
      return {
        container: { width: 140, height: 140 },
        character: { width: 100, height: 100 },
        glow: { width: 120, height: 120 },
        emoji: { fontSize: 40 },
        expression: { fontSize: 20 },
        sparkles: { fontSize: 22 },
        name: { fontSize: 16 },
        message: { maxWidth: 200 },
        messageText: { fontSize: 14 },
      };
    default: // medium
      return {
        container: { width: 100, height: 100 },
        character: { width: 80, height: 80 },
        glow: { width: 90, height: 90 },
        emoji: { fontSize: 32 },
        expression: { fontSize: 16 },
        sparkles: { fontSize: 18 },
        name: { fontSize: 12 },
        message: { maxWidth: 160 },
        messageText: { fontSize: 12 },
      };
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  character: {
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    position: 'relative',
    overflow: 'hidden',
  },
  characterEmoji: {
    textAlign: 'center',
  },
  expressionOverlay: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  expression: {
    textAlign: 'center',
  },
  sparkles: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle: {
    textAlign: 'center',
  },
  name: {
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  messageBubble: {
    position: 'absolute',
    top: -60,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral.lightGray,
    ...theme.shadows.sm,
  },
  messageText: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.surface,
  },
});