import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Public settings endpoint that doesn't require authentication
 * Used by the chatbot client to get basic system configuration
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return default public settings that don't require authentication
    // These are safe to expose publicly and are needed for chatbot functionality
    const publicSettings = {
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
      }
      ,
      chatbot_visibility: {
        mode: 'always_show',
        url_list: []
      }
    };

    res.status(200).json({ 
      data: publicSettings,
      note: 'Public system settings - no authentication required'
    });
  } catch (error) {
    console.error('Public settings API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
