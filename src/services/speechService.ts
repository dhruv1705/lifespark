import * as Speech from 'expo-speech';
import { backgroundMusic } from './backgroundMusicService';

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  language?: string;
  voice?: string;
}

class SpeechService {
  private isSpeaking: boolean = false;
  private defaultOptions: SpeechOptions = {
    rate: 0.8,        // Slightly slower for clarity
    pitch: 1.0,       // Normal pitch
    language: 'en-US', // US English
  };

  async speak(text: string, options?: SpeechOptions) {
    if (this.isSpeaking) {
      // Stop current speech before starting new one
      await this.stop();
    }

    try {
      const speechOptions = { ...this.defaultOptions, ...options };
      
      console.log(`🗣️ Speaking: "${text}"`);
      
      // Duck background music when starting to speak
      await backgroundMusic.duck();
      
      this.isSpeaking = true;

      return new Promise<void>((resolve, reject) => {
        Speech.speak(text, {
          ...speechOptions,
          onStart: () => {
            console.log('🎤 Speech started');
          },
          onDone: () => {
            console.log('✅ Speech completed');
            this.isSpeaking = false;
            // Restore background music volume
            backgroundMusic.unduck().catch(console.error);
            resolve();
          },
          onStopped: () => {
            console.log('⏹️ Speech stopped');
            this.isSpeaking = false;
            backgroundMusic.unduck().catch(console.error);
            resolve();
          },
          onError: (error) => {
            console.error('❌ Speech error:', error);
            this.isSpeaking = false;
            backgroundMusic.unduck().catch(console.error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Error in speech service:', error);
      this.isSpeaking = false;
      await backgroundMusic.unduck();
      throw error;
    }
  }

  async stop() {
    if (this.isSpeaking) {
      try {
        Speech.stop();
        this.isSpeaking = false;
        await backgroundMusic.unduck();
        console.log('🛑 Speech stopped manually');
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
    }
  }

  getStatus() {
    return {
      isSpeaking: this.isSpeaking,
    };
  }

  // Convenience methods for different types of speech
  async speakExerciseIntro(exerciseName: string, description: string) {
    const text = `Let's start with ${exerciseName}. ${description}`;
    await this.speak(text);
  }

  async speakInstruction(instruction: string) {
    await this.speak(instruction);
  }

  async speakEncouragement(message: string) {
    await this.speak(message, { rate: 0.9 }); // Slightly faster for encouragement
  }

  async speakTransition(fromExercise: string, toExercise: string) {
    const text = `Great job on ${fromExercise}! Now let's move to ${toExercise}.`;
    await this.speak(text);
  }

  async speakTimeRemaining(seconds: number) {
    let text = '';
    if (seconds === 10) {
      text = 'Ten more seconds';
    } else if (seconds === 5) {
      text = 'Five more seconds';
    } else if (seconds === 3) {
      text = 'Three, two, one';
    }
    
    if (text) {
      await this.speak(text, { rate: 1.0 });
    }
  }

  async speakCompletion() {
    const completionMessages = [
      'Excellent work! You\'ve completed your morning stretch routine.',
      'Wonderful! Your body should feel more relaxed and energized.',
      'Great job! You\'ve earned your XP and started your day right.'
    ];
    
    const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    await this.speak(randomMessage);
  }
}

// Export singleton instance
export const speechService = new SpeechService();