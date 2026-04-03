const API_BASE_URL = '/api/config/key';

export interface ConfigKeyData {
  configKey: string;
  created_at: string;
  updated_at: string;
}

export class ConfigKeyService {
  static async getCurrentKey(): Promise<ConfigKeyData | null> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch config key: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.warning) {
        console.warn('Config key warning:', result.warning);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching config key:', error);
      throw error;
    }
  }

  static async generateNewKey(): Promise<ConfigKeyData> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate config key: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Config key generated:', result.message);
      return result.data;
    } catch (error) {
      console.error('Error generating config key:', error);
      throw error;
    }
  }
}

export default ConfigKeyService;
