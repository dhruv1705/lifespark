import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { audioManager } from '../services/audioManager';
import { musicLibrary, MusicTrack } from '../services/musicLibrary';

interface MusicSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onMusicSelected: (trackId: string) => void;
  habitName?: string;
  currentTrackId?: string;
  showRecommendations?: boolean;
}

const { width, height } = Dimensions.get('window');

export const MusicSelectionModal: React.FC<MusicSelectionModalProps> = ({
  visible,
  onClose,
  onMusicSelected,
  habitName,
  currentTrackId,
  showRecommendations = true,
}) => {
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<MusicTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(currentTrackId || 'angelical');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadMusicTracks();
      setSelectedTrackId(currentTrackId || 'angelical');
    }
  }, [visible, currentTrackId]);

  const loadMusicTracks = () => {
    const tracks = audioManager.getAvailableMusic();
    setAllTracks(tracks);

    if (habitName && showRecommendations) {
      const recommended = audioManager.getRecommendedMusic(habitName);
      setRecommendedTracks(recommended);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrackId(trackId);
  };

  const handleConfirmSelection = () => {
    onMusicSelected(selectedTrackId);
    onClose();
  };

  const handlePreviewTrack = async (trackId: string) => {
    try {
      if (isPlaying === trackId) {
        // Stop preview
        setIsPlaying(null);
        // Note: In a full implementation, you'd actually stop the preview audio
        console.log(`🔇 Stopped preview for ${trackId}`);
      } else {
        // Start preview
        setIsPlaying(trackId);
        console.log(`🎵 Started preview for ${trackId}`);
        
        // Auto-stop preview after 10 seconds
        setTimeout(() => {
          setIsPlaying(null);
        }, 10000);
      }
    } catch (error) {
      console.error('Error playing preview:', error);
      Alert.alert('Preview Error', 'Unable to play music preview');
    }
  };

  const renderTrackItem = (track: MusicTrack, isRecommended: boolean = false) => {
    const isSelected = selectedTrackId === track.id;
    const isPreviewPlaying = isPlaying === track.id;

    return (
      <TouchableOpacity
        key={track.id}
        style={[
          styles.trackItem,
          isSelected && styles.trackItemSelected,
          isRecommended && styles.trackItemRecommended,
        ]}
        onPress={() => handleTrackSelect(track.id)}
      >
        <View style={styles.trackInfo}>
          <View style={styles.trackHeader}>
            <Text style={styles.trackIcon}>{track.icon}</Text>
            <View style={styles.trackDetails}>
              <Text style={[styles.trackName, isSelected && styles.trackNameSelected]}>
                {track.name}
              </Text>
              <Text style={[styles.trackDescription, isSelected && styles.trackDescriptionSelected]}>
                {track.description}
              </Text>
            </View>
          </View>
          
          <View style={styles.trackMeta}>
            <View style={styles.trackTags}>
              {track.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: track.color + '20' }]}>
                  <Text style={[styles.tagText, { color: track.color }]}>{tag}</Text>
                </View>
              ))}
            </View>
            
            {track.duration && (
              <Text style={styles.trackDuration}>
                {Math.ceil(track.duration / 60)} min
              </Text>
            )}
          </View>
        </View>

        <View style={styles.trackActions}>
          <TouchableOpacity
            style={[
              styles.previewButton,
              isPreviewPlaying && styles.previewButtonActive,
            ]}
            onPress={() => handlePreviewTrack(track.id)}
          >
            <Text style={styles.previewButtonText}>
              {isPreviewPlaying ? '⏹️' : '▶️'}
            </Text>
          </TouchableOpacity>
          
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Music</Text>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmSelection}
          >
            <Text style={styles.confirmButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitle}>
          <Text style={styles.subtitleText}>
            {habitName 
              ? `Perfect music for ${habitName}` 
              : 'Select your workout soundtrack'
            }
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recommended Section */}
          {showRecommendations && recommendedTracks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎯 Recommended</Text>
                <Text style={styles.sectionSubtitle}>
                  Best matches for your workout
                </Text>
              </View>
              {recommendedTracks.map(track => renderTrackItem(track, true))}
            </View>
          )}

          {/* All Music Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎵 All Music</Text>
              <Text style={styles.sectionSubtitle}>
                Complete music library
              </Text>
            </View>
            {allTracks.map(track => renderTrackItem(track, false))}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              💡 Your music choice will be remembered for this habit type
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  confirmButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary.blue,
    borderRadius: theme.borderRadius.md,
  },
  confirmButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  subtitle: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  subtitleText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginVertical: theme.spacing.md,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  trackItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trackItemSelected: {
    borderColor: theme.colors.primary.blue,
    backgroundColor: theme.colors.primary.blue + '10',
  },
  trackItemRecommended: {
    borderWidth: 1,
    borderColor: theme.colors.primary.green + '40',
  },
  trackInfo: {
    flex: 1,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  trackIcon: {
    fontSize: 32,
    marginRight: theme.spacing.sm,
  },
  trackDetails: {
    flex: 1,
  },
  trackName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  trackNameSelected: {
    color: theme.colors.primary.blue,
  },
  trackDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  trackDescriptionSelected: {
    color: theme.colors.text.primary,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackTags: {
    flexDirection: 'row',
    flex: 1,
  },
  tag: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
  },
  tagText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
  },
  trackDuration: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  trackActions: {
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  previewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  previewButtonActive: {
    backgroundColor: theme.colors.primary.orange,
  },
  previewButtonText: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    fontSize: 14,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.bold,
  },
  infoSection: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary.blue + '10',
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.lg,
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});