import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { ObjectId } from 'mongodb';

export interface WebhookFieldMapping {
  leadField: string;
  webhookField: string;
  required: boolean;
}

export interface WebhookConfig {
  _id?: string;
  webhook_id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  fieldMappings: WebhookFieldMapping[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

async function initializeWebhookDefaults(db: any) {
  // Check if any webhook configs exist
  const existingWebhooks = await db.collection('webhook_configs').findOne();
  
  if (!existingWebhooks) {
    console.log('No webhook configurations found - ready for user setup');
  }
  
  return true;
}

async function webhookHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const db = req.tenantDb;
    
    if (!db) {
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }

    await initializeWebhookDefaults(db);

    if (req.method === 'GET') {
      // Get all webhook configurations
      const webhooks = await db.collection('webhook_configs').find({}).toArray();
      
      res.status(200).json({ 
        data: webhooks.map((webhook: any) => ({
          _id: webhook._id,
          webhook_id: webhook.webhook_id,
          name: webhook.name,
          url: webhook.url,
          method: webhook.method,
          headers: webhook.headers,
          fieldMappings: webhook.fieldMappings,
          isActive: webhook.isActive,
          created_at: webhook.created_at,
          updated_at: webhook.updated_at
        }))
      });

    } else if (req.method === 'POST') {
      // Create new webhook configuration
      const { name, url, method, headers, fieldMappings, isActive } = req.body;

      if (!name || !url) {
        return res.status(400).json({ error: 'Name and URL are required' });
      }

      const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const webhookConfig = {
        webhook_id: webhookId,
        name,
        url,
        method: method || 'POST',
        headers: headers || {
          'Content-Type': 'application/json'
        },
        fieldMappings: fieldMappings || [],
        isActive: isActive !== undefined ? isActive : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await db.collection('webhook_configs').insertOne(webhookConfig);
      
      res.status(201).json({ 
        data: {
          _id: result.insertedId,
          ...webhookConfig
        },
        message: 'Webhook configuration created successfully'
      });

    } else if (req.method === 'PUT') {
      // Update webhook configuration
      const { _id, name, url, method, headers, fieldMappings, isActive } = req.body;

      if (!_id) {
        return res.status(400).json({ error: 'Webhook ID is required for updates' });
      }

      const updateData = {
        name,
        url,
        method: method || 'POST',
        headers: headers || {},
        fieldMappings: fieldMappings || [],
        isActive: isActive !== undefined ? isActive : true,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if ((updateData as any)[key] === undefined) {
          delete (updateData as any)[key];
        }
      });

      const result = await db.collection('webhook_configs').updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Webhook configuration not found' });
      }

      const updatedWebhook = await db.collection('webhook_configs').findOne(
        { _id: new ObjectId(_id) }
      );

      res.status(200).json({ 
        data: updatedWebhook,
        message: 'Webhook configuration updated successfully'
      });

    } else if (req.method === 'DELETE') {
      // Delete webhook configuration
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Webhook ID is required' });
      }

      const result = await db.collection('webhook_configs').deleteOne(
        { webhook_id: id }
      );

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Webhook configuration not found' });
      }

      res.status(200).json({ 
        message: 'Webhook configuration deleted successfully'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Webhook Config API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default compose(withErrorHandling, withTenant)(webhookHandler);
