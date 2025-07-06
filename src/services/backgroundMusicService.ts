import { Audio } from 'expo-av';

class BackgroundMusicService {
  private sound: Audio.Sound | null = null;
  private isLoaded: boolean = false;
  private isPlaying: boolean = false;
  private volume: number = 0.3; // Default volume (30%)
  private originalVolume: number = 0.3;

  async initialize() {
    try {
      // Set audio mode for background music
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  }

  async loadMusic(musicFile: any) {
    try {
      if (this.sound) {
        await this.unloadMusic();
      }

      console.log('🎵 Loading background music...');
      const { sound } = await Audio.Sound.createAsync(
        musicFile,
        {
          isLooping: true,
          volume: this.volume,
          shouldPlay: false,
        }
      );

      this.sound = sound;
      this.isLoaded = true;
      console.log('✅ Background music loaded successfully');
    } catch (error) {
      console.error('❌ Error loading music:', error);
      throw error;
    }
  }

  async play() {
    if (!this.sound || !this.isLoaded) {
      console.warn('Music not loaded, cannot play');
      return;
    }

    try {
      await this.sound.playAsync();
      this.isPlaying = true;
      console.log('🎵 Background music started');
    } catch (error) {
      console.error('Error playing music:', error);
    }
  }

  async pause() {
    if (!this.sound || !this.isPlaying) return;

    try {
      await this.sound.pauseAsync();
      this.isPlaying = false;
      console.log('⏸️ Background music paused');
    } catch (error) {
      console.error('Error pausing music:', error);
    }
  }

  async stop() {
    if (!this.sound) return;

    try {
      await this.sound.stopAsync();
      this.isPlaying = false;
      console.log('⏹️ Background music stopped');
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  }

  async setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    this.originalVolume = this.volume;

    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.volume);
        console.log(`🔊 Music volume set to ${Math.round(this.volume * 100)}%`);
      } catch (error) {
        console.error('Error setting music volume:', error);
      }
    }
  }

  async mute() {
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(0);
        console.log('🔇 Music muted');
      } catch (error) {
        console.error('Error muting music:', error);
      }
    }
  }

  async unmute() {
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.volume);
        console.log('🔊 Music unmuted');
      } catch (error) {
        console.error('Error unmuting music:', error);
      }
    }
  }

  // Duck music volume when speech is playing
  async duck() {
    if (this.sound && this.isPlaying) {
      try {
        await this.sound.setVolumeAsync(this.volume * 0.2); // Reduce to 20% of current volume
        console.log('🦆 Music ducked for speech');
      } catch (error) {
        console.error('Error ducking music:', error);
      }
    }
  }

  // Restore music volume after speech
  async unduck() {
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.volume);
        console.log('🔊 Music volume restored');
      } catch (error) {
        console.error('Error restoring music volume:', error);
      }
    }
  }

  async unloadMusic() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
        this.isPlaying = false;
        console.log('🗑️ Background music unloaded');
      } catch (error) {
        console.error('Error unloading music:', error);
      }
    }
  }

  getStatus() {
    return {
      isLoaded: this.isLoaded,
      isPlaying: this.isPlaying,
      volume: this.volume,
    };
  }
}

// Export singleton instance
export const backgroundMusic = new BackgroundMusicService();