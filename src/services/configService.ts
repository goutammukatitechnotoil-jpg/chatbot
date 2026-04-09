import { LocaleCode } from '../utils/locale';

interface ChatbotConfig {
  colorTheme: string;
  headerColorTheme: string;
  logoUrl: string;
  iconType: 'default' | 'siriwhite' | 'siritrans';
  chatbotName: string;
  quickQuestionsTitle?: string;
  triggerMessage: string;
  botGreetingMessage: string;
  popupTitle: string;
  popupDescription: string;
  locale: LocaleCode;
  autoDetectLocale: boolean;
  autoTriggerEnabled: boolean;
  autoTriggerCount: number;
  autoTriggerButtonId: string | null;
  tokenEndpoint: string;
  sourcesWidth: number;
}

const API_BASE_URL = '/api/config';
const PUBLIC_API_URL = '/api/config/public';

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

export class ConfigService {
  static async getConfig(usePublicEndpoint = false, mode: 'live' | 'test' = 'live'): Promise<ChatbotConfig> {
    try {
      const baseUrl = usePublicEndpoint ? PUBLIC_API_URL : API_BASE_URL;
      const url = `${baseUrl}?mode=${mode}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // If the authenticated endpoint fails with 401, try the public endpoint
      if (!response.ok && response.status === 401 && !usePublicEndpoint) {
        console.warn('Authentication required for config, falling back to public config');
        return this.getConfig(true, mode);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching config:', error);
      throw error;
    }
  }

  static async updateConfig(config: Partial<ChatbotConfig>, mode: 'live' | 'test' = 'live'): Promise<ChatbotConfig> {
    try {
      const url = `${API_BASE_URL}?mode=${mode}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to update config: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      console.log('Config updated successfully:', data.message);
      return data.data;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }

  static async saveConfig(config: ChatbotConfig): Promise<ChatbotConfig> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to save config: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      console.log('Config saved successfully:', data.message);
      return data.data;
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }
}

export default ConfigService;
