// Simple event emitter for cross-screen data synchronization
class DataSyncEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const dataSync = new DataSyncEmitter();

// Event types
export const DATA_SYNC_EVENTS = {
  HABIT_TOGGLED: 'habit_toggled',
  XP_UPDATED: 'xp_updated',
  GOAL_PROGRESS_UPDATED: 'goal_progress_updated',
} as const;