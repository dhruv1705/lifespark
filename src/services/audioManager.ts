import { backgroundMusic } from './backgroundMusicService';
import { elevenLabsSpeech } from './elevenLabsSpeechService';
import { speechQueue, SpeechType, SpeechPriority } from './speechQueue';

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
      try {
        const elevenLabsApiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
        const elevenLabsVoiceId = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID;
        if (elevenLabsApiKey && elevenLabsApiKey !== 'your-elevenlabs-api-key-here' && elevenLabsApiKey !== 'your-elevenlabs-api-key') {
          this.configureElevenLabs(elevenLabsApiKey, elevenLabsVoiceId);
          console.log('🎙️ ElevenLabs auto-configured from environment');
        } else {
          console.log('⚠️ ElevenLabs API key not configured - speech will be disabled');
          this.settings.speechEnabled = false;
        }
      } catch (error) {
        console.log('⚠️ Error configuring ElevenLabs - continuing without voice');
        this.settings.speechEnabled = false;
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

  async endSession(sessionType: 'stretch' | 'strength' = 'stretch') {
    // Queue completion speech with highest priority
    const text = sessionType === 'strength'
      ? "INCREDIBLE! You just built serious strength! Feel those muscles - they're thanking you for every single rep. You've earned every bit of that XP!"
      : "Beautiful work! You've completed your morning stretch routine. Notice how your body feels - more relaxed, more centered. Carry this peaceful energy with you throughout your day.";
    
    this.queueSpeech(text, 'completion', 'high', { 
      cannotInterrupt: true, 
      sessionType 
    });
    
    // Wait for completion speech to finish before stopping music
    await speechQueue.waitForCurrent();
    
    await backgroundMusic.stop();
    await backgroundMusic.unloadMusic();
    console.log('🏁 Audio session ended');
  }

  // Queue-based speech method with conflict prevention
  private queueSpeech(
    text: string, 
    type: SpeechType, 
    priority: SpeechPriority = 'medium',
    options: { cannotInterrupt?: boolean; sessionType?: 'stretch' | 'strength' } = {}
  ): string | null {
    if (!this.settings.speechEnabled) {
      console.log('🔇 Speech disabled in settings');
      return null;
    }

    if (!elevenLabsSpeech.isConfigured()) {
      console.error('❌ ElevenLabs not configured - cannot queue speech');
      return null;
    }

    return speechQueue.addSpeech(text, type, priority, options);
  }

  async speakExerciseStart(exerciseName: string, description: string, sessionType: 'stretch' | 'strength' = 'stretch') {
    const text = sessionType === 'strength' 
      ? `Time for ${exerciseName}! ${description}. Feel that strength building with every rep. You've got this!`
      : `Now we'll move into ${exerciseName}. ${description}. Remember to breathe deeply and listen to your body.`;
    
    this.queueSpeech(text, 'exercise-intro', 'high', { 
      cannotInterrupt: true, 
      sessionType 
    });
  }

  // Strength-specific methods
  async speakStrengthWelcome() {
    const text = "Ready to build some serious strength? Let's crush these push-ups together and feel that power growing with every rep!";
    this.queueSpeech(text, 'welcome', 'high', { 
      cannotInterrupt: true, 
      sessionType: 'strength' 
    });
  }

  async speakRepEncouragement(repNumber: number, totalReps: number) {
    // Prevent encouragement spam - only if no other encouragement is queued
    if (speechQueue.hasSpeechType('encouragement')) {
      console.log('🚫 Encouragement already queued, skipping');
      return;
    }
    
    const remaining = totalReps - repNumber;
    const encouragements = [
      `Push-up ${repNumber}! Feel that strength building with every rep!`,
      `${repNumber} down, ${remaining} to go! You're absolutely crushing this!`,
      `Perfect form on rep ${repNumber}! Every push-up makes you stronger!`,
      `Rep ${repNumber} complete! Your muscles are thanking you right now!`
    ];
    
    const text = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.queueSpeech(text, 'encouragement', 'low', { sessionType: 'strength' });
  }

  async speakStrengthMilestone(repNumber: number, totalReps: number) {
    let text = '';
    
    if (repNumber === Math.floor(totalReps / 2)) {
      text = "Halfway there, powerhouse! You're building real strength. Keep that perfect form!";
    } else if (repNumber === totalReps - 2) {
      text = "Only 2 more! You can taste victory now. Finish strong like the champion you are!";
    } else if (repNumber === totalReps - 1) {
      text = "ONE MORE REP! This is your moment to shine. Give it everything you've got!";
    }
    
    if (text) {
      // Clear any pending encouragement to make room for milestone
      speechQueue.clearSpeechType('encouragement');
      this.queueSpeech(text, 'milestone', 'medium', { sessionType: 'strength' });
    }
  }

  async speakTimeAlert(seconds: number) {
    let text = '';
    
    if (seconds === 10) {
      text = "Just ten more seconds. You're doing beautifully.";
    } else if (seconds === 5) {
      text = "Five more seconds. Feel that gentle stretch.";
    } else if (seconds === 3) {
      text = "Three... two... one... perfect.";
    }
    
    if (text) {
      this.queueSpeech(text, 'time-alert', 'medium', { sessionType: 'stretch' });
    }
  }

  async speakTransition(fromExercise: string, toExercise: string, sessionType: 'stretch' | 'strength' = 'stretch') {
    const text = sessionType === 'strength'
      ? `Excellent work on ${fromExercise}! Get ready for ${toExercise}. Keep that power flowing!`
      : `Wonderful work on ${fromExercise}. Take a breath, and now we'll gently move to ${toExercise}.`;
    
    // Wait for any current speech to finish before transition
    if (speechQueue.hasUpcomingSpeech()) {
      await speechQueue.waitForCurrent();
    }
    
    this.queueSpeech(text, 'transition', 'medium', { sessionType });
  }

  async speakEncouragement(message: string, sessionType: 'stretch' | 'strength' = 'stretch') {
    // Prevent encouragement spam
    if (speechQueue.hasSpeechType('encouragement')) {
      console.log('🚫 Encouragement already queued, skipping');
      return;
    }
    
    this.queueSpeech(message, 'encouragement', 'low', { sessionType });
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
      // Stop all speech and clear queue
      await speechQueue.stopAll();
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