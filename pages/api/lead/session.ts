import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling, compose } from '../../../src/middleware/auth';
import multiTenantDB from '../../../src/services/multiTenantDatabaseService';
import { SessionInfoService } from '../../../src/services/sessionInfoService';

// Extended request for public tenant endpoints
interface PublicTenantRequest extends NextApiRequest {
  tenantDb?: any;
  tenant?: any;
}

async function leadSessionHandler(req: PublicTenantRequest, res: NextApiResponse) {
  const { tenantId } = req.query;
  
  console.log(`[Session API] ${req.method} request for tenant: ${tenantId}`);
  
  if (!tenantId) {
    console.error('[Session API] ❌ Missing tenant ID');
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    console.log(`[Session API] Connecting to tenant database: chatbot_${tenantId}`);
    const db = await multiTenantDB.connectToTenant(tenantId as string);
    if (!db) {
      console.error(`[Session API] ❌ Failed to connect to tenant database: chatbot_${tenantId}`);
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }
    console.log(`[Session API] ✅ Connected to tenant database successfully`);

  if (req.method === 'POST') {
    try {
      const { session_id, message, sender, sources, attachments } = req.body;

      console.log(`[Session API] POST request - Session: ${session_id}, Message: ${message?.substring(0, 50)}, Sender: ${sender}`);

      if (!session_id) {
        console.error('[Session API] ❌ Missing session_id in request body');
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const now = new Date().toISOString();
      
      // Check if a lead already exists for this session
      const existingLead = await db.collection('leads').findOne({ session_id });
      console.log(`[Session API] Existing lead found: ${!!existingLead}`);

      if (existingLead) {
        // Update existing lead with new message
        const updatedChatHistory = [...(existingLead.chat_history || [])];
        
        if (message && sender) {
          const messageObj: any = {
            id: `${sender}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender,
            message,
            timestamp: now
          };
          
          // Add sources if provided
          if (sources && sources.length > 0) {
            messageObj.sources = sources;
          }
          
          // Add attachments if provided
          if (attachments && attachments.length > 0) {
            messageObj.attachments = attachments;
          }
          
          updatedChatHistory.push(messageObj);
        }

        const updateData = {
          chat_history: updatedChatHistory,
          last_message: message || existingLead.last_message,
          updated_at: now
        };

        await db.collection('leads').updateOne(
          { session_id },
          { $set: updateData }
        );

        console.log(`[Session API] ✅ Updated existing lead for session: ${session_id}`);

        res.status(200).json({ 
          success: true, 
          action: 'updated',
          session_id 
        });
      } else {
        // Create new lead entry for this session
        console.log(`[Session API] Creating new lead for session: ${session_id}`);
        
        const initialChatHistory: any[] = [];
        if (message && sender) {
          const messageObj: any = {
            id: `${sender}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender,
            message,
            timestamp: now
          };
          
          // Add sources if provided
          if (sources && sources.length > 0) {
            messageObj.sources = sources;
          }
          
          // Add attachments if provided
          if (attachments && attachments.length > 0) {
            messageObj.attachments = attachments;
          }
          
          initialChatHistory.push(messageObj);
        }

        // Capture session information from client and server
        const clientSessionInfo = req.body.session_info || {};
        const sessionInfo = await SessionInfoService.createSessionInfo(req, clientSessionInfo);

        const leadData = {
          session_id,
          date: now.split('T')[0], // YYYY-MM-DD format
          chat_history: initialChatHistory,
          form_data: {
            name: 'Anonymous User',
            purpose: 'Chat Only'
          },
          last_message: message || '',
          session_info: sessionInfo,
          created_at: now,
          updated_at: now
        };

        console.log(`[Session API] Inserting new lead with data:`, {
          session_id: leadData.session_id,
          date: leadData.date,
          chat_history_count: leadData.chat_history.length,
          has_session_info: !!leadData.session_info
        });

        const insertResult = await db.collection('leads').insertOne(leadData);
        
        console.log(`[Session API] ✅ Created new lead with ID: ${insertResult.insertedId}`);

        res.status(201).json({ 
          success: true, 
          action: 'created',
          session_id,
          lead_id: insertResult.insertedId
        });
      }
    } catch (error) {
      console.error('[Session API] ❌ Session management error:', error);
      res.status(500).json({ error: 'Failed to manage session', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { session_id, form_data } = req.body;

      if (!session_id) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const now = new Date().toISOString();
      
      // Get existing lead to update session_info with form data country if needed
      const existingLead = await db.collection('leads').findOne({ session_id });
      
      let updatedSessionInfo = existingLead?.session_info;
      
      // If form data contains country and it's different from session_info country, update it
      if (form_data?.country && existingLead?.session_info) {
        updatedSessionInfo = {
          ...existingLead.session_info,
          country: form_data.country // Prioritize form data country over IP geolocation
        };
      }

      // Update the lead with form data and potentially updated session info
      const updateData: any = { 
        form_data: { ...form_data },
        updated_at: now
      };
      
      if (updatedSessionInfo) {
        updateData.session_info = updatedSessionInfo;
      }

      const result = await db.collection('leads').updateOne(
        { session_id },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.status(200).json({ 
        success: true, 
        action: 'form_data_updated',
        session_id 
      });
    } catch (error) {
      console.error('Form data update error:', error);
      res.status(500).json({ error: 'Failed to update form data' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}

export default compose(withErrorHandling)(leadSessionHandler);
