import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { multiTenantDB } from '../../../src/services/multiTenantDatabaseService';
import { v4 as uuidv4 } from 'uuid';
// Update the import path to the correct location of your auth middleware
import { AuthenticatedRequest, withAuth } from '../../../src/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();

    if (!db) {
      // Fallback when database is unavailable
      if (req.method === 'GET') {
        return res.status(200).json({
          data: null,
          warning: 'Database unavailable - cannot retrieve config key'
        });
      }
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    if (req.method === 'GET') {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({ error: 'Missing tenantId for config key retrieval' });
      }

      const tenantDb = await multiTenantDB.connectToTenant(tenantId);

      // Get the current config key
      const configKey = await tenantDb.collection('chatbot_config_keys').findOne({ key_id: 'main_key' });

      res.status(200).json({
        data: configKey ? {
          configKey: configKey.config_key,
          created_at: configKey.created_at,
          updated_at: configKey.updated_at
        } : null
      });

    } else if (req.method === 'POST') {
      // Generate a new config key
      const newConfigKey = `cbk_${uuidv4().replace(/-/g, '').substring(0, 24)}`;

      const keyData = {
        key_id: 'main_key',
        config_key: newConfigKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // No longer save config key in master database's chatbot_config_keys collection

      // Also update the tenant database and master tenant table
      const tenantId = req.user?.tenantId;
      let tenantDbUpdated = false;
      if (tenantId) {
        // Use multiTenantDB to connect to tenant database
        const tenantDb = await multiTenantDB.connectToTenant(tenantId);
        // Upsert config key in tenant database
        await tenantDb.collection('chatbot_config_keys').updateOne(
          { key_id: 'main_key' },
          {
            $set: {
              key_id: 'main_key',
              config_key: newConfigKey,
              updated_at: new Date().toISOString()
            },
            $setOnInsert: { created_at: keyData.created_at }
          },
          { upsert: true }
        );
        tenantDbUpdated = true;

        // Update master tenant table
        await db.collection('tenants').updateOne(
          { id: tenantId },
          {
            $set: {
              configKey: newConfigKey,
              updated_at: new Date().toISOString()
            }
          }
        );
      }

      res.status(200).json({
        data: {
          configKey: newConfigKey,
          created_at: keyData.created_at,
          updated_at: keyData.updated_at
        },
        message: 'Config key generated successfully',
        masterTenantUpdated: !!tenantId,
        tenantDbUpdated
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Config Key API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withAuth(handler);
