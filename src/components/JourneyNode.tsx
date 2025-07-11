import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import LottieView from 'lottie-react-native';
import { theme } from '../theme';
import { getAnimationByTitle, hasAnimation } from '../data/animationMappings';

export type NodeStatus = 'current' | 'completed' | 'locked' | 'bonus';

interface JourneyNodeProps {
  id: string;
  title: string;
  emoji: string;
  status: NodeStatus;
  progress?: number; 
  onPress: () => void;
  position: 'left' | 'right' | 'center';
}

export const JourneyNode: React.FC<JourneyNodeProps> = ({
  id,
  title,
  emoji,
  status,
  progress = 0,
  onPress,
  position,
}) => {
  const getNodeStyle = () => {
    switch (status) {
      case 'current':
        return [styles.nodeBase, styles.currentNode];
      case 'completed':
        return [styles.nodeBase, styles.completedNode];
      case 'locked':
        return [styles.nodeBase, styles.lockedNode];
      case 'bonus':
        return [styles.nodeBase, styles.bonusNode];
      default:
        return [styles.nodeBase, styles.lockedNode];
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'current':
        return theme.colors.text.primary;
      case 'completed':
        return theme.colors.text.primary;
      case 'locked':
        return theme.colors.text.secondary;
      case 'bonus':
        return theme.colors.text.primary;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getNodeOpacity = () => {
    switch (status) {
      case 'current':
        return 1;
      case 'completed':
        return 1;
      case 'locked':
        return 0.5;
      case 'bonus':
        return 1;
      default:
        return 0.5;
    }
  };

  const getProgressColors = () => {
    switch (status) {
      case 'current':
        return {
          active: '#4CAF50', 
          inactive: '#E8F5E8',
        };
      case 'completed':
        return {
          active: '#2196F3', 
          inactive: '#E3F2FD', 
        };
      case 'locked':
        return {
          active: '#9E9E9E',
          inactive: '#F5F5F5', 
        };
      case 'bonus':
        return {
          active: '#FF9800', 
          inactive: '#FFF3E0', 
        };
      default:
        return {
          active: '#9E9E9E',
          inactive: '#F5F5F5',
        };
    }
  };

  const handlePress = () => {
    Vibration.vibrate(350); 
    onPress();
  };

  return (
    <View style={[styles.container, styles[`${position}Container`]]}>
      <View style={styles.nodeWrapper}>
        <TouchableOpacity
          style={[getNodeStyle(), { opacity: getNodeOpacity() }]}
          onPress={handlePress}
          disabled={false}
          activeOpacity={0.7}
        >
          <CircularProgress
            value={progress}
            radius={37}
            duration={500}
            activeStrokeColor={getProgressColors().active}
            inActiveStrokeColor={getProgressColors().inactive}
            inActiveStrokeOpacity={1}
            activeStrokeWidth={6}
            inActiveStrokeWidth={6}
            maxValue={100}
            titleStyle={{fontWeight: 'bold', fontSize: 28}}
            titleColor={theme.colors.text.primary}
            progressValueColor={'transparent'}
            valueSuffix={''}
            delay={0}
            subtitle={''}
            showProgressValue={false}
            title={hasAnimation(title) ? '' : emoji}
            circleBackgroundColor={'#FFFFFF'}
            onAnimationComplete={() => {}}
          />
          
          {/* Show Lottie animation for mapped titles */}
          {hasAnimation(title) && (
            <View style={styles.lottieContainer}>
              <LottieView
                source={getAnimationByTitle(title)}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </View>
          )}
          
          {status === 'completed' && (
            <View style={styles.starsContainer}>
              <Text style={styles.star}>⭐</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.labelContainer}>
          <Text style={[styles.nodeTitle, { color: getTextColor() }]} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  leftContainer: {
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.xl,
  },
  rightContainer: {
    alignSelf: 'flex-end',
    marginRight: theme.spacing.xl,
  },
  centerContainer: {
    alignSelf: 'center',
  },
  nodeWrapper: {
    alignItems: 'center',
    paddingBottom: 12, 
  },
  nodeBase: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  currentNode: {
    borderWidth: 0,
  },
  completedNode: {
    borderWidth: 0,
  },
  lockedNode: {
    borderWidth: 0,
  },
  bonusNode: {
    borderWidth: 0,
  },
  emoji: {
    fontSize: 32,
  },
  starsContainer: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  labelContainer: {
    maxWidth: 140,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
    marginTop: 4, 
    paddingHorizontal: theme.spacing.xs, 
  },
  nodeTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
    marginTop: 0, 
    lineHeight: 18, 
  },
  lottieContainer: {
    position: 'absolute',
    top: 8,
    left: '50%',
    width: 64,
    height: 64,
    marginLeft: -32,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
  },
});