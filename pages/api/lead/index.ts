import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { WebhookService } from '../../../src/services/webhookService';
import { AuthenticatedRequest, withAuth, withErrorHandling, compose } from '../../../src/middleware/auth';
import multiTenantDB from '../../../src/services/multiTenantDatabaseService';

function mapLead(doc: any) {
  return {
    id: doc._id?.toString() ?? doc.id,
    session_id: doc.session_id,
    date: doc.date,
    chat_history: doc.chat_history ?? [],
    form_data: doc.form_data ?? {},
    last_message: doc.last_message ?? '',
    session_info: doc.session_info ?? null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

async function leadHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Add cache-prevention headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  const user = req.user!;
  
  // Determine which tenant to query
  let tenantId: string;
  
  if (user.isSuperAdmin) {
    // Super admin must provide tenant ID
    const requestedTenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;
    if (!requestedTenantId) {
      return res.status(400).json({ error: 'Super admin must provide tenantId' });
    }
    tenantId = requestedTenantId;
  } else {
    // Regular users use their own tenant
    if (!user.tenantId) {
      return res.status(403).json({ error: 'User does not belong to a tenant' });
    }
    tenantId = user.tenantId;
  }
  
  // Get tenant database access
  const collections = await multiTenantDB.getTenantCollections(tenantId);

  if (req.method === 'GET') {
    const { search, startDate, endDate, sessionId } = req.query;
    
    if (sessionId) {
      const lead = await collections.leads.findOne({ session_id: sessionId });
      return res.status(200).json({ data: lead ? mapLead(lead) : null });
    }
    
    let query: any = {};
    if (search) {
      const regex = new RegExp(search as string, 'i');
      query.$or = [
        { session_id: regex },
        { 'form_data.name': regex },
        { 'form_data.email': regex },
        { 'form_data.company': regex },
      ];
    }
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const allLeads = await collections.leads.find(query).sort({ created_at: -1 }).toArray();
    
    // Show all leads - including chat-only sessions
    // Filter out only truly empty entries (no chat history, no form data, no session info)
    const qualifiedLeads = allLeads.filter(lead => {
      // Include if has chat history
      //if (lead.chat_history && lead.chat_history.length > 0) {
      //  return true;
      //}

      // Include if has session info (user opened chatbot/visited page)
      if (lead.session_info) {
        return true;
      }
      
      // Include if has meaningful form data
      if (lead.form_data) {
        const hasMeaningfulData = lead.form_data.email || 
                                 lead.form_data.phone || 
                                 lead.form_data.company ||
                                 (lead.form_data.name && lead.form_data.name !== 'Anonymous User') ||
                                 (lead.form_data.purpose && 
                                  lead.form_data.purpose !== 'Chat Only' && 
                                  lead.form_data.purpose !== 'Adaptive Card Submission');
        if (hasMeaningfulData) {
          return true;
        }
      }
      
      // Exclude only entries with no chat history, no session info, and no meaningful form data
      return false;
    });
    
    res.status(200).json({ data: qualifiedLeads.map(mapLead) });
  } else if (req.method === 'POST') {
    const leadData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await collections.leads.insertOne(leadData);
    const createdLead = { ...leadData, _id: result.insertedId };
    
    // Send to webhooks asynchronously (don't block the response)
    const tenantDb = await multiTenantDB.connectToTenant(tenantId);
    console.log('Sending database to webhooks:', tenantDb);
    console.log('Sending lead to webhooks:', createdLead);
    WebhookService.sendToWebhooksServer(createdLead, tenantDb).catch(error => {
      console.error('Webhook delivery error (non-blocking):', error);
    });
    
    res.status(201).json({ data: mapLead(createdLead) });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withAuth)(leadHandler);
