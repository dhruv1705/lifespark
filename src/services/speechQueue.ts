type SpeechPriority = 'low' | 'medium' | 'high';
type SpeechType = 'welcome' | 'encouragement' | 'milestone' | 'transition' | 'completion' | 'time-alert' | 'exercise-intro';

interface SpeechItem {
  id: string;
  text: string;
  priority: SpeechPriority;
  type: SpeechType;
  timestamp: number;
  cannotInterrupt?: boolean;
  sessionType?: 'stretch' | 'strength';
}

interface SpeechOptions {
  cannotInterrupt?: boolean;
  delay?: number;
  sessionType?: 'stretch' | 'strength';
}

class SpeechQueueService {
  private queue: SpeechItem[] = [];
  private isPlaying: boolean = false;
  private currentSpeech: SpeechItem | null = null;
  private lastSpeechTime: number = 0;
  private minGapBetweenSpeeches: number = 2000; // 2 seconds minimum gap
  
  // Track active speech types to prevent conflicts
  private activeSpeechTypes: Set<SpeechType> = new Set();

  // Priority levels (higher number = higher priority)
  private priorityLevels = {
    'low': 1,
    'medium': 2, 
    'high': 3
  };

  // Add speech to queue with smart conflict prevention
  addSpeech(
    text: string, 
    type: SpeechType, 
    priority: SpeechPriority = 'medium',
    options: SpeechOptions = {}
  ): string {
    const speechId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we should allow this speech
    if (!this.shouldAllowSpeech(type, priority)) {
      console.log(`🚫 Speech blocked: ${type} - ${text.substring(0, 30)}...`);
      return speechId;
    }

    const speechItem: SpeechItem = {
      id: speechId,
      text,
      type,
      priority,
      timestamp: Date.now(),
      cannotInterrupt: options.cannotInterrupt || false,
      sessionType: options.sessionType
    };

    // Handle high priority speeches
    if (priority === 'high') {
      if (options.cannotInterrupt) {
        // Critical speeches go to front and cannot be interrupted
        this.queue.unshift(speechItem);
      } else {
        // High priority goes to front but can be interrupted
        const insertIndex = this.queue.findIndex(item => item.priority !== 'high');
        this.queue.splice(insertIndex === -1 ? this.queue.length : insertIndex, 0, speechItem);
      }
    } else {
      // Medium and low priority go to back, sorted by priority
      this.queue.push(speechItem);
      this.queue.sort((a, b) => this.priorityLevels[b.priority] - this.priorityLevels[a.priority]);
    }

    // Mark speech type as active
    this.activeSpeechTypes.add(type);

    console.log(`📝 Speech queued [${priority}]: ${type} - "${text.substring(0, 40)}..."`);
    console.log(`📋 Queue size: ${this.queue.length}, Active types: ${Array.from(this.activeSpeechTypes).join(', ')}`);

    // Start processing if not already playing
    if (!this.isPlaying) {
      this.processQueue();
    }

    return speechId;
  }

  // Check if speech should be allowed based on timing and conflicts
  private shouldAllowSpeech(type: SpeechType, priority: SpeechPriority): boolean {
    const now = Date.now();
    
    // Always allow high priority speeches
    if (priority === 'high') {
      return true;
    }

    // Check minimum gap between speeches
    const timeSinceLastSpeech = now - this.lastSpeechTime;
    if (timeSinceLastSpeech < this.minGapBetweenSpeeches) {
      console.log(`⏰ Speech too soon: ${timeSinceLastSpeech}ms < ${this.minGapBetweenSpeeches}ms`);
      return false;
    }

    // Prevent duplicate speech types
    if (this.activeSpeechTypes.has(type)) {
      console.log(`🔄 Speech type already active: ${type}`);
      return false;
    }

    // Check if current speech cannot be interrupted
    if (this.currentSpeech?.cannotInterrupt && this.isPlaying) {
      console.log(`🛡️ Current speech cannot be interrupted: ${this.currentSpeech.type}`);
      return false;
    }

    return true;
  }

  // Process the speech queue sequentially
  private async processQueue(): Promise<void> {
    if (this.isPlaying || this.queue.length === 0) {
      return;
    }

    this.isPlaying = true;

    while (this.queue.length > 0) {
      const speechItem = this.queue.shift()!;
      this.currentSpeech = speechItem;

      try {
        console.log(`🎙️ Playing speech: [${speechItem.priority}] ${speechItem.type}`);
        
        // Import here to avoid circular dependency
        const { elevenLabsSpeech } = await import('./elevenLabsSpeechService');
        
        if (elevenLabsSpeech.isConfigured()) {
          await elevenLabsSpeech.speak(speechItem.text);
          console.log(`✅ Speech completed: ${speechItem.type}`);
        } else {
          console.warn('🚫 ElevenLabs not configured, skipping speech');
        }

        // Update timing
        this.lastSpeechTime = Date.now();
        
        // Remove speech type from active set
        this.activeSpeechTypes.delete(speechItem.type);

        // Small gap between speeches for natural flow
        if (this.queue.length > 0) {
          await this.wait(1000); // 1 second gap between speeches
        }

      } catch (error) {
        console.error(`❌ Speech failed: ${speechItem.type}`, error);
        // Remove from active set even on failure
        this.activeSpeechTypes.delete(speechItem.type);
      }
    }

    this.currentSpeech = null;
    this.isPlaying = false;
    console.log('🏁 Speech queue completed');
  }

  // Interrupt current speech if it can be interrupted
  async interruptCurrent(): Promise<boolean> {
    if (!this.isPlaying || !this.currentSpeech) {
      return false;
    }

    if (this.currentSpeech.cannotInterrupt) {
      console.log('🛡️ Cannot interrupt current speech');
      return false;
    }

    try {
      const { elevenLabsSpeech } = await import('./elevenLabsSpeechService');
      await elevenLabsSpeech.stop();
      
      // Clean up current speech
      if (this.currentSpeech) {
        this.activeSpeechTypes.delete(this.currentSpeech.type);
      }
      
      console.log('⏹️ Current speech interrupted');
      return true;
    } catch (error) {
      console.error('❌ Failed to interrupt speech:', error);
      return false;
    }
  }

  // Clear queue of specific speech types
  clearSpeechType(type: SpeechType): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.type !== type);
    this.activeSpeechTypes.delete(type);
    
    const removed = initialLength - this.queue.length;
    if (removed > 0) {
      console.log(`🗑️ Cleared ${removed} speeches of type: ${type}`);
    }
    return removed;
  }

  // Clear all low priority speeches
  clearLowPriority(): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.priority !== 'low');
    
    const removed = initialLength - this.queue.length;
    if (removed > 0) {
      console.log(`🗑️ Cleared ${removed} low priority speeches`);
    }
    return removed;
  }

  // Check if specific speech type is in queue or playing
  hasSpeechType(type: SpeechType): boolean {
    return this.activeSpeechTypes.has(type) || 
           this.queue.some(item => item.type === type) ||
           (this.currentSpeech?.type === type);
  }

  // Check if queue has upcoming speeches
  hasUpcomingSpeech(): boolean {
    return this.queue.length > 0 || this.isPlaying;
  }

  // Wait for current speech to complete
  async waitForCurrent(): Promise<void> {
    while (this.isPlaying) {
      await this.wait(100);
    }
  }

  // Stop all speech and clear queue
  async stopAll(): Promise<void> {
    console.log('🛑 Stopping all speech and clearing queue');
    
    try {
      const { elevenLabsSpeech } = await import('./elevenLabsSpeechService');
      await elevenLabsSpeech.stop();
    } catch (error) {
      console.error('❌ Failed to stop speech:', error);
    }

    this.queue = [];
    this.activeSpeechTypes.clear();
    this.currentSpeech = null;
    this.isPlaying = false;
  }

  // Get queue status for debugging
  getStatus() {
    return {
      queueLength: this.queue.length,
      isPlaying: this.isPlaying,
      currentSpeech: this.currentSpeech?.type || null,
      activeSpeechTypes: Array.from(this.activeSpeechTypes),
      upcomingSpeeches: this.queue.map(item => ({ type: item.type, priority: item.priority }))
    };
  }

  // Utility method for waiting
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Set minimum gap between speeches
  setMinimumGap(ms: number): void {
    this.minGapBetweenSpeeches = Math.max(1000, ms); // Minimum 1 second
    console.log(`⏱️ Minimum speech gap set to: ${this.minGapBetweenSpeeches}ms`);
  }
}

// Export singleton instance
export const speechQueue = new SpeechQueueService();
export type { SpeechPriority, SpeechType, SpeechOptions };