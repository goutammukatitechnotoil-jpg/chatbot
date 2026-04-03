import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

async function hashPassword(password: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

function mapTeamMember(doc: any) {
  return {
    id: doc._id?.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    permissions: doc.permissions,
    created_at: doc.created_at?.toISOString?.() ?? doc.created_at,
    updated_at: doc.updated_at?.toISOString?.() ?? doc.updated_at ?? doc.created_at?.toISOString?.() ?? doc.created_at,
    created_by: doc.created_by ?? null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      data: null, 
      error: 'Email and password are required' 
    });
  }

  try {
    const db = await connectToDatabase();
    
    if (!db) {
      return res.status(500).json({ 
        data: null, 
        error: 'Database connection failed' 
      });
    }

    // Check if any team members exist
    const existingTeam = await db.collection('team_members').findOne();
    
    if (!existingTeam) {
      console.log('No team members found, creating default admin...');
      // No team members exist, create default admin from user defaults
      try {
        // Get user defaults directly from database
        const userDefaults = await db.collection('user_defaults').findOne({ defaults_id: 'main_defaults' });
        const defaultAdmin = userDefaults?.default_admin;
        
        // Create the default admin user
        const adminUser = {
          name: defaultAdmin?.name || 'Admin User',
          email: defaultAdmin?.email || 'mithunpj@fpt.com',
          role: defaultAdmin?.role || 'admin',
          status: defaultAdmin?.status || 'active',
          permissions: defaultAdmin?.permissions || {
            manage_users: true,
            manage_forms: true,
            manage_buttons: true,
            view_analytics: true,
            manage_settings: true,
            export_data: true
          },
          password_hash: defaultAdmin?.password ? 
            await hashPassword(defaultAdmin.password) : 
            await hashPassword('admin123'),
          created_at: new Date(),
          created_by: 'system'
        };

        await db.collection('team_members').insertOne(adminUser);
        console.log('Default admin created:', adminUser.email);
        
        // Now validate against the newly created admin
        const passwordHash = await hashPassword(password);
        if (adminUser.email.toLowerCase() === email.toLowerCase() && adminUser.password_hash === passwordHash) {
          return res.status(200).json({ 
            data: mapTeamMember(adminUser),
            error: null
          });
        } else {
          return res.status(401).json({ 
            data: null, 
            error: 'Invalid credentials' 
          });
        }
        
      } catch (error) {
        console.error('Failed to create default admin from user defaults:', error);
        
        // Fallback to hardcoded admin if service fails
        const fallbackAdmin = {
          name: 'Admin User',
          email: 'mithunpj@fpt.com',
          role: 'admin',
          status: 'active',
          permissions: {
            manage_users: true,
            manage_forms: true,
            manage_buttons: true,
            view_analytics: true,
            manage_settings: true,
            export_data: true
          },
          password_hash: await hashPassword('admin123'),
          created_at: new Date(),
          created_by: 'system'
        };

        await db.collection('team_members').insertOne(fallbackAdmin);
        console.log('Fallback admin created:', fallbackAdmin.email);
        
        // Now validate against the fallback admin
        const passwordHash = await hashPassword(password);
        if (fallbackAdmin.email.toLowerCase() === email.toLowerCase() && fallbackAdmin.password_hash === passwordHash) {
          return res.status(200).json({ 
            data: mapTeamMember(fallbackAdmin),
            error: null
          });
        } else {
          return res.status(401).json({ 
            data: null, 
            error: 'Invalid credentials' 
          });
        }
      }
    } else {
      console.log('Team exists, validating credentials for:', email);
      // Team members exist, validate credentials
      const user = await db.collection('team_members').findOne({
        email: email.toLowerCase(),
        status: 'active'
      });

      if (!user) {
        console.log('User not found or inactive:', email);
        return res.status(401).json({ 
          data: null, 
          error: 'Invalid credentials' 
        });
      }

      // Hash the provided password and compare
      const passwordHash = await hashPassword(password);
      
      if (user.password_hash !== passwordHash) {
        console.log('Password mismatch for user:', email);
        console.log('Stored hash:', user.password_hash);
        console.log('Provided hash:', passwordHash);
        return res.status(401).json({ 
          data: null, 
          error: 'Invalid credentials' 
        });
      }

      console.log('Login successful for user:', email);
      return res.status(200).json({ 
        data: mapTeamMember(user),
        error: null
      });
    }

  } catch (error) {
    console.error('Team validation error:', error);
    res.status(500).json({ 
      data: null, 
      error: 'Internal server error' 
    });
  }
}
