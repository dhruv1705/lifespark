export interface MusicTrack {
  id: string;
  name: string;
  description: string;
  file: any;
  type: 'calm' | 'energetic' | 'focus' | 'ambient';
  duration?: number; // in seconds
  icon: string;
  color: string;
  tags: string[];
}

export interface MusicPreference {
  globalDefault: string;
  habitSpecific: Record<string, string>; // habitId -> trackId
  lastUsed: string;
  volume: number;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'angelical',
    name: 'Calm & Peaceful',
    description: 'Gentle, meditative background music perfect for stretching and mindful movement',
    file: require('../../assets/audio/angelical.mp3'),
    type: 'calm',
    duration: 300, // 5 minutes
    icon: '🧘‍♀️',
    color: '#4CAF50', // Green
    tags: ['meditation', 'peaceful', 'gentle', 'stretch', 'relax'],
  },
  {
    id: 'upbeat',
    name: 'Energetic & Motivating',
    description: 'Upbeat, energizing workout music to power through intense exercises',
    file: require('../../assets/audio/upbeat.mp3'),
    type: 'energetic',
    duration: 240, // 4 minutes
    icon: '🔥',
    color: '#FF9800', // Orange
    tags: ['workout', 'energy', 'motivation', 'strength', 'power'],
  },
];

export const HABIT_MUSIC_RECOMMENDATIONS: Record<string, string[]> = {
  // Stretch habits
  stretch: ['angelical'],
  'morning stretch': ['angelical'],
  
  // Strength habits
  strength: ['upbeat', 'angelical'],
  'push-ups': ['upbeat', 'angelical'],
  'squats': ['upbeat', 'angelical'],
  '10 squats': ['upbeat', 'angelical'],
  
  // Default fallback
  default: ['angelical', 'upbeat'],
};

class MusicLibraryService {
  private tracks: MusicTrack[] = [...MUSIC_TRACKS];
  
  // Get all available tracks
  getAllTracks(): MusicTrack[] {
    return [...this.tracks];
  }
  
  // Get track by ID
  getTrackById(id: string): MusicTrack | null {
    return this.tracks.find(track => track.id === id) || null;
  }
  
  // Get tracks by type
  getTracksByType(type: MusicTrack['type']): MusicTrack[] {
    return this.tracks.filter(track => track.type === type);
  }
  
  // Get recommended tracks for a habit
  getRecommendedTracks(habitName: string): MusicTrack[] {
    const habitKey = habitName.toLowerCase();
    
    // Try exact match first
    let recommendedIds = HABIT_MUSIC_RECOMMENDATIONS[habitKey];
    
    // Try partial matches
    if (!recommendedIds) {
      for (const [key, ids] of Object.entries(HABIT_MUSIC_RECOMMENDATIONS)) {
        if (habitKey.includes(key) || key.includes(habitKey)) {
          recommendedIds = ids;
          break;
        }
      }
    }
    
    // Fallback to default
    if (!recommendedIds) {
      recommendedIds = HABIT_MUSIC_RECOMMENDATIONS.default;
    }
    
    return recommendedIds
      .map(id => this.getTrackById(id))
      .filter(track => track !== null) as MusicTrack[];
  }
  
  // Get smart recommendation based on habit type and user history
  getSmartRecommendation(habitName: string, userPreferences?: MusicPreference): MusicTrack {
    const recommendedTracks = this.getRecommendedTracks(habitName);
    
    // If user has a specific preference for this habit, use it
    if (userPreferences?.habitSpecific) {
      const habitKey = habitName.toLowerCase();
      const preferredId = userPreferences.habitSpecific[habitKey];
      if (preferredId) {
        const preferredTrack = this.getTrackById(preferredId);
        if (preferredTrack) return preferredTrack;
      }
    }
    
    // Use last used track if available
    if (userPreferences?.lastUsed) {
      const lastTrack = this.getTrackById(userPreferences.lastUsed);
      if (lastTrack && recommendedTracks.includes(lastTrack)) {
        return lastTrack;
      }
    }
    
    // Use global default if set and appropriate
    if (userPreferences?.globalDefault) {
      const defaultTrack = this.getTrackById(userPreferences.globalDefault);
      if (defaultTrack && recommendedTracks.includes(defaultTrack)) {
        return defaultTrack;
      }
    }
    
    // Fallback to first recommended track
    return recommendedTracks[0] || this.tracks[0];
  }
  
  // Search tracks by name or tags
  searchTracks(query: string): MusicTrack[] {
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) return this.getAllTracks();
    
    return this.tracks.filter(track => 
      track.name.toLowerCase().includes(searchQuery) ||
      track.description.toLowerCase().includes(searchQuery) ||
      track.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }
  
  // Get track statistics
  getTrackStats(trackId: string) {
    const track = this.getTrackById(trackId);
    if (!track) return null;
    
    return {
      id: track.id,
      name: track.name,
      type: track.type,
      duration: track.duration,
      estimatedUsage: this.estimateTrackUsage(track),
    };
  }
  
  private estimateTrackUsage(track: MusicTrack): number {
    // Simple usage estimation based on track type and recommendations
    const recommendations = Object.values(HABIT_MUSIC_RECOMMENDATIONS);
    const usageCount = recommendations.reduce((count, trackIds) => {
      return count + (trackIds.includes(track.id) ? 1 : 0);
    }, 0);
    
    return usageCount;
  }
  
  // Add a new track (for future extensibility)
  addTrack(track: Omit<MusicTrack, 'id'>): MusicTrack {
    const newTrack: MusicTrack = {
      ...track,
      id: this.generateTrackId(track.name),
    };
    
    this.tracks.push(newTrack);
    return newTrack;
  }
  
  private generateTrackId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
  }
  
  // Validate track file exists
  validateTrack(track: MusicTrack): boolean {
    try {
      return !!track.file;
    } catch (error) {
      console.warn(`Track validation failed for ${track.id}:`, error);
      return false;
    }
  }
  
  // Get formatted track info for UI display
  getDisplayInfo(trackId: string) {
    const track = this.getTrackById(trackId);
    if (!track) return null;
    
    return {
      id: track.id,
      title: track.name,
      subtitle: track.description,
      icon: track.icon,
      color: track.color,
      duration: track.duration ? `${Math.ceil(track.duration / 60)} min` : null,
      tags: track.tags.slice(0, 3), // Show first 3 tags
    };
  }
}

export const musicLibrary = new MusicLibraryService();