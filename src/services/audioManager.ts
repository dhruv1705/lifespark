import { backgroundMusic } from './backgroundMusicService';
import { musicLibrary, MusicTrack } from './musicLibrary';
import { settingsStorage } from './settingsStorage';

interface AudioSettings {
  musicEnabled: boolean;
  musicVolume: number;
  selectedMusicId: string; // ID of currently selected music track
  musicPreferences?: {
    globalDefault: string;
    habitSpecific: Record<string, string>; // habitId -> trackId
    lastUsed: string;
    volume: number;
  };
}

class AudioManager {
  private settings: AudioSettings = {
    musicEnabled: true,
    musicVolume: 0.3, // Normal music volume (30%)
    selectedMusicId: 'angelical', // Default to calm music
    musicPreferences: {
      globalDefault: 'angelical',
      habitSpecific: {},
      lastUsed: 'angelical',
      volume: 0.3,
    },
  };

  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await backgroundMusic.initialize();
      
      // Load saved settings from storage
      await this.loadSettings();
      
      this.isInitialized = true;
      console.log('🎵 Audio Manager initialized');
    } catch (error) {
      console.error('Error initializing audio manager:', error);
      throw error;
    }
  }

  async startSession(habitNameOrMusicFile?: string | any, customMusicFile?: any) {
    try {
      await this.initialize();
      
      if (this.settings.musicEnabled) {
        let musicFile = customMusicFile;
        let habitName: string | undefined;
        
        // Handle different parameter patterns for backward compatibility
        if (typeof habitNameOrMusicFile === 'string') {
          habitName = habitNameOrMusicFile;
        } else if (habitNameOrMusicFile && !customMusicFile) {
          // Old pattern: startSession(musicFile)
          musicFile = habitNameOrMusicFile;
        }
        
        // If no custom music file provided, use smart selection
        if (!musicFile) {
          const selectedTrack = this.getSelectedMusicTrack(habitName);
          musicFile = selectedTrack?.file;
          
          if (selectedTrack) {
            console.log(`🎵 Selected music: ${selectedTrack.name} for habit: ${habitName || 'default'}`);
          }
        }
        
        if (musicFile) {
          await backgroundMusic.loadMusic(musicFile);
          await backgroundMusic.setVolume(this.settings.musicVolume);
          await backgroundMusic.play();
        }
      }

      console.log('🎯 Audio session started');
    } catch (error) {
      console.error('Error starting audio session:', error);
    }
  }

  async pauseSession() {
    if (this.settings.musicEnabled) {
      await backgroundMusic.pause();
    }
    console.log('⏸️ Audio session paused');
  }

  async resumeSession() {
    if (this.settings.musicEnabled) {
      await backgroundMusic.play();
    }
    console.log('▶️ Audio session resumed');
  }

  async endSession() {
    await backgroundMusic.stop();
    await backgroundMusic.unloadMusic();
    console.log('🏁 Audio session ended');
  }

  // Settings management
  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Apply volume changes immediately if music is playing
    if (newSettings.musicVolume !== undefined) {
      backgroundMusic.setVolume(newSettings.musicVolume);
    }
    
    console.log('🔧 Audio settings updated:', this.settings);
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  async toggleMusic() {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    
    if (this.settings.musicEnabled) {
      await backgroundMusic.unmute();
    } else {
      await backgroundMusic.mute();
    }
    
    console.log(`🎵 Music ${this.settings.musicEnabled ? 'enabled' : 'disabled'}`);
  }

  async setMusicVolume(volume: number) {
    this.settings.musicVolume = volume;
    await backgroundMusic.setVolume(volume);
  }

  getStatus() {
    return {
      settings: this.settings,
      musicStatus: backgroundMusic.getStatus(),
    };
  }

  // Music Selection Methods
  
  getSelectedMusicTrack(habitName?: string): MusicTrack | null {
    let trackId = this.settings.selectedMusicId;
    
    // Check for habit-specific preference
    if (habitName && this.settings.musicPreferences?.habitSpecific) {
      const habitSpecific = this.settings.musicPreferences.habitSpecific[habitName.toLowerCase()];
      if (habitSpecific) {
        trackId = habitSpecific;
      }
    }
    
    return musicLibrary.getTrackById(trackId);
  }

  async setSelectedMusic(trackId: string, habitName?: string) {
    const track = musicLibrary.getTrackById(trackId);
    if (!track) {
      console.warn(`Track ${trackId} not found in music library`);
      return;
    }

    this.settings.selectedMusicId = trackId;

    // Store habit-specific preference if habitName provided
    if (habitName && this.settings.musicPreferences) {
      this.settings.musicPreferences.habitSpecific[habitName.toLowerCase()] = trackId;
      this.settings.musicPreferences.lastUsed = trackId;
    }

    // Save preferences to storage
    await this.saveSettings();
    
    console.log(`🎵 Music selection updated: ${track.name}${habitName ? ` for ${habitName}` : ''}`);
  }

  async switchMusic(trackId: string, habitName?: string) {
    await this.setSelectedMusic(trackId, habitName);
    
    // If music is currently playing, switch to the new track
    if (this.settings.musicEnabled && backgroundMusic.getStatus().isPlaying) {
      const selectedTrack = this.getSelectedMusicTrack(habitName);
      if (selectedTrack?.file) {
        await backgroundMusic.loadMusic(selectedTrack.file);
        await backgroundMusic.setVolume(this.settings.musicVolume);
        await backgroundMusic.play();
        console.log(`🎵 Switched to: ${selectedTrack.name}`);
      }
    }
  }

  getSmartMusicRecommendation(habitName: string) {
    const lowerHabitName = habitName.toLowerCase();
    
    // Smart recommendations based on habit type
    if (lowerHabitName.includes('stretch') || lowerHabitName.includes('yoga') || lowerHabitName.includes('meditation')) {
      return musicLibrary.getTrackById('angelical') || musicLibrary.getTrackById('calm');
    }
    
    if (lowerHabitName.includes('strength') || lowerHabitName.includes('workout') || lowerHabitName.includes('push') || lowerHabitName.includes('squat')) {
      return musicLibrary.getTrackById('upbeat') || musicLibrary.getTrackById('energy');
    }
    
    // Default to calm music
    return musicLibrary.getTrackById('angelical') || musicLibrary.getTrackById('calm');
  }

  getMusicDisplayInfo(trackId?: string) {
    const id = trackId || this.settings.selectedMusicId;
    const track = musicLibrary.getTrackById(id);
    
    if (!track) {
      return {
        title: 'No Music',
        subtitle: 'Select music',
        icon: '🎵'
      };
    }

    return {
      title: track.name,
      subtitle: track.description,
      icon: track.icon || '🎵'
    };
  }

  // Storage methods
  private async loadSettings() {
    try {
      const savedSettings = await settingsStorage.loadAudioSettings();
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
        console.log('📁 Audio settings loaded from storage');
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await settingsStorage.saveAudioSettings(this.settings);
      console.log('💾 Audio settings saved to storage');
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
  }
}

export const audioManager = new AudioManager();