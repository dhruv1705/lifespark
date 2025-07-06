import * as Haptics from 'expo-haptics';

export enum HapticType {
  START = 'start',
  REP_COMPLETE = 'rep_complete',
  MILESTONE = 'milestone',
  HALFWAY = 'halfway',
  FINAL_REP = 'final_rep',
  COMPLETION = 'completion',
  FORM_CUE = 'form_cue',
  TIMER_TICK = 'timer_tick',
  ACHIEVEMENT = 'achievement',
}

interface HapticPattern {
  type: Haptics.ImpactFeedbackStyle | 'notification' | 'selection' | 'custom';
  intensity?: Haptics.ImpactFeedbackStyle;
  pattern?: number[]; // For custom patterns: [vibrate, pause, vibrate, pause, ...]
}

const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  [HapticType.START]: {
    type: Haptics.ImpactFeedbackStyle.Medium,
  },
  [HapticType.REP_COMPLETE]: {
    type: Haptics.ImpactFeedbackStyle.Light,
  },
  [HapticType.MILESTONE]: {
    type: Haptics.ImpactFeedbackStyle.Heavy,
  },
  [HapticType.HALFWAY]: {
    type: 'custom',
    pattern: [100, 50, 100, 50, 200], // Double tap + long vibration
  },
  [HapticType.FINAL_REP]: {
    type: 'custom',
    pattern: [150, 100, 150, 100, 150], // Triple tap pattern
  },
  [HapticType.COMPLETION]: {
    type: 'custom',
    pattern: [200, 100, 200, 100, 200, 100, 400], // Celebration pattern
  },
  [HapticType.FORM_CUE]: {
    type: 'selection',
  },
  [HapticType.TIMER_TICK]: {
    type: 'selection',
  },
  [HapticType.ACHIEVEMENT]: {
    type: 'custom',
    pattern: [100, 50, 100, 50, 100, 50, 300], // Achievement fanfare
  },
};

class HapticFeedbackService {
  private isEnabled: boolean = true;
  private lastHapticTime: number = 0;
  private minHapticInterval: number = 50; // Minimum 50ms between haptics

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  async trigger(type: HapticType): Promise<void> {
    if (!this.isEnabled) return;

    const now = Date.now();
    if (now - this.lastHapticTime < this.minHapticInterval) {
      return; // Prevent haptic spam
    }

    this.lastHapticTime = now;

    try {
      const pattern = HAPTIC_PATTERNS[type];
      
      if (pattern.type === 'custom' && pattern.pattern) {
        await this.playCustomPattern(pattern.pattern);
      } else if (pattern.type === 'notification') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (pattern.type === 'selection') {
        await Haptics.selectionAsync();
      } else {
        await Haptics.impactAsync(pattern.type as Haptics.ImpactFeedbackStyle);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  private async playCustomPattern(pattern: number[]): Promise<void> {
    for (let i = 0; i < pattern.length; i++) {
      if (i % 2 === 0) {
        // Vibrate
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      // Pause (both vibrate and pause use the duration)
      await new Promise(resolve => setTimeout(resolve, pattern[i]));
    }
  }

  // Convenience methods for common patterns
  async repComplete(): Promise<void> {
    await this.trigger(HapticType.REP_COMPLETE);
  }

  async milestone(): Promise<void> {
    await this.trigger(HapticType.MILESTONE);
  }

  async halfway(): Promise<void> {
    await this.trigger(HapticType.HALFWAY);
  }

  async finalRep(): Promise<void> {
    await this.trigger(HapticType.FINAL_REP);
  }

  async completion(): Promise<void> {
    await this.trigger(HapticType.COMPLETION);
  }

  async formCue(): Promise<void> {
    await this.trigger(HapticType.FORM_CUE);
  }

  async timerTick(): Promise<void> {
    await this.trigger(HapticType.TIMER_TICK);
  }

  async achievement(): Promise<void> {
    await this.trigger(HapticType.ACHIEVEMENT);
  }

  async start(): Promise<void> {
    await this.trigger(HapticType.START);
  }

  // Create haptic sequences for specific scenarios
  async countdownSequence(): Promise<void> {
    if (!this.isEnabled) return;

    // 3-2-1 countdown with increasing intensity
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  async celebrationSequence(): Promise<void> {
    if (!this.isEnabled) return;

    // Victory celebration pattern
    const pattern = [100, 50, 100, 50, 100, 100, 200, 100, 200];
    await this.playCustomPattern(pattern);
  }

  // Form coaching haptic cues
  async formCorrection(): Promise<void> {
    if (!this.isEnabled) return;

    // Gentle double tap for form correction
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async formConfirmation(): Promise<void> {
    if (!this.isEnabled) return;

    // Single firm tap for good form
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  // Rhythm guidance for reps
  async rhythmTick(): Promise<void> {
    if (!this.isEnabled) return;

    await Haptics.selectionAsync();
  }

  async rhythmDownbeat(): Promise<void> {
    if (!this.isEnabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async rhythmUpbeat(): Promise<void> {
    if (!this.isEnabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export const hapticFeedback = new HapticFeedbackService();