import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth, withErrorHandling, compose } from '../../../src/middleware/auth';
import multiTenantDB from '../../../src/services/multiTenantDatabaseService';

async function exportHandler(req: AuthenticatedRequest, res: NextApiResponse) {
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
    const allLeads = await collections.leads.find({}).toArray();
    
    // Export all leads including chat-only sessions
    // Filter out only truly empty entries (no chat history and no form data)
    const qualifiedLeads = allLeads.filter(lead => {
      // Include if has chat history
      if (lead.chat_history && lead.chat_history.length > 0) {
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
      
      // Exclude only entries with no chat history and no meaningful form data
      return false;
    });
    
    const leads = qualifiedLeads;
    const headers = ['Date', 'Session ID', 'Name', 'Email', 'Company', 'Country', 'Purpose', 'Job Title', 'Phone', 'Last Message', 'Conversation History'];
    
    const rows = leads.map(lead => {
      // Format conversation history into a readable string
      let conversationHistory = '';
      if (lead.chat_history && Array.isArray(lead.chat_history) && lead.chat_history.length > 0) {
        const conversationLines = lead.chat_history.map(msg => {
          const sender = msg.sender === 'user' ? 'User' : 'AI';
          const message = (msg.message || '').replace(/"/g, '""'); // Escape quotes for CSV
          let line = `${sender}: ${message}`;
          
          // Add sources if they exist
          if (msg.sources && msg.sources.length > 0) {
            const sources = msg.sources.map(source => 
              source.url ? `${source.title} (${source.url})` : source.title
            ).join(', ');
            line += ` [Sources: ${sources}]`;
          }
          
          return line;
        });
        conversationHistory = conversationLines.join(' | '); // Use | as separator for readability
      } else {
        conversationHistory = 'No conversation recorded';
      }

      return [
        lead.date,
        lead.session_id,
        lead.form_data?.name || '',
        lead.form_data?.email || '',
        lead.form_data?.company || '',
        lead.form_data?.country || '',
        lead.form_data?.purpose || '',
        lead.form_data?.job_title || lead.form_data?.jobtitle || lead.form_data?.jobTitle || lead.form_data?.['Job Title'] || lead.form_data?.position || '', // Handle all job title formats
        lead.form_data?.phone || '',
        lead.last_message || '',
        conversationHistory,
      ];
    });
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.status(200).send(csv);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
