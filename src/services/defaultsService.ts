import { ContentService, ChatbotContent } from './contentService';
import { SystemSettingsService, SystemSettings } from './systemSettingsService';
import ConfigService from './configService';

const API_BASE_URL = '/api/defaults';

// Safe JSON parsing helper
async function safeJsonParse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response:', text);
    if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error('Received HTML instead of JSON - likely a server error or routing issue');
    }
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
  }
}

export interface UserDefaults {
  default_admin: {
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
    created_by: string;
    permissions: Record<string, boolean>;
  };
  user_roles: Record<string, {
    name: string;
    permissions: string[];
  }>;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special_chars: boolean;
    expiry_days: number;
  };
  session_settings: {
    timeout_minutes: number;
    max_concurrent_sessions: number;
    remember_me_days: number;
  };
}

export class DefaultsService {
  static async getUserDefaults(): Promise<UserDefaults> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user defaults: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching user defaults:', error);
      throw error;
    }
  }

  static async updateUserDefaults(defaults: Partial<UserDefaults>): Promise<UserDefaults> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaults),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user defaults: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      console.log('User defaults updated successfully:', data.message);
      return data.data;
    } catch (error) {
      console.error('Error updating user defaults:', error);
      throw error;
    }
  }

  // Centralized method to initialize all default values
  static async initializeAllDefaults(): Promise<{
    config: any;
    content: ChatbotContent;
    settings: SystemSettings;
    userDefaults: UserDefaults;
  }> {
    try {
      console.log('Initializing all default values...');
      
      // Load all defaults in parallel
      const [config, content, settings, userDefaults] = await Promise.all([
        ConfigService.getConfig(),
        ContentService.getContent(),
        SystemSettingsService.getSettings(),
        this.getUserDefaults()
      ]);

      console.log('All defaults initialized successfully');
      
      return {
        config,
        content,
        settings,
        userDefaults
      };
    } catch (error) {
      console.error('Error initializing defaults:', error);
      throw error;
    }
  }

  // Reset all defaults to factory settings
  static async resetToFactoryDefaults(): Promise<void> {
    try {
      console.log('Resetting to factory defaults...');
      
      // This would reset all collections to their default states
      // Implementation would depend on specific requirements
      console.warn('Factory reset not implemented yet');
      
    } catch (error) {
      console.error('Error resetting to factory defaults:', error);
      throw error;
    }
  }

  // Export all current settings for backup
  static async exportAllSettings(): Promise<{
    config: any;
    content: ChatbotContent;
    settings: SystemSettings;
    userDefaults: UserDefaults;
    timestamp: string;
  }> {
    try {
      const allDefaults = await this.initializeAllDefaults();
      
      return {
        ...allDefaults,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }
}

export default DefaultsService;
