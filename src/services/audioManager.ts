import { backgroundMusic } from './backgroundMusicService';
import { elevenLabsSpeech } from './elevenLabsSpeechService';

interface AudioSettings {
  musicEnabled: boolean;
  speechEnabled: boolean;
  musicVolume: number;
  duckingVolume: number; // Volume when speech is active
  useElevenLabs: boolean;
  elevenLabsApiKey?: string;
}

class AudioManager {
  private settings: AudioSettings = {
    musicEnabled: true,
    speechEnabled: true,
    musicVolume: 0.3, // Normal music volume (30%)
    duckingVolume: 0.08, // Music volume during speech (8%)
    useElevenLabs: false, // Default to false until API key is set
    elevenLabsApiKey: '',
  };

  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await backgroundMusic.initialize();
      
      // Auto-configure ElevenLabs if API key is available
      const elevenLabsApiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
      const elevenLabsVoiceId = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID;
      if (elevenLabsApiKey && elevenLabsApiKey !== 'your-elevenlabs-api-key-here') {
        this.configureElevenLabs(elevenLabsApiKey, elevenLabsVoiceId);
        console.log('🎙️ ElevenLabs auto-configured from environment');
      }
      
      // Configure music ducking volume
      backgroundMusic.setDuckingVolume(this.settings.duckingVolume);
      
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
        // Welcome message using smart speech selection
        await this.speak('Welcome to your 5-minute morning stretch. Let\'s begin!');
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
    // Stop ElevenLabs speech service
    await elevenLabsSpeech.stop();
    console.log('⏸️ Audio session paused');
  }

  async resumeSession() {
    if (this.settings.musicEnabled) {
      await backgroundMusic.play();
    }
    
    if (this.settings.speechEnabled) {
      await this.speak('Let\'s continue with your stretch routine');
    }
    console.log('▶️ Audio session resumed');
  }

  async endSession() {
    if (this.settings.speechEnabled && elevenLabsSpeech.isConfigured()) {
      await elevenLabsSpeech.speakCompletion();
    }
    
    await backgroundMusic.stop();
    await backgroundMusic.unloadMusic();
    console.log('🏁 Audio session ended');
  }

  // ElevenLabs-only speech method
  private async speak(text: string) {
    if (!this.settings.speechEnabled) return;

    try {
      if (elevenLabsSpeech.isConfigured()) {
        console.log('🎙️ Using ElevenLabs (Clara) for speech');
        await elevenLabsSpeech.speak(text);
      } else {
        console.error('❌ ElevenLabs not configured - cannot speak');
      }
    } catch (error) {
      console.error('❌ ElevenLabs speech failed:', error);
    }
  }

  async speakExerciseStart(exerciseName: string, description: string) {
    if (!this.settings.speechEnabled) return;
    
    if (elevenLabsSpeech.isConfigured()) {
      await elevenLabsSpeech.speakExerciseIntro(exerciseName, description);
    } else {
      console.error('❌ ElevenLabs not configured - cannot speak exercise start');
    }
  }

  async speakTimeAlert(seconds: number) {
    if (!this.settings.speechEnabled) return;
    
    if (elevenLabsSpeech.isConfigured()) {
      await elevenLabsSpeech.speakTimeRemaining(seconds);
    } else {
      console.error('❌ ElevenLabs not configured - cannot speak time alert');
    }
  }

  async speakTransition(fromExercise: string, toExercise: string) {
    if (!this.settings.speechEnabled) return;
    
    if (elevenLabsSpeech.isConfigured()) {
      await elevenLabsSpeech.speakTransition(fromExercise, toExercise);
    } else {
      console.error('❌ ElevenLabs not configured - cannot speak transition');
    }
  }

  async speakEncouragement(message: string) {
    if (!this.settings.speechEnabled) return;
    
    if (elevenLabsSpeech.isConfigured()) {
      await elevenLabsSpeech.speak(message);
    } else {
      console.error('❌ ElevenLabs not configured - cannot speak encouragement');
    }
  }

  // Settings management
  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Apply volume changes immediately if music is playing
    if (newSettings.musicVolume !== undefined) {
      backgroundMusic.setVolume(newSettings.musicVolume);
    }
    
    if (newSettings.duckingVolume !== undefined) {
      backgroundMusic.setDuckingVolume(newSettings.duckingVolume);
    }

    // Configure ElevenLabs if API key is provided
    if (newSettings.elevenLabsApiKey && newSettings.elevenLabsApiKey.length > 0) {
      elevenLabsSpeech.setConfig(newSettings.elevenLabsApiKey);
      this.settings.useElevenLabs = true;
      console.log('🎙️ ElevenLabs configured');
    }
    
    console.log('🔧 Audio settings updated:', this.settings);
  }

  // Configure ElevenLabs
  configureElevenLabs(apiKey: string, voiceId?: string) {
    this.settings.elevenLabsApiKey = apiKey;
    this.settings.useElevenLabs = true;
    elevenLabsSpeech.setConfig(apiKey, voiceId);
    console.log('🎙️ ElevenLabs configured with API key');
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
      // Stop ElevenLabs speech service
      await elevenLabsSpeech.stop();
    }
    
    console.log(`🗣️ Speech ${this.settings.speechEnabled ? 'enabled' : 'disabled'}`);
  }

  async setMusicVolume(volume: number) {
    this.settings.musicVolume = volume;
    await backgroundMusic.setVolume(volume);
  }

  async setDuckingVolume(volume: number) {
    this.settings.duckingVolume = volume;
    backgroundMusic.setDuckingVolume(volume);
  }

  getStatus() {
    return {
      settings: this.settings,
      musicStatus: backgroundMusic.getStatus(),
      elevenLabsStatus: elevenLabsSpeech.getStatus(),
    };
  }
}

// Export singleton instance
export const audioManager = new AudioManager();