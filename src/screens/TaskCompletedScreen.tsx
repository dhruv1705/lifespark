import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { theme } from '../theme';
import { RootStackParamList } from '../types';
import { useCelebration } from '../context/CelebrationContext';

type TaskCompletedScreenRouteProp = RouteProp<RootStackParamList, 'TaskCompleted'>;
type TaskCompletedScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskCompleted'>;

interface TaskCompletedScreenProps {}

export const TaskCompletedScreen: React.FC<TaskCompletedScreenProps> = () => {
  const navigation = useNavigation<TaskCompletedScreenNavigationProp>();
  const route = useRoute<TaskCompletedScreenRouteProp>();
  const { triggerCelebration } = useCelebration();
  
  const { taskTitle, xpEarned = 0, streakDay, isFirstTaskOfDay } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    triggerCelebration({
      type: 'habit_completed',
      intensity: 'high',
      title: 'Task Completed!',
      message: `Great job completing: ${taskTitle}`,
    });

    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('Categories');
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: celebrationAnim }] }]}>
          <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary.green} />
        </Animated.View>

        <Text style={styles.completedText}>Task Completed!</Text>

        <Text style={styles.taskTitle}>{taskTitle}</Text>

        {/* XP Earned */}
        {xpEarned > 0 && (
          <View style={styles.xpContainer}>
            <Ionicons name="star" size={20} color={theme.colors.secondary.orange} />
            <Text style={styles.xpText}>+{xpEarned} XP</Text>
          </View>
        )}

        {/* Streak Information */}
        {isFirstTaskOfDay && streakDay && (
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={20} color={theme.colors.secondary.orange} />
            <Text style={styles.streakText}>Day {streakDay}</Text>
          </View>
        )}

        {/* Celebration Message */}
        <Text style={styles.celebrationMessage}>
          {isFirstTaskOfDay && streakDay ? 
            `Day ${streakDay} streak! Great job! Keep up the momentum! 🔥` : 
            'Great job! Keep up the momentum! 🎉'
          }
        </Text>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Background decoration */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  completedText: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  taskTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
  },
  xpText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
    marginLeft: theme.spacing.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
  },
  streakText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary.orange,
    marginLeft: theme.spacing.xs,
  },
  celebrationMessage: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.md,
  },
  continueButton: {
    backgroundColor: theme.colors.primary.blue,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  continueButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.primary.green,
    top: height * 0.1,
    left: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: theme.colors.secondary.orange,
    bottom: height * 0.2,
    right: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.primary.blue,
    top: height * 0.3,
    right: width * 0.1,
  },
}); 