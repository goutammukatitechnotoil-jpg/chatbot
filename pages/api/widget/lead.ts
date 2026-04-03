
import type { NextApiRequest, NextApiResponse } from 'next';
import { WebhookService } from '../../../src/services/webhookService';
// --- Lead Submission Handler ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { configKey, lead_data } = req.body;
    if (!configKey) {
      return res.status(400).json({ error: 'Config key is required' });
    }
    if (!lead_data || typeof lead_data !== 'object') {
      return res.status(400).json({ error: 'lead_data is required and must be an object' });
    }

    // Resolve tenantId from configKey
    const { connectToDatabase } = await import('../../../lib/mongodb');
    const masterDb = await connectToDatabase();
    if (!masterDb) {
      return res.status(500).json({ error: 'Failed to connect to master database' });
    }
    const tenant = await masterDb.collection('tenants').findOne({ configKey });
    if (!tenant) {
      return res.status(404).json({ error: 'Invalid configKey' });
    }
    const tenantId = tenant.id;

    // Connect to the specific tenant database
    const multiTenantDB = (await import('../../../src/services/multiTenantDatabaseService')).multiTenantDB;
    const db = await multiTenantDB.connectToTenant(tenantId);
    if (!db) {
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }

    // Optionally, extract IP and country if needed for server-side logging
    const ipAddress = extractIPAddress(req);
    const country = await getCountryFromIP(ipAddress);

    lead_data.session_info.ip_address = ipAddress;
    lead_data.session_info.country = country;
    const now = new Date().toISOString();

    // Check if a lead with the same session_id exists
    const existingLead = await db.collection('leads').findOne({ tenant_id: tenantId, session_id: lead_data.session_id });
    let leadPayload;
    if (existingLead) {
      // Update form_data and updated_at
      await db.collection('leads').updateOne(
        { tenant_id: tenantId, session_id: lead_data.session_id },
        {
          $set: {
            form_data: lead_data.form_data,
            updated_at: now,
            session_info: lead_data.session_info
          }
        }
      );
      const updatedLead = await db.collection('leads').findOne({ tenant_id: tenantId, session_id: lead_data.session_id });
      if (!updatedLead) {
        res.status(500).json({ error: 'Failed to retrieve updated lead' });
        return;
      }
      leadPayload = { id: updatedLead._id.toString(), ...updatedLead };
      res.status(200).json({ data: leadPayload });
    } else {
      // Create new lead record
      lead_data.updated_at = now;
      lead_data.created_at = now;
      const leadDoc = { ...lead_data };
      const result = await db.collection('leads').insertOne(leadDoc);
      leadPayload = { id: result.insertedId.toString(), ...leadDoc };
      res.status(201).json({ data: leadPayload });
    }

    // Send lead details to all webhooks configured for the tenant
    try {
      // Custom field mapping logic before sending to webhooks
      
        WebhookService.sendToWebhooksServer(leadPayload, db).catch(error => {
          console.error('Webhook delivery error on lead update (non-blocking):', error);
        });
      
      
    } catch (err) {
      console.error('Error sending lead to webhooks:', err);
    }
  } catch (error) {
    console.error('Lead submission error:', error);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
}

// Helper: Extract IP address from request
function extractIPAddress(req: any): string {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] ||
      req.headers['x-client-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      '127.0.0.1';
  } catch (error) {
    console.error('Error extracting IP address:', error);
    return '127.0.0.1';
  }
}

// Helper: Get country from IP address using a free geolocation service
async function getCountryFromIP(ip: string): Promise<string> {
  try {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'Local';
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FPT-Chatbot/1.0'
        }
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const country = await response.text();
        return country.trim() || 'Unknown';
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error fetching country data:', fetchError);
    }
  } catch (error) {
    console.error('Error getting country from IP:', error);
  }
  return 'Unknown';
}