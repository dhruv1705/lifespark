import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  BackHandler,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useCelebration } from '../context/CelebrationContext';
import { DataService } from '../services/dataService';
import { dataSync, DATA_SYNC_EVENTS } from '../utils/dataSync';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { StreakService } from '../services/streakService';

const { width, height } = Dimensions.get('window');

interface VideoPlayerScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'VideoPlayer'>;
  route: RouteProp<RootStackParamList, 'VideoPlayer'>;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  navigation,
  route,
}) => {
  const { videoUrl, title, habitId, habitXp } = route.params;
  const { user } = useAuth();
  const { triggerCelebration } = useCelebration();
  
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [hasCompletedVideo, setHasCompletedVideo] = useState(false);
  const [completionThreshold] = useState(0.95); 

  const isLoaded = status?.isLoaded || false;
  const isPlaying = isLoaded && status && 'isPlaying' in status ? status.isPlaying : false;
  const currentTime = isLoaded && status && 'positionMillis' in status ? status.positionMillis / 1000 : 0;
  const duration = isLoaded && status && 'durationMillis' in status ? (status.durationMillis || 0) / 1000 : 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  useEffect(() => {
    const backAction = () => {
      handleExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      const { orientationInfo } = event;
      const isCurrentlyLandscape = orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                                   orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsLandscape(isCurrentlyLandscape);
    });

    return () => {
      backHandler.remove();
      clearTimeout(timer);
      subscription?.remove();
    };
  }, []);

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    
    if (playbackStatus.isLoaded) {
      const currentProgress = playbackStatus.positionMillis / (playbackStatus.durationMillis || 1);
      const currentTimeSeconds = playbackStatus.positionMillis / 1000;
      const durationSeconds = (playbackStatus.durationMillis || 0) / 1000;
      const progressPercentage = currentProgress * 100;
      
      console.log(`⏰ Video progress: ${currentTimeSeconds.toFixed(1)}s/${durationSeconds.toFixed(1)}s (${progressPercentage.toFixed(1)}%) - completion at: ${(completionThreshold * 100).toFixed(1)}%`);
    
      if (habitId && progressPercentage > 0) {
        dataSync.emit(DATA_SYNC_EVENTS.HABIT_PROGRESS_UPDATED, {
          habitId,
          progress: progressPercentage,
        });
      }

      if (currentProgress >= completionThreshold && !hasCompletedVideo && durationSeconds > 0) {
        console.log(`🎯 Triggering video completion - threshold reached!`);
        handleVideoCompletion();
      }
    }
  };

  const handleVideoCompletion = async () => {
    if (hasCompletedVideo || !user || !habitId) return;
    setHasCompletedVideo(true);

    try {
      const xpToAward = habitXp || 0;
      console.log(`✅ Video for habit ${habitId} completed. Awarding ${xpToAward} XP.`);
      
      const wasCompleted = await DataService.toggleHabitCompletion(user.id, habitId, xpToAward);
      
      if (wasCompleted) {
        dataSync.emit(DATA_SYNC_EVENTS.HABIT_TOGGLED, {
          habitId,
          completed: true,
          xp: xpToAward,
        });

        triggerCelebration({
          type: 'habit_completed',
          intensity: 'medium',
          title: 'Habit Complete!',
          message: `Great job on completing: ${title}`,
        });

        // Record streak and check if it's first task of the day
        const streakData = await StreakService.recordTaskCompletion(user.id, habitId);
        
        // Navigate to TaskCompleted screen
        navigation.navigate('TaskCompleted', {
          taskTitle: title || 'Video Exercise',
          xpEarned: xpToAward,
          streakDay: streakData.streakDay,
          isFirstTaskOfDay: streakData.isFirstTaskOfDay,
        });
      }
    } catch (error) {
      console.error('Error handling video completion:', error);
    }
  };

  const handleExit = async () => {
    if (isLandscape) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('visible');
      }
    }
    navigation.goBack();
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    
    if (!showControls) {
      setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleSeek = async (seekPercentage: number) => {
    if (!videoRef.current || !isLoaded || !status || !('durationMillis' in status) || !status.durationMillis) return;
    
    try {
      const seekPosition = seekPercentage * status.durationMillis;
      await videoRef.current.setPositionAsync(seekPosition);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const skipForward = async () => {
    if (!videoRef.current || !isLoaded || !status || !('positionMillis' in status) || !('durationMillis' in status)) return;
    
    try {
      const newPosition = Math.min(status.positionMillis + 10000, status.durationMillis || 0);
      await videoRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };

  const skipBackward = async () => {
    if (!videoRef.current || !isLoaded || !status || !('positionMillis' in status)) return;
    
    try {
      const newPosition = Math.max(status.positionMillis - 10000, 0); 
      await videoRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('visible');
        }
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden');
        }
      }
    } catch (error) {
      console.log('Error changing orientation:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <Video
        ref={videoRef}
        style={[styles.video, isLandscape && styles.landscapeVideo]}
        source={{ uri: videoUrl }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={true}
        isLooping={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        useNativeControls={false}
      />

      {/* Loading State */}
      {!isLoaded && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Custom Overlay Controls */}
      {showControls && isLoaded && (
        <View style={[styles.overlay, isLandscape && styles.landscapeOverlay]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={[styles.header, isLandscape && styles.landscapeHeader]}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleExit}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              
              {title && !isLandscape && (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              )}
            </View>
            
            {/* Center Controls */}
            <View style={styles.centerControls}>
              <View style={styles.playbackControls}>
                <TouchableOpacity 
                  style={styles.skipButton} 
                  onPress={skipBackward}
                >
                  <Text style={styles.skipIcon}>⏪</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.playPauseButton} 
                  onPress={togglePlayPause}
                >
                  <Text style={styles.playPauseIcon}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.skipButton} 
                  onPress={skipForward}
                >
                  <Text style={styles.skipIcon}>⏩</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={[styles.bottomControls, isLandscape && styles.landscapeBottomControls]}>
              <View style={[styles.progressContainer, isLandscape && styles.landscapeProgressContainer]}>
                <TouchableOpacity 
                  style={styles.rotateButton}
                  onPress={toggleFullscreen}
                >
                  <Text style={styles.rotateIcon}>
                    {isLandscape ? '📱' : '🔄'}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                
                <TouchableOpacity 
                  style={styles.progressBarContainer}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    const progressBarWidth = 250; // Approximate width
                    const seekPercentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
                    handleSeek(seekPercentage);
                  }}
                >
                  <View style={styles.progressBar}>
                    <View style={styles.progressTrack}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${progress * 100}%` }
                        ]} 
                      />
                      <View
                        style={[
                          styles.progressThumb,
                          { left: `${progress * 100}%` }
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
              

            </View>
          </SafeAreaView>
        </View>
      )}

      {/* Tap to toggle controls */}
      <TouchableOpacity 
        style={styles.tapArea}
        onPress={toggleControls}
        activeOpacity={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  landscapeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  video: {
    width: width,
    height: height,
  },
  landscapeVideo: {
    width: height, 
    height: width,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  landscapeOverlay: {
    zIndex: 1001,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  landscapeHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 32,
    color: '#000000',
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIcon: {
    fontSize: 24,
    color: '#000000',
  },

  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  landscapeBottomControls: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  landscapeProgressContainer: {
    marginBottom: theme.spacing.sm,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 45,
  },
  rotateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rotateIcon: {
    fontSize: 20,
    color: '#000000',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressBar: {
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginLeft: -8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  landscapeControlsRow: {
    gap: theme.spacing.md,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  speedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -25 }],
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});