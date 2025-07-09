import { Audio } from 'expo-av';

export enum SoundType {
  REP_COMPLETE = 'rep_complete',
  MILESTONE = 'milestone',
  HALFWAY = 'halfway',
  FINAL_REP = 'final_rep',
  COMPLETION = 'completion',
  ACHIEVEMENT = 'achievement',
  TIMER_TICK = 'timer_tick',
  FORM_CUE = 'form_cue',
  START = 'start',
  WHOOSH = 'whoosh',
  POP = 'pop',
  DING = 'ding',
  CHIME = 'chime',
  APPLAUSE = 'applause',
}

interface SoundEffect {
  sound: Audio.Sound | null;
  isLoaded: boolean;
  uri?: string;
}

class SoundEffectsService {
  private sounds: Map<SoundType, SoundEffect> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  // Web Audio API compatible sound generation for cross-platform support
  private generateTone(frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine'): string {
    // This would generate a data URI with audio data
    // For now, we'll use a simple approach and rely on pre-made sounds or system sounds
    return '';
  }

  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Initialize sound effects with system sounds and simple tones
      await this.initializeSoundEffects();
    } catch (error) {
      console.warn('Sound effects initialization failed:', error);
    }
  }

  private async initializeSoundEffects(): Promise<void> {
    const soundConfig: Record<SoundType, { uri?: string; frequency?: number; duration?: number }> = {
      [SoundType.REP_COMPLETE]: { frequency: 440, duration: 100 }, // A4 note, short
      [SoundType.MILESTONE]: { frequency: 523, duration: 200 }, // C5 note, longer
      [SoundType.HALFWAY]: { frequency: 659, duration: 300 }, // E5 note, celebration
      [SoundType.FINAL_REP]: { frequency: 784, duration: 250 }, // G5 note, dramatic
      [SoundType.COMPLETION]: { frequency: 880, duration: 500 }, // A5 note, victory
      [SoundType.ACHIEVEMENT]: { frequency: 1047, duration: 400 }, // C6 note, achievement
      [SoundType.TIMER_TICK]: { frequency: 220, duration: 50 }, // A3 note, subtle
      [SoundType.FORM_CUE]: { frequency: 330, duration: 100 }, // E4 note, gentle
      [SoundType.START]: { frequency: 523, duration: 200 }, // C5 note, ready
      [SoundType.WHOOSH]: { frequency: 200, duration: 150 }, // Low whoosh
      [SoundType.POP]: { frequency: 800, duration: 50 }, // Quick pop
      [SoundType.DING]: { frequency: 1000, duration: 100 }, // Clear ding
      [SoundType.CHIME]: { frequency: 1200, duration: 200 }, // Pleasant chime
      [SoundType.APPLAUSE]: { frequency: 500, duration: 600 }, // Applause simulation
    };

    for (const [type, config] of Object.entries(soundConfig)) {
      this.sounds.set(type as SoundType, {
        sound: null,
        isLoaded: false,
        uri: config.uri,
      });
    }
  }

  async playSound(type: SoundType): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const soundEffect = this.sounds.get(type);
      if (!soundEffect) return;

      // For now, we'll use a simple system sound approach
      // In a production app, you'd load actual sound files
      if (soundEffect.sound) {
        await soundEffect.sound.setVolumeAsync(this.volume);
        await soundEffect.sound.replayAsync();
      } else {
        // Use system sounds as fallback
        await this.playSystemSound(type);
      }
    } catch (error) {
      console.warn(`Failed to play sound ${type}:`, error);
    }
  }

  private async playSystemSound(type: SoundType): Promise<void> {
    // Map sound types to system sounds or simple audio feedback
    const systemSounds: Record<SoundType, () => Promise<void>> = {
      [SoundType.REP_COMPLETE]: () => this.playTone(440, 100),
      [SoundType.MILESTONE]: () => this.playTone(523, 200),
      [SoundType.HALFWAY]: () => this.playChord([659, 523, 440], 300),
      [SoundType.FINAL_REP]: () => this.playTone(784, 250),
      [SoundType.COMPLETION]: () => this.playVictoryFanfare(),
      [SoundType.ACHIEVEMENT]: () => this.playAchievementSound(),
      [SoundType.TIMER_TICK]: () => this.playTone(220, 50),
      [SoundType.FORM_CUE]: () => this.playTone(330, 100),
      [SoundType.START]: () => this.playTone(523, 200),
      [SoundType.WHOOSH]: () => this.playWhoosh(),
      [SoundType.POP]: () => this.playTone(800, 50),
      [SoundType.DING]: () => this.playTone(1000, 100),
      [SoundType.CHIME]: () => this.playTone(1200, 200),
      [SoundType.APPLAUSE]: () => this.playApplause(),
    };

    const soundFunction = systemSounds[type];
    if (soundFunction) {
      await soundFunction();
    }
  }

  private async playTone(frequency: number, duration: number): Promise<void> {
    // Simple tone generation using Web Audio API concepts
    // This is a placeholder - in a real app you'd use actual audio files
    console.log(`🔊 Playing tone: ${frequency}Hz for ${duration}ms`);
    
    // For demo purposes, we'll just log the sound
    // In production, you'd generate actual audio or use pre-recorded sounds
  }

  private async playChord(frequencies: number[], duration: number): Promise<void> {
    console.log(`🎵 Playing chord: ${frequencies.join(', ')}Hz for ${duration}ms`);
    // Play multiple frequencies simultaneously
  }

  private async playVictoryFanfare(): Promise<void> {
    console.log('🎉 Playing victory fanfare');
    // Play a sequence of ascending notes
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    for (const note of notes) {
      await this.playTone(note, 150);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private async playAchievementSound(): Promise<void> {
    console.log('🏆 Playing achievement sound');
    // Play a triumphant chord progression
    await this.playChord([523, 659, 784], 200);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.playChord([659, 784, 1047], 300);
  }

  private async playWhoosh(): Promise<void> {
    console.log('💨 Playing whoosh sound');
    // Simulate whoosh with frequency sweep
    const startFreq = 200;
    const endFreq = 100;
    const steps = 10;
    const stepDuration = 15;
    
    for (let i = 0; i < steps; i++) {
      const freq = startFreq - (startFreq - endFreq) * (i / steps);
      await this.playTone(freq, stepDuration);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  private async playApplause(): Promise<void> {
    console.log('👏 Playing applause');
    // Simulate applause with rapid random pops
    const duration = 600;
    const pops = 20;
    const interval = duration / pops;
    
    for (let i = 0; i < pops; i++) {
      const freq = 300 + Math.random() * 400;
      await this.playTone(freq, 30);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  // Convenience methods
  async repComplete(): Promise<void> {
    await this.playSound(SoundType.REP_COMPLETE);
  }

  async milestone(): Promise<void> {
    await this.playSound(SoundType.MILESTONE);
  }

  async halfway(): Promise<void> {
    await this.playSound(SoundType.HALFWAY);
  }

  async finalRep(): Promise<void> {
    await this.playSound(SoundType.FINAL_REP);
  }

  async completion(): Promise<void> {
    await this.playSound(SoundType.COMPLETION);
  }

  async achievement(): Promise<void> {
    await this.playSound(SoundType.ACHIEVEMENT);
  }

  async formCue(): Promise<void> {
    await this.playSound(SoundType.FORM_CUE);
  }

  async timerTick(): Promise<void> {
    await this.playSound(SoundType.TIMER_TICK);
  }

  async start(): Promise<void> {
    await this.playSound(SoundType.START);
  }

  // Settings
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  isReady(): boolean {
    return this.sounds.size > 0;
  }

  // Clean up
  async cleanup(): Promise<void> {
    for (const [, soundEffect] of this.sounds) {
      if (soundEffect.sound) {
        await soundEffect.sound.unloadAsync();
      }
    }
    this.sounds.clear();
  }
}

export const soundEffects = new SoundEffectsService();