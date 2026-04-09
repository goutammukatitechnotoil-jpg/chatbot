import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';

// Increase body size limit to support base64 encoded images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function initializeConfigDefaults(db: any, configId: string) {
  // Initialize with default config if none exists
  const existingConfig = await db.collection('chatbot_config').findOne({ config_id: configId });
  
  if (!existingConfig) {
    const defaultConfig = {
      config_id: configId,
      colorTheme: '#f37021',
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('chatbot_config').insertOne(defaultConfig);
    console.log(`Initialized default chatbot config in database for ${configId}`);
    return defaultConfig;
  }
  
  return existingConfig;
}

async function configHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    console.log('Config API called:', req.method);
    const db = req.tenantDb;
    
    if (!db) {
      console.error('Tenant database connection failed');
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }
    
    console.log('Tenant database connected successfully');

    // Determine config mode: 'live' (default) or 'test'
    const mode = (req.query.mode as string) || 'live';
    const configId = mode === 'test' ? 'test_config' : 'main_config';

    if (req.method === 'GET') {
      // Always ensure we have config in the database, initialize if needed
      const config = await initializeConfigDefaults(db, configId);
      
      res.status(200).json({ 
        data: {
          colorTheme: config.colorTheme,
          headerColorTheme: config.headerColorTheme,
          logoUrl: config.logoUrl,
          iconType: config.iconType,
          chatbotName: config.chatbotName,
          triggerMessage: config.triggerMessage,
          botGreetingMessage: config.botGreetingMessage,
          popupTitle: config.popupTitle,
          popupDescription: config.popupDescription,
          defaultCountryName: config.defaultCountryName,
          quickQuestionsTitle: config.quickQuestionsTitle,
          locale: config.locale,
          autoDetectLocale: config.autoDetectLocale,
          autoTriggerEnabled: config.autoTriggerEnabled,
          autoTriggerCount: config.autoTriggerCount,
          autoTriggerButtonId: config.autoTriggerButtonId,
          tokenEndpoint: config.tokenEndpoint,
          sourcesWidth: config.sourcesWidth
        }
      });
    } else if (req.method === 'POST' || req.method === 'PUT') {
      // Update or create chatbot configuration
      const configData = {
        ...req.body,
        config_id: configId,
        updated_at: new Date().toISOString(),
      };

      // Upsert the configuration (update if exists, create if not)
      const result = await db.collection('chatbot_config').updateOne(
        { config_id: configId },
        { 
          $set: configData,
          $setOnInsert: { created_at: new Date().toISOString() }
        },
        { upsert: true }
      );

      const updatedConfig = await db.collection('chatbot_config').findOne({ config_id: configId });
      
      if (!updatedConfig) {
        return res.status(500).json({ error: 'Failed to retrieve updated config' });
      }
      
      res.status(200).json({ 
        data: {
          colorTheme: updatedConfig.colorTheme,
          headerColorTheme: updatedConfig.headerColorTheme,
          logoUrl: updatedConfig.logoUrl,
          iconType: updatedConfig.iconType,
          defaultCountryName: updatedConfig.defaultCountryName,
          chatbotName: updatedConfig.chatbotName,
          triggerMessage: updatedConfig.triggerMessage,
          botGreetingMessage: updatedConfig.botGreetingMessage,
          popupTitle: updatedConfig.popupTitle,
          popupDescription: updatedConfig.popupDescription,
          quickQuestionsTitle: updatedConfig.quickQuestionsTitle,
          locale: updatedConfig.locale,
          autoDetectLocale: updatedConfig.autoDetectLocale,
          autoTriggerEnabled: updatedConfig.autoTriggerEnabled,
          autoTriggerCount: updatedConfig.autoTriggerCount,
          autoTriggerButtonId: updatedConfig.autoTriggerButtonId,
          tokenEndpoint: updatedConfig.tokenEndpoint,
          sourcesWidth: updatedConfig.sourcesWidth
        },
        message: result.upsertedCount > 0 ? 'Configuration created' : 'Configuration updated'
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Config API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default compose(withErrorHandling, withTenant)(configHandler);
