import { Audio } from 'expo-av';
import axios from 'axios';
import { backgroundMusic } from './backgroundMusicService';

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string; // Pre-selected calm voice ID
}

class ElevenLabsSpeechService {
  private config: ElevenLabsConfig;
  private isSpeaking: boolean = false;
  private currentSound: Audio.Sound | null = null;

  constructor() {
    this.config = {
      // You'll add your API key here after signup
      apiKey: '', // Will be set in environment or config
      voiceId: 'Qggl4b0xRMiqOwhPtVWT', // Clara - relaxing, natural, warm female voice
    };
  }

  // Initialize with API key
  setConfig(apiKey: string, voiceId?: string) {
    this.config.apiKey = apiKey;
    if (voiceId) {
      this.config.voiceId = voiceId;
    }
  }

  // Check if ElevenLabs is configured
  isConfigured(): boolean {
    return this.config.apiKey.length > 0;
  }

  async speak(text: string, options?: { speed?: number; stability?: number }) {
    if (!this.isConfigured()) {
      console.warn('🚫 ElevenLabs not configured, cannot speak');
      throw new Error('ElevenLabs not configured');
    }

    if (this.isSpeaking) {
      await this.stop();
    }

    try {
      console.log(`🎙️ ElevenLabs speaking: "${text}"`);
      
      // Duck background music
      await backgroundMusic.duck();
      this.isSpeaking = true;

      // Generate audio with ElevenLabs API
      const audioBlob = await this.generateSpeech(text, options);
      
      // Play the generated audio
      await this.playAudio(audioBlob);
      
      console.log('✅ ElevenLabs speech completed successfully');
      
    } catch (error) {
      console.error('❌ ElevenLabs speech error:', error);
      throw error;
    } finally {
      this.isSpeaking = false;
      await backgroundMusic.unduck();
    }
  }

  private async generateSpeech(text: string, options = {}): Promise<Blob> {
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: options.stability || 0.6, // Slightly more stable for wellness
            similarity_boost: 0.8,
            style: 0.3, // Calm, controlled style
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.config.apiKey,
          },
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API error:', error);
      throw new Error(`Failed to generate speech: ${error.response?.data || error.message}`);
    }
  }

  private async playAudio(audioBlob: Blob): Promise<void> {
    try {
      // Convert blob to uri that expo-av can play
      const audioUri = await this.blobToUri(audioBlob);
      
      // Create and play audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, volume: 1.0 }
      );
      
      this.currentSound = sound;

      // Wait for audio to finish
      return new Promise((resolve, reject) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              resolve();
            }
          } else if (status.error) {
            reject(new Error(`Audio playback error: ${status.error}`));
          }
        });
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  private async blobToUri(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to URI'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  }

  async stop() {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
    this.isSpeaking = false;
    await backgroundMusic.unduck();
  }

  getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      isConfigured: this.isConfigured(),
    };
  }

  // Wellness-specific methods with better phrasing
  async speakWelcome() {
    await this.speak("Welcome to your morning stretch routine. Take a moment to find your center, and let's begin this peaceful journey together.");
  }

  async speakExerciseIntro(exerciseName: string, description: string) {
    await this.speak(`Now we'll move into ${exerciseName}. ${description}. Remember to breathe deeply and listen to your body.`);
  }

  async speakTimeRemaining(seconds: number) {
    if (seconds === 10) {
      await this.speak("Just ten more seconds. You're doing beautifully.");
    } else if (seconds === 5) {
      await this.speak("Five more seconds. Feel that gentle stretch.");
    } else if (seconds === 3) {
      await this.speak("Three... two... one... perfect.");
    }
  }

  async speakTransition(fromExercise: string, toExercise: string) {
    await this.speak(`Wonderful work on ${fromExercise}. Take a breath, and now we'll gently move to ${toExercise}.`);
  }

  async speakCompletion() {
    const messages = [
      "Beautiful work! You've completed your morning stretch routine. Notice how your body feels - more relaxed, more centered. Carry this peaceful energy with you throughout your day.",
      "Excellent! Your body thanks you for this gift of movement and mindfulness. You've started your day with intention and care.",
      "Perfect! You've nourished your body and spirit. Feel proud of this commitment to your wellbeing."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(randomMessage);
  }
}

export const elevenLabsSpeech = new ElevenLabsSpeechService();