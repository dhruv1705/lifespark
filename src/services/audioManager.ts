import { backgroundMusic } from './backgroundMusicService';
import { speechService } from './speechService';

interface AudioSettings {
  musicEnabled: boolean;
  speechEnabled: boolean;
  musicVolume: number;
}

class AudioManager {
  private settings: AudioSettings = {
    musicEnabled: true,
    speechEnabled: true,
    musicVolume: 0.3,
  };

  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await backgroundMusic.initialize();
      this.isInitialized = true;
      console.log('🎵 Audio Manager initialized');
    } catch (error) {
      console.error('Error initializing audio manager:', error);
      throw error;
    }
  }

  async startSession(musicFile: any) {
    try {
      await this.initialize();
      
      if (this.settings.musicEnabled) {
        await backgroundMusic.loadMusic(musicFile);
        await backgroundMusic.setVolume(this.settings.musicVolume);
        await backgroundMusic.play();
      }

      if (this.settings.speechEnabled) {
        // Welcome message
        await speechService.speak('Welcome to your 5-minute morning stretch. Let\'s begin!');
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
    await speechService.stop();
    console.log('⏸️ Audio session paused');
  }

  async resumeSession() {
    if (this.settings.musicEnabled) {
      await backgroundMusic.play();
    }
    
    if (this.settings.speechEnabled) {
      await speechService.speak('Let\'s continue with your stretch routine');
    }
    console.log('▶️ Audio session resumed');
  }

  async endSession() {
    if (this.settings.speechEnabled) {
      await speechService.speakCompletion();
    }
    
    await backgroundMusic.stop();
    await backgroundMusic.unloadMusic();
    console.log('🏁 Audio session ended');
  }

  async speakExerciseStart(exerciseName: string, description: string) {
    if (this.settings.speechEnabled) {
      await speechService.speakExerciseIntro(exerciseName, description);
    }
  }

  async speakTimeAlert(seconds: number) {
    if (this.settings.speechEnabled) {
      await speechService.speakTimeRemaining(seconds);
    }
  }

  async speakTransition(fromExercise: string, toExercise: string) {
    if (this.settings.speechEnabled) {
      await speechService.speakTransition(fromExercise, toExercise);
    }
  }

  async speakEncouragement(message: string) {
    if (this.settings.speechEnabled) {
      await speechService.speakEncouragement(message);
    }
  }

  // Settings management
  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Apply volume change immediately if music is playing
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

  async toggleSpeech() {
    this.settings.speechEnabled = !this.settings.speechEnabled;
    
    if (!this.settings.speechEnabled) {
      await speechService.stop();
    }
    
    console.log(`🗣️ Speech ${this.settings.speechEnabled ? 'enabled' : 'disabled'}`);
  }

  async setMusicVolume(volume: number) {
    this.settings.musicVolume = volume;
    await backgroundMusic.setVolume(volume);
  }

  getStatus() {
    return {
      settings: this.settings,
      musicStatus: backgroundMusic.getStatus(),
      speechStatus: speechService.getStatus(),
    };
  }
}

// Export singleton instance
export const audioManager = new AudioManager();