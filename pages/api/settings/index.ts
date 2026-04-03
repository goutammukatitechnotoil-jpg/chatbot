import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';

async function initializeSettingsDefaults(db: any) {
  // Initialize with default settings if none exist
  const existingSettings = await db.collection('system_settings').findOne({ settings_id: 'main_settings' });

  if (!existingSettings) {
    const defaultSettings = {
      settings_id: 'main_settings',
      direct_line: {
        base_url: 'https://directline.botframework.com/v3/directline',
        token_endpoint: 'https://directline.botframework.com/v3/directline/tokens/generate',
        locale: 'en-US',
        timeout: 30000
      },
      api_settings: {
        default_headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000,
        retry_attempts: 3
      },
      file_upload: {
        max_size: 10485760, // 10MB
        allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        storage_path: '/uploads'
      },
      cloudinary: {
        url: '',
        cloud_name: '',
        api_key: '',
        api_secret: ''
      },
      analytics: {
        date_format: {
          locale: 'en-US',
          options: {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }
        },
        default_presets: ['today', 'yesterday', 'last7days', 'last30days']
      },
      security: {
        password_min_length: 8,
        session_timeout: 3600000, // 1 hour
        max_login_attempts: 5
      },
      chatbot_visibility: {
        mode: 'always_show',
        url_list: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('system_settings').insertOne(defaultSettings);
    console.log('Initialized default system settings in database');
    return defaultSettings;
  }

  return existingSettings;
}

async function settingsHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const db = req.tenantDb;

    if (!db) {
      console.error('Tenant database connection failed - using fallback defaults');
      // Return default settings when database is unavailable
      const fallbackSettings = {
        direct_line: {
          base_url: 'https://directline.botframework.com/v3/directline',
          token_endpoint: 'https://directline.botframework.com/v3/directline/tokens/generate',
          locale: 'en-US',
          timeout: 30000
        },
        api_settings: {
          default_headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000,
          retry_attempts: 3
        },
        file_upload: {
          max_size: 10485760, // 10MB
          allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
          storage_path: '/uploads'
        },
        cloudinary: {
          url: '',
          cloud_name: '',
          api_key: '',
          api_secret: ''
        },
        analytics: {
          date_format: {
            locale: 'en-US',
            options: {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }
          },
          default_presets: ['today', 'yesterday', 'last7days', 'last30days']
        },
        security: {
          password_min_length: 8,
          session_timeout: 3600000, // 1 hour
          max_login_attempts: 5
        },
        chatbot_visibility: {
          mode: 'always_show',
          url_list: []
        }
      };
      return res.status(200).json({
        data: fallbackSettings,
        warning: 'Database unavailable - using default settings'
      });
    }

    if (req.method === 'GET') {
      // Always ensure we have settings in the database, initialize if needed
      const settings = await initializeSettingsDefaults(db);

      res.status(200).json({
        data: {
          direct_line: settings.direct_line,
          api_settings: settings.api_settings,
          file_upload: settings.file_upload,
          cloudinary: settings.cloudinary || { url: '', cloud_name: '', api_key: '', api_secret: '' },
          analytics: settings.analytics,
          security: settings.security,
          chatbot_visibility: settings.chatbot_visibility || { mode: 'always_show', url_list: [] }

        }
      });
    } else if (req.method === 'POST' || req.method === 'PUT') {
      const settingsData = {
        ...req.body,
        settings_id: 'main_settings',
        updated_at: new Date().toISOString(),
      };

      const result = await db.collection('system_settings').updateOne(
        { settings_id: 'main_settings' },
        {
          $set: settingsData,
          $setOnInsert: { created_at: new Date().toISOString() }
        },
        { upsert: true }
      );

      const updatedSettings = await db.collection('system_settings').findOne({ settings_id: 'main_settings' });

      if (!updatedSettings) {
        return res.status(500).json({ error: 'Failed to retrieve updated settings' });
      }

      res.status(200).json({
        data: {
          direct_line: updatedSettings.direct_line,
          api_settings: updatedSettings.api_settings,
          file_upload: updatedSettings.file_upload,
          cloudinary: updatedSettings.cloudinary || { url: '', cloud_name: '', api_key: '', api_secret: '' },
          analytics: updatedSettings.analytics,
          security: updatedSettings.security,
          chatbot_visibility: updatedSettings.chatbot_visibility || { mode: 'always_show', url_list: [] }

        },
        message: result.upsertedCount > 0 ? 'Settings created' : 'Settings updated'
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default compose(withErrorHandling, withTenant)(settingsHandler);
