import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ConfettiPiece {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
  emoji: string;
}

interface ConfettiCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  colors?: string[];
  emojis?: string[];
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  visible,
  onComplete,
  intensity = 'medium',
  duration = 3000,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  emojis = ['🎉', '⭐', '🏆', '🎊', '✨', '🌟', '💫', '🎈'],
}) => {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Get number of confetti pieces based on intensity
  const getConfettiCount = () => {
    switch (intensity) {
      case 'low': return 15;
      case 'medium': return 25;
      case 'high': return 40;
      default: return 25;
    }
  };

  // Create confetti pieces
  const createConfetti = () => {
    const pieces: ConfettiPiece[] = [];
    const count = getConfettiCount();

    for (let i = 0; i < count; i++) {
      pieces.push({
        id: `confetti-${i}`,
        x: new Animated.Value(Math.random() * screenWidth),
        y: new Animated.Value(-50),
        rotation: new Animated.Value(Math.random() * 360),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }

    return pieces;
  };

  // Animate confetti falling
  const animateConfetti = (pieces: ConfettiPiece[]) => {
    const animations = pieces.map((piece) => {
      return Animated.parallel([
        // Falling animation
        Animated.timing(piece.y, {
          toValue: screenHeight + 100,
          duration: duration,
          useNativeDriver: true,
        }),
        // Horizontal drift
        Animated.timing(piece.x, {
          toValue: piece.x._value + (Math.random() - 0.5) * 200,
          duration: duration,
          useNativeDriver: true,
        }),
        // Rotation animation
        Animated.timing(piece.rotation, {
          toValue: piece.rotation._value + 360 * 2,
          duration: duration,
          useNativeDriver: true,
        }),
        // Scale animation (slight pulsing)
        Animated.sequence([
          Animated.timing(piece.scale, {
            toValue: piece.scale._value * 1.2,
            duration: duration * 0.1,
            useNativeDriver: true,
          }),
          Animated.timing(piece.scale, {
            toValue: piece.scale._value * 0.8,
            duration: duration * 0.9,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    return Animated.parallel(animations);
  };

  useEffect(() => {
    if (visible) {
      const pieces = createConfetti();
      setConfettiPieces(pieces);

      // Use setTimeout to avoid scheduling updates during render
      const timeoutId = setTimeout(() => {
        animationRef.current = animateConfetti(pieces);
        animationRef.current.start((finished) => {
          if (finished) {
            setConfettiPieces([]);
            onComplete?.();
          }
        });
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
      };
    } else {
      // Stop animation if visible becomes false
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      setConfettiPieces([]);
    }
  }, [visible, intensity, duration]);

  if (!visible || confettiPieces.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confettiPiece,
            {
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                { rotate: piece.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
                { scale: piece.scale },
              ],
            },
          ]}
        >
          <Animated.Text style={[styles.emoji, { color: piece.color }]}>
            {piece.emoji}
          </Animated.Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
  },
  emoji: {
    fontSize: 20,
    textAlign: 'center',
  },
});