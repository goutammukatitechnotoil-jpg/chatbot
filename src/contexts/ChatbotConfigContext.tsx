import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocaleCode } from '../utils/locale';
import { ConfigService } from '../services/configService';

interface ChatbotConfig {
  colorTheme: string;
  quickQuestionsTitle?: string;
  headerColorTheme: string;
  logoUrl: string;
  iconType: 'default' | 'siriwhite' | 'siritrans';
  chatbotName: string;
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

interface ChatbotConfigContextType {
  config: ChatbotConfig;
  updateConfig: (newConfig: Partial<ChatbotConfig>) => void;
  loading: boolean;
}

const defaultConfig: ChatbotConfig = {
  colorTheme: '#f37021',
  quickQuestionsTitle: 'Quick Questions:',
  headerColorTheme: '#f37021',
  logoUrl: '/FPTSoftware.png',
  iconType: 'default',
  chatbotName: 'FPT AI Assistant',
  triggerMessage: 'Hi there! How can I help you today?',
  botGreetingMessage: 'Hello! I\'m your AI assistant. How can I help you today?',
  popupTitle: 'Need help? 👋🏻',
  popupDescription: 'I\'ve got you covered!',
  locale: 'en-US',
  autoDetectLocale: true,
  autoTriggerEnabled: true,
  autoTriggerCount: 3,
  autoTriggerButtonId: null,
  tokenEndpoint: 'https://directline.botframework.com/v3/directline/tokens/generate',
  sourcesWidth: 1000,
};

const ChatbotConfigContext = createContext<ChatbotConfigContextType | undefined>(undefined);

export function ChatbotConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load configuration from API on mount
  useEffect(() => {
    setIsClient(true);
    loadConfigFromAPI();
  }, []);

  const loadConfigFromAPI = async () => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const configKey = urlParams.get('configKey');
        const isEmbedded = urlParams.get('embedded') === 'true';

        if (configKey && isEmbedded) {
          // Embedded mode: load config using the config key
          console.log('Loading config for embedded mode with key:', configKey);
          const response = await fetch(`/api/config/public?key=${encodeURIComponent(configKey)}`);
          if (response.ok) {
            const result = await response.json();
            if (result.warning) {
              console.warn('Config warning:', result.warning);
            }
            setConfig({ ...defaultConfig, ...result.data });
            console.log('Config loaded for embedded mode:', result.data);
          } else {
            throw new Error('Failed to load embedded config');
          }
        } else {
          // Admin mode: load config normally
          console.log('Loading config from API...');
          const apiConfig = await ConfigService.getConfig();
          console.log('Config loaded from API:', apiConfig);
          setConfig(apiConfig);
          
          // Optional: Also save to localStorage as backup
          localStorage.setItem('chatbot_config', JSON.stringify(apiConfig));
        }
      }
    } catch (error) {
      console.error('Failed to load config from API, trying localStorage:', error);
      
      // Fallback to localStorage if API fails (only in admin mode)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const isEmbedded = urlParams.get('embedded') === 'true';
        
        if (!isEmbedded) {
          const stored = localStorage.getItem('chatbot_config');
          if (stored) {
            try {
              const parsedConfig = JSON.parse(stored);
              setConfig({ ...defaultConfig, ...parsedConfig });
              console.log('Config loaded from localStorage fallback');
            } catch (parseError) {
              console.error('Failed to parse localStorage config:', parseError);
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<ChatbotConfig>) => {
    console.log('updateConfig called with:', newConfig);
    
    try {
      // Optimistically update local state
      const updated = { ...config, ...newConfig };
      setConfig(updated);
      console.log('Local config state updated:', updated);
      
      // Save to API
      if (isClient) {
        console.log('Saving config to API...');
        const savedConfig = await ConfigService.saveConfig(updated);
        console.log('Config saved to API successfully:', savedConfig);
        
        // Optional: Also update localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('chatbot_config', JSON.stringify(savedConfig));
        }
        
        // Update state with the response from API (in case there were any server-side changes)
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error('Failed to save config to API:', error);
      
      // If API fails, at least save to localStorage
      if (typeof window !== 'undefined') {
        const updated = { ...config, ...newConfig };
        localStorage.setItem('chatbot_config', JSON.stringify(updated));
        console.log('Config saved to localStorage as fallback');
      }
    }
  };

  return (
    <ChatbotConfigContext.Provider value={{ config, updateConfig, loading }}>
      {children}
    </ChatbotConfigContext.Provider>
  );
}

export function useChatbotConfig() {
  const context = useContext(ChatbotConfigContext);
  if (!context) {
    throw new Error('useChatbotConfig must be used within ChatbotConfigProvider');
  }
  return context;
}
