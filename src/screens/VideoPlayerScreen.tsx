import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  BackHandler,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { useCelebration } from '../context/CelebrationContext';
import { dataSync, DATA_SYNC_EVENTS } from '../utils/dataSync';

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
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [hasCompletedVideo, setHasCompletedVideo] = useState(false);
  const [completionThreshold] = useState(0.9); // 90% completion threshold
  
  const player = useVideoPlayer(videoUrl, player => {
    player.loop = false;
    player.muted = false;
    player.volume = 1.0;
    player.play();
  });

  useEffect(() => {
    // Configure audio session for video playback
    const configureAudio = async () => {
      try {
        if (Platform.OS === 'android') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
          });
        } else {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
          });
        }
        
        // Ensure audio is active
        await Audio.requestPermissionsAsync();
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    };

    configureAudio();

    // Listen for player status changes
    const statusSubscription = player.addListener('statusChange', (status, oldStatus, error) => {
      console.log('Video status:', status);
      console.log('Video error:', error);
      
      if (status === 'readyToPlay') {
        setIsLoading(false);
        setHasError(false);
        const videoDuration = player.duration || 0;
        console.log('Video is ready to play, duration:', videoDuration);
        setDuration(videoDuration);
        
        // If duration is still 0, try to get it after a short delay
        if (videoDuration === 0) {
          setTimeout(() => {
            const delayedDuration = player.duration || 0;
            console.log('Delayed duration check:', delayedDuration);
            if (delayedDuration > 0) {
              setDuration(delayedDuration);
            }
          }, 500);
        }
      } else if (status === 'error') {
        setIsLoading(false);
        setHasError(true);
        setIsPlaying(false);
        console.error('Video player error:', error);
      } else if (status === 'loading') {
        setIsLoading(true);
        setHasError(false);
        setIsPlaying(false);
      }
    });

    // Listen for play/pause state changes
    const playingSubscription = player.addListener('playingChange', (isPlaying, oldIsPlaying) => {
      console.log('Video playing state:', isPlaying);
      setIsPlaying(isPlaying);
    });

    // Listen for time updates
    const timeSubscription = player.addListener('timeUpdate', (payload) => {
      console.log('Time update:', payload.currentTime, 'Duration:', player.duration);
      setCurrentTime(payload.currentTime);
      
      // Update duration if we have it and it's not set
      if (player.duration && player.duration > 0 && duration === 0) {
        console.log('Setting duration from timeUpdate:', player.duration);
        setDuration(player.duration);
      }
      
      // Check for video completion
      const currentDuration = player.duration || duration;
      if (currentDuration > 0 && payload.currentTime >= currentDuration * completionThreshold && !hasCompletedVideo) {
        handleVideoCompletion();
      }
    });

    // Set a timeout to clear loading state if video doesn't load
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Video loading timeout - clearing loading state');
        setIsLoading(false);
      }
    }, 5000);

    // Backup timer to ensure time updates work
    const timeUpdateInterval = setInterval(() => {
      if (player && isPlaying) {
        const currentPlayerTime = player.currentTime || 0;
        const currentPlayerDuration = player.duration || 0;
        
        if (currentPlayerTime !== currentTime) {
          setCurrentTime(currentPlayerTime);
        }
        
        if (currentPlayerDuration > 0 && currentPlayerDuration !== duration) {
          setDuration(currentPlayerDuration);
        }
      }
    }, 1000);

    return () => {
      statusSubscription?.remove();
      playingSubscription?.remove();
      timeSubscription?.remove();
      clearTimeout(loadingTimeout);
      clearInterval(timeUpdateInterval);
    };
  }, [player]);

  useEffect(() => {
    // Handle hardware back button on Android
    const backAction = () => {
      handleExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Auto-hide controls after 3 seconds
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    // Listen for orientation changes
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      const { orientationInfo } = event;
      const isCurrentlyLandscape = orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                                   orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsLandscape(isCurrentlyLandscape);
      setIsFullscreen(isCurrentlyLandscape);
    });

    return () => {
      backHandler.remove();
      clearTimeout(timer);
      subscription?.remove();
    };
  }, []);

  const handleExit = async () => {
    // Reset orientation when exiting
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
    
    // Auto-hide controls after 3 seconds if showing
    if (!showControls) {
      setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlayPause = () => {
    console.log('togglePlayPause called, current isPlaying:', isPlaying);
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoCompletion = async () => {
    if (hasCompletedVideo || !habitId || !user) return;
    
    try {
      setHasCompletedVideo(true);
      
      // Award XP for video completion
      await DataService.toggleHabitCompletion(user.id, habitId, habitXp || 0);
      
      // Trigger celebration
      triggerCelebration({
        type: 'habit_completed',
        message: `Great job! You earned ${habitXp || 0} XP for completing this video!`,
        xp: habitXp || 0,
        habitName: title || 'Video'
      });
      
      // Emit data sync event
      dataSync.emit(DATA_SYNC_EVENTS.HABIT_TOGGLED, {
        habitId,
        completed: true,
        xp: habitXp || 0
      });
      
      console.log('Video completion XP awarded:', habitXp);
      
    } catch (error) {
      console.error('Error awarding video completion XP:', error);
    }
  };

  const handleSeek = (value: number) => {
    const seekTime = (value / 100) * duration;
    player.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    console.log('toggleMute called, current isMuted:', isMuted);
    const newMutedState = !isMuted;
    player.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const toggleFullscreen = async () => {
    try {
      if (isLandscape) {
        // Switch back to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('visible');
        }
        setIsLandscape(false);
        setIsFullscreen(false);
      } else {
        // Switch to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden');
        }
        setIsLandscape(true);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log('Error changing orientation:', error);
    }
  };

  const skipForward = () => {
    const currentDuration = player.duration || duration;
    const newTime = Math.min(currentTime + 10, currentDuration);
    player.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    player.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlaybackSpeed = () => {
    try {
      const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
      const currentIndex = speeds.indexOf(playbackSpeed);
      const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
      player.playbackRate = nextSpeed;
      setPlaybackSpeed(nextSpeed);
      console.log('Playback speed changed to:', nextSpeed);
    } catch (error) {
      console.log('Playback speed error:', error);
    }
  };

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000000"
        hidden={isLandscape}
      />
      
      <VideoView
        style={[styles.video, isLandscape && styles.landscapeVideo]}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        showsTimecodes={false}
        requiresLinearPlayback={false}
        contentFit={isLandscape ? "cover" : "contain"}
        nativeControls={false}
      />

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {/* Error State */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load video</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            setHasError(false);
            setIsLoading(true);
            player.play();
          }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Overlay Controls */}
      {showControls && (
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
                
                {/* Rotate Button - moved to same line */}
                <TouchableOpacity 
                  style={styles.centerRotateButton}
                  onPress={toggleFullscreen}
                >
                  <Text style={styles.centerRotateIcon}>
                    {isLandscape ? '📱' : '🔄'}
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
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                
                <View style={styles.progressBarContainer}>
                  <TouchableOpacity
                    style={styles.progressBar}
                    onPress={(event) => {
                      const { locationX } = event.nativeEvent;
                      const { width } = event.currentTarget.measure ? { width: 250 } : { width: 250 };
                      const progressPercentage = Math.max(0, Math.min(1, locationX / width));
                      const currentDuration = player.duration || duration;
                      const seekTime = progressPercentage * currentDuration;
                      if (currentDuration > 0) {
                        player.currentTime = seekTime;
                        setCurrentTime(seekTime);
                      }
                    }}
                    activeOpacity={1}
                  >
                    <View style={styles.progressTrack}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(player.duration || duration) > 0 ? (currentTime / (player.duration || duration)) * 100 : 0}%` }
                        ]} 
                      />
                      <View
                        style={[
                          styles.progressThumb,
                          { left: `${(player.duration || duration) > 0 ? (currentTime / (player.duration || duration)) * 100 : 0}%` }
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.timeText}>{formatTime(player.duration || duration)}</Text>
              </View>
              
              <View style={[styles.controlsRow, isLandscape && styles.landscapeControlsRow]}>
                <TouchableOpacity 
                  style={styles.volumeButton}
                  onPress={toggleMute}
                >
                  <Text style={styles.volumeIcon}>
                    {isMuted ? '🔇' : '🔊'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.speedButton}
                  onPress={togglePlaybackSpeed}
                >
                  <Text style={styles.speedText}>
                    {playbackSpeed}x
                  </Text>
                </TouchableOpacity>
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
    width: height, // Swap dimensions for landscape
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
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  playPauseIcon: {
    fontSize: 28,
    color: theme.colors.text.inverse,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  skipIcon: {
    fontSize: 20,
    color: theme.colors.text.inverse,
  },
  bottomControls: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  landscapeBottomControls: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  landscapeProgressContainer: {
    marginBottom: theme.spacing.xs,
  },
  timeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    minWidth: 40,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  progressBar: {
    height: 20,
    justifyContent: 'center',
    paddingVertical: 7,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.green,
    borderRadius: 3,
  },
  progressThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary.green,
    position: 'absolute',
    top: -6,
    marginLeft: -9,
    borderWidth: 2,
    borderColor: '#ffffff',
    ...theme.shadows.md,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  landscapeControlsRow: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  volumeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeIcon: {
    fontSize: 20,
    color: theme.colors.text.inverse,
  },
  centerRotateButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  centerRotateIcon: {
    fontSize: 20,
    color: theme.colors.text.inverse,
  },
  speedButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.bold,
  },
});