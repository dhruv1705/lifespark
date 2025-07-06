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

  // Strength training specific methods with energizing tone
  async speakStrengthWelcome() {
    await this.speak("Ready to build some serious strength? Let's crush these push-ups together and feel that power growing with every rep!");
  }

  async speakExerciseIntro(exerciseName: string, description: string) {
    await this.speak(`Now we'll move into ${exerciseName}. ${description}. Remember to breathe deeply and listen to your body.`);
  }

  // Strength training exercise intro with power and motivation
  async speakStrengthExerciseIntro(exerciseName: string, description: string) {
    await this.speak(`Time for ${exerciseName}! ${description}. Feel that strength building with every rep. You've got this!`);
  }

  // Rep-specific encouragement for push-ups
  async speakRepEncouragement(repNumber: number, totalReps: number) {
    const remaining = totalReps - repNumber;
    const encouragements = [
      `Push-up ${repNumber}! Feel that strength building with every rep!`,
      `${repNumber} down, ${remaining} to go! You're absolutely crushing this!`,
      `Perfect form on rep ${repNumber}! Every push-up makes you stronger!`,
      `Rep ${repNumber} complete! Your muscles are thanking you right now!`
    ];
    
    const message = encouragements[Math.floor(Math.random() * encouragements.length)];
    await this.speak(message);
  }

  // Milestone celebrations during strength training
  async speakStrengthMilestone(repNumber: number, totalReps: number) {
    if (repNumber === Math.floor(totalReps / 2)) {
      await this.speak("Halfway there, powerhouse! You're building real strength. Keep that perfect form!");
    } else if (repNumber === totalReps - 2) {
      await this.speak("Only 2 more! You can taste victory now. Finish strong like the champion you are!");
    } else if (repNumber === totalReps - 1) {
      await this.speak("ONE MORE REP! This is your moment to shine. Give it everything you've got!");
    }
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

  // Strength training completion with power and achievement
  async speakStrengthCompletion() {
    const messages = [
      "INCREDIBLE! You just built serious strength! Feel those muscles - they're thanking you for every single rep. You've earned every bit of that XP!",
      "BOOM! Ten perfect push-ups! You're officially stronger than when you started. That's the power of consistency and determination!",
      "Outstanding work, champion! You've pushed through, built strength, and proven what you're capable of. Your body is getting stronger every day!",
      "AMAZING! You just crushed those push-ups! Feel that strength flowing through your body. You're building the foundation for an incredible future!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(randomMessage);
  }
}

export const elevenLabsSpeech = new ElevenLabsSpeechService();