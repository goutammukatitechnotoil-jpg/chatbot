import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Public config endpoint that provides basic chatbot configuration
 * without requiring authentication. Used by the embedded chatbot.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return default config that doesn't require database access
    // In a production system, this could be cached tenant-specific config
    const defaultConfig = {
      colorTheme: '#f37021',
      headerColorTheme: '#f37021',
      logoUrl: '/FPTSoftware.png',
      iconType: 'default',
      chatbotName: 'AI Assistant',
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
      sourcesWidth: 1000
    };

    res.status(200).json({ 
      data: defaultConfig,
      note: 'Public chatbot configuration - no authentication required'
    });

  } catch (error) {
    console.error('Public Config API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
