import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

interface CompactToggleProps {
  isJourneyView: boolean;
  onToggle: (isJourneyView: boolean) => void;
  style?: any;
}

export const CompactToggle: React.FC<CompactToggleProps> = ({ 
  isJourneyView, 
  onToggle, 
  style 
}) => {
  const slideAnimation = useRef(new Animated.Value(isJourneyView ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: isJourneyView ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isJourneyView]);

  const handleToggle = () => {
    onToggle(!isJourneyView);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.toggleContainer} 
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.track}>
          <Animated.View 
            style={[
              styles.thumb,
              {
                transform: [{
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 42], // Slide from left to right
                  })
                }]
              }
            ]}
          />
        </View>
        
        <View style={styles.labelsContainer}>
          <Text style={[
            styles.label,
            !isJourneyView && styles.activeLabel
          ]}>
            Grid
          </Text>
          <Text style={[
            styles.label,
            isJourneyView && styles.activeLabel
          ]}>
            Journey
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  toggleContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  track: {
    width: 80,
    height: 32,
    backgroundColor: theme.colors.border,
    borderRadius: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    width: 36,
    height: 28,
    backgroundColor: theme.colors.primary.green,
    borderRadius: 14,
    ...theme.shadows.sm,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
    marginTop: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  activeLabel: {
    color: theme.colors.primary.green,
    fontWeight: theme.typography.weights.semibold,
  },
});