const API_BASE_URL = '/api/settings';
const PUBLIC_API_URL = '/api/settings/public';

export interface SystemSettings {
  direct_line: {
    base_url: string;
    token_endpoint: string;
    locale: string;
    timeout: number;
  };
  api_settings: {
    default_headers: Record<string, string>;
    timeout: number;
    retry_attempts: number;
  };
  file_upload: {
    max_size: number;
    allowed_types: string[];
    storage_path: string;
  };
  cloudinary?: {
    url: string;
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };
  analytics: {
    date_format: {
      locale: string;
      options: Record<string, string>;
    };
    default_presets: string[];
  };
  security: {
    password_min_length: number;
    session_timeout: number;
    max_login_attempts: number;
  };
   chatbot_visibility?: {
    mode: 'always_show' | 'hide_on_urls' | 'show_only_on_urls';
    url_list: string[];
  };
}

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

export class SystemSettingsService {
  static async getSettings(usePublicEndpoint = false): Promise<SystemSettings> {
    try {
      const url = usePublicEndpoint ? PUBLIC_API_URL : API_BASE_URL;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // If the authenticated endpoint fails with 401, try the public endpoint
      if (!response.ok && response.status === 401 && !usePublicEndpoint) {
        console.warn('Authentication required for settings, falling back to public settings');
        return this.getSettings(true);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      
      // Log warning if database was unavailable
      if (data.warning) {
        console.warn('Settings warning:', data.warning);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  static async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      console.log('Settings updated successfully:', data.message);
      return data.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  static async saveSettings(settings: SystemSettings): Promise<SystemSettings> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      console.log('Settings saved successfully:', data.message);
      return data.data;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }
}

export default SystemSettingsService;
