import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import crypto from 'crypto';

async function initializeUserDefaults(db: any) {
  // Initialize with default user template if none exists
  const existingDefaults = await db.collection('user_defaults').findOne({ defaults_id: 'main_defaults' });
  
  if (!existingDefaults) {
    const defaultUserTemplate = {
      defaults_id: 'main_defaults',
      default_admin: {
        name: 'Admin User',
        email: 'mithunpj@fpt.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        created_by: 'system',
        permissions: {
          manage_users: true,
          manage_forms: true,
          manage_buttons: true,
          view_analytics: true,
          manage_settings: true,
          export_data: true
        }
      },
      user_roles: {
        admin: {
          name: 'Administrator',
          permissions: ['all']
        },
        manager: {
          name: 'Manager',
          permissions: ['manage_forms', 'manage_buttons', 'view_analytics']
        },
        viewer: {
          name: 'Viewer',
          permissions: ['view_analytics']
        }
      },
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_special_chars: false,
        expiry_days: 90
      },
      session_settings: {
        timeout_minutes: 60,
        max_concurrent_sessions: 3,
        remember_me_days: 30
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('user_defaults').insertOne(defaultUserTemplate);
    console.log('Initialized default user template in database');
    return defaultUserTemplate;
  }
  
  return existingDefaults;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    
    if (!db) {
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    if (req.method === 'GET') {
      // Always ensure we have user defaults in the database, initialize if needed
      const userDefaults = await initializeUserDefaults(db);
      
      res.status(200).json({ 
        data: {
          default_admin: userDefaults.default_admin,
          user_roles: userDefaults.user_roles,
          password_policy: userDefaults.password_policy,
          session_settings: userDefaults.session_settings
        }
      });
    } else if (req.method === 'POST' || req.method === 'PUT') {
      const defaultsData = {
        ...req.body,
        defaults_id: 'main_defaults',
        updated_at: new Date().toISOString(),
      };

      // Hash password if provided
      if (defaultsData.default_admin && defaultsData.default_admin.password) {
        defaultsData.default_admin.password_hash = crypto
          .createHash('sha256')
          .update(defaultsData.default_admin.password)
          .digest('hex');
        // Remove plain text password
        delete defaultsData.default_admin.password;
      }

      const result = await db.collection('user_defaults').updateOne(
        { defaults_id: 'main_defaults' },
        { 
          $set: defaultsData,
          $setOnInsert: { created_at: new Date().toISOString() }
        },
        { upsert: true }
      );

      const updatedDefaults = await db.collection('user_defaults').findOne({ defaults_id: 'main_defaults' });
      
      if (!updatedDefaults) {
        return res.status(500).json({ error: 'Failed to retrieve updated user defaults' });
      }
      
      res.status(200).json({ 
        data: {
          default_admin: updatedDefaults.default_admin,
          user_roles: updatedDefaults.user_roles,
          password_policy: updatedDefaults.password_policy,
          session_settings: updatedDefaults.session_settings
        },
        message: result.upsertedCount > 0 ? 'User defaults created' : 'User defaults updated'
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
