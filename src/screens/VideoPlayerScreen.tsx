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
import { VideoView, useVideoPlayer } from 'expo-video';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface VideoPlayerScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'VideoPlayer'>;
  route: RouteProp<RootStackParamList, 'VideoPlayer'>;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  navigation,
  route,
}) => {
  const { videoUrl, title } = route.params;
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
        setDuration(player.duration || 0);
        console.log('Video is ready to play');
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
      setCurrentTime(payload.currentTime);
    });

    // Set a timeout to clear loading state if video doesn't load
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Video loading timeout - clearing loading state');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      statusSubscription?.remove();
      playingSubscription?.remove();
      timeSubscription?.remove();
      clearTimeout(loadingTimeout);
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

    return () => {
      backHandler.remove();
      clearTimeout(timer);
    };
  }, []);

  const handleExit = () => {
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

  const handleSeek = (value: number) => {
    const seekTime = (value / 100) * duration;
    player.seekTo(seekTime);
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    console.log('toggleMute called, current isMuted:', isMuted);
    const newMutedState = !isMuted;
    player.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000000"
        hidden={true}
      />
      
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        showsTimecodes={true}
        requiresLinearPlayback={false}
        contentFit="cover"
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
            setIsLoading(false);
            player.play();
          }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Overlay Controls */}
      {showControls && (
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleExit}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              
              {title && (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              )}
            </View>
            
            {/* Center Play/Pause Button */}
            <View style={styles.centerControls}>
              <TouchableOpacity 
                style={styles.playPauseButton} 
                onPress={togglePlayPause}
              >
                <Text style={styles.playPauseIcon}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                
                <TouchableOpacity 
                  style={styles.progressBarContainer}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    const progress = locationX / (width - 2 * theme.spacing.lg - 2 * theme.spacing.md);
                    const seekTime = progress * duration;
                    if (seekTime >= 0 && seekTime <= duration) {
                      player.seekTo(seekTime);
                      setCurrentTime(seekTime);
                    }
                  }}
                >
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                      ]} 
                    />
                    <View
                      style={[
                        styles.progressThumb,
                        { left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                      ]}
                    />
                  </View>
                </TouchableOpacity>
                
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
              
              <View style={styles.controlsRow}>
                <TouchableOpacity 
                  style={styles.volumeButton}
                  onPress={toggleMute}
                >
                  <Text style={styles.volumeIcon}>
                    {isMuted ? '🔇' : '🔊'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.fullscreenButton}
                  onPress={toggleFullscreen}
                >
                  <Text style={styles.fullscreenIcon}>
                    {isFullscreen ? '⬜' : '⬜'}
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
  video: {
    width: width,
    height: height,
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  bottomControls: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.green,
    borderRadius: 2,
  },
  progressThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary.green,
    position: 'absolute',
    top: -6,
    marginLeft: -8,
    ...theme.shadows.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
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
  fullscreenButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenIcon: {
    fontSize: 18,
    color: theme.colors.text.inverse,
  },
});