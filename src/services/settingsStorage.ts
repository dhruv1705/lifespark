import AsyncStorage from '@react-native-async-storage/async-storage';
import { CharacterType } from '../components/MotivationMascot';

interface StoredMusicPreferences {
  globalDefault: string;
  habitSpecific: Record<string, string>;
  lastUsed: string;
  volume: number;
}

interface StoredAudioSettings {
  musicEnabled: boolean;
  musicVolume: number;
  selectedMusicId: string;
  musicPreferences?: StoredMusicPreferences;
}

interface StoredCharacterPreferences {
  selectedCharacter: CharacterType;
  characterSelectedAt: string;
  hasCompletedCharacterSelection: boolean;
  allowCharacterChanges: boolean;
}

interface StoredViewPreferences {
  homeViewMode: 'grid' | 'journey';
  lastViewChange: string;
}

const STORAGE_KEYS = {
  AUDIO_SETTINGS: '@lifespark_audio_settings',
  MUSIC_PREFERENCES: '@lifespark_music_preferences',
  USER_PREFERENCES: '@lifespark_user_preferences',
  CHARACTER_PREFERENCES: '@lifespark_character_preferences',
  VIEW_PREFERENCES: '@lifespark_view_preferences',
} as const;

class SettingsStorageService {
  // Audio Settings Persistence
  
  async saveAudioSettings(settings: Partial<StoredAudioSettings>): Promise<void> {
    try {
      const existingSettings = await this.loadAudioSettings();
      const updatedSettings = { ...existingSettings, ...settings };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUDIO_SETTINGS,
        JSON.stringify(updatedSettings)
      );
      
      console.log('💾 Audio settings saved successfully');
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
  }

  async loadAudioSettings(): Promise<Partial<StoredAudioSettings>> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUDIO_SETTINGS);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📖 Audio settings loaded successfully');
        return parsed;
      }
      
      // Return default settings if nothing stored
      return this.getDefaultAudioSettings();
    } catch (error) {
      console.error('Error loading audio settings:', error);
      return this.getDefaultAudioSettings();
    }
  }

  private getDefaultAudioSettings(): StoredAudioSettings {
    return {
      musicEnabled: true,
      musicVolume: 0.3,
      selectedMusicId: 'angelical',
      musicPreferences: {
        globalDefault: 'angelical',
        habitSpecific: {},
        lastUsed: 'angelical',
        volume: 0.3,
      },
    };
  }

  // Music Preferences Persistence
  
  async saveMusicPreferences(preferences: StoredMusicPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.MUSIC_PREFERENCES,
        JSON.stringify(preferences)
      );
      
      console.log('🎵 Music preferences saved successfully');
    } catch (error) {
      console.error('Error saving music preferences:', error);
    }
  }

  async loadMusicPreferences(): Promise<StoredMusicPreferences> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MUSIC_PREFERENCES);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('🎵 Music preferences loaded successfully');
        return parsed;
      }
      
      // Return default preferences
      return {
        globalDefault: 'angelical',
        habitSpecific: {},
        lastUsed: 'angelical',
        volume: 0.3,
      };
    } catch (error) {
      console.error('Error loading music preferences:', error);
      return {
        globalDefault: 'angelical',
        habitSpecific: {},
        lastUsed: 'angelical',
        volume: 0.3,
      };
    }
  }

  // Habit-Specific Music Preferences
  
  async saveHabitMusicPreference(habitName: string, trackId: string): Promise<void> {
    try {
      const preferences = await this.loadMusicPreferences();
      preferences.habitSpecific[habitName.toLowerCase()] = trackId;
      preferences.lastUsed = trackId;
      
      await this.saveMusicPreferences(preferences);
      console.log(`🎵 Saved music preference for ${habitName}: ${trackId}`);
    } catch (error) {
      console.error('Error saving habit music preference:', error);
    }
  }

  async getHabitMusicPreference(habitName: string): Promise<string | null> {
    try {
      const preferences = await this.loadMusicPreferences();
      return preferences.habitSpecific[habitName.toLowerCase()] || null;
    } catch (error) {
      console.error('Error getting habit music preference:', error);
      return null;
    }
  }

  // Global Settings
  
  async saveGlobalMusicDefault(trackId: string): Promise<void> {
    try {
      const preferences = await this.loadMusicPreferences();
      preferences.globalDefault = trackId;
      preferences.lastUsed = trackId;
      
      await this.saveMusicPreferences(preferences);
      console.log(`🎵 Saved global music default: ${trackId}`);
    } catch (error) {
      console.error('Error saving global music default:', error);
    }
  }

  async getGlobalMusicDefault(): Promise<string> {
    try {
      const preferences = await this.loadMusicPreferences();
      return preferences.globalDefault;
    } catch (error) {
      console.error('Error getting global music default:', error);
      return 'angelical'; // Fallback
    }
  }

  // Volume Settings
  
  async saveMusicVolume(volume: number): Promise<void> {
    try {
      const settings = await this.loadAudioSettings();
      settings.musicVolume = volume;
      
      const preferences = await this.loadMusicPreferences();
      preferences.volume = volume;
      
      await Promise.all([
        this.saveAudioSettings(settings),
        this.saveMusicPreferences(preferences),
      ]);
      
      console.log(`🔊 Saved music volume: ${Math.round(volume * 100)}%`);
    } catch (error) {
      console.error('Error saving music volume:', error);
    }
  }

  // Utility Methods
  
  async clearAllSettings(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUDIO_SETTINGS,
        STORAGE_KEYS.MUSIC_PREFERENCES,
        STORAGE_KEYS.USER_PREFERENCES,
      ]);
      
      console.log('🗑️ All settings cleared');
    } catch (error) {
      console.error('Error clearing settings:', error);
    }
  }

  async exportSettings(): Promise<string> {
    try {
      const audioSettings = await this.loadAudioSettings();
      const musicPreferences = await this.loadMusicPreferences();
      
      const exportData = {
        audioSettings,
        musicPreferences,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const importData = JSON.parse(settingsJson);
      
      if (importData.audioSettings) {
        await this.saveAudioSettings(importData.audioSettings);
      }
      
      if (importData.musicPreferences) {
        await this.saveMusicPreferences(importData.musicPreferences);
      }
      
      console.log('📥 Settings imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  // Character Preferences Persistence
  
  async saveCharacterPreferences(preferences: Partial<StoredCharacterPreferences>): Promise<void> {
    try {
      const existingPreferences = await this.loadCharacterPreferences();
      const updatedPreferences = { ...existingPreferences, ...preferences };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHARACTER_PREFERENCES,
        JSON.stringify(updatedPreferences)
      );
      
      console.log('🎭 Character preferences saved successfully');
    } catch (error) {
      console.error('Error saving character preferences:', error);
    }
  }

  async loadCharacterPreferences(): Promise<StoredCharacterPreferences> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHARACTER_PREFERENCES);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('🎭 Character preferences loaded successfully');
        return parsed;
      }
      
      // Return default preferences for new users
      return this.getDefaultCharacterPreferences();
    } catch (error) {
      console.error('Error loading character preferences:', error);
      return this.getDefaultCharacterPreferences();
    }
  }

  private getDefaultCharacterPreferences(): StoredCharacterPreferences {
    return {
      selectedCharacter: 'plant',
      characterSelectedAt: new Date().toISOString(),
      hasCompletedCharacterSelection: false,
      allowCharacterChanges: true,
    };
  }

  async selectCharacter(characterType: CharacterType): Promise<void> {
    try {
      await this.saveCharacterPreferences({
        selectedCharacter: characterType,
        characterSelectedAt: new Date().toISOString(),
        hasCompletedCharacterSelection: true,
      });
      
      console.log(`🎭 Character selected: ${characterType}`);
    } catch (error) {
      console.error('Error selecting character:', error);
    }
  }

  async getSelectedCharacter(): Promise<CharacterType> {
    try {
      const preferences = await this.loadCharacterPreferences();
      return preferences.selectedCharacter;
    } catch (error) {
      console.error('Error getting selected character:', error);
      return 'plant'; // Fallback
    }
  }

  async hasCompletedCharacterSelection(): Promise<boolean> {
    try {
      const preferences = await this.loadCharacterPreferences();
      return preferences.hasCompletedCharacterSelection;
    } catch (error) {
      console.error('Error checking character selection status:', error);
      return false;
    }
  }

  // View Preferences Persistence
  
  async saveViewPreferences(preferences: Partial<StoredViewPreferences>): Promise<void> {
    try {
      const existingPreferences = await this.loadViewPreferences();
      const updatedPreferences = { ...existingPreferences, ...preferences };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.VIEW_PREFERENCES,
        JSON.stringify(updatedPreferences)
      );
      
      console.log('👀 View preferences saved successfully');
    } catch (error) {
      console.error('Error saving view preferences:', error);
    }
  }

  async loadViewPreferences(): Promise<StoredViewPreferences> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('👀 View preferences loaded successfully');
        return parsed;
      }
      
      // Return default preferences for new users
      return this.getDefaultViewPreferences();
    } catch (error) {
      console.error('Error loading view preferences:', error);
      return this.getDefaultViewPreferences();
    }
  }

  private getDefaultViewPreferences(): StoredViewPreferences {
    return {
      homeViewMode: 'grid',
      lastViewChange: new Date().toISOString(),
    };
  }

  async setHomeViewMode(mode: 'grid' | 'journey'): Promise<void> {
    try {
      await this.saveViewPreferences({
        homeViewMode: mode,
        lastViewChange: new Date().toISOString(),
      });
      
      console.log(`👀 Home view mode set to: ${mode}`);
    } catch (error) {
      console.error('Error setting home view mode:', error);
    }
  }

  async getHomeViewMode(): Promise<'grid' | 'journey'> {
    try {
      const preferences = await this.loadViewPreferences();
      return preferences.homeViewMode;
    } catch (error) {
      console.error('Error getting home view mode:', error);
      return 'grid'; // Fallback to grid view
    }
  }

  // Statistics & Analytics
  
  async getMusicUsageStats(): Promise<Record<string, number>> {
    try {
      const preferences = await this.loadMusicPreferences();
      const stats: Record<string, number> = {};
      
      // Count habit-specific preferences
      Object.values(preferences.habitSpecific).forEach(trackId => {
        stats[trackId] = (stats[trackId] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting music usage stats:', error);
      return {};
    }
  }

  async getSettingsInfo(): Promise<{
    hasStoredSettings: boolean;
    settingsSize: string;
    lastModified?: string;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const lifesparkKeys = keys.filter(key => key.startsWith('@lifespark_'));
      
      let totalSize = 0;
      for (const key of lifesparkKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        hasStoredSettings: lifesparkKeys.length > 0,
        settingsSize: `${(totalSize / 1024).toFixed(2)} KB`,
        lastModified: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting settings info:', error);
      return {
        hasStoredSettings: false,
        settingsSize: '0 KB',
      };
    }
  }
}

export const settingsStorage = new SettingsStorageService();