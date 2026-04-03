import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth, withErrorHandling, compose } from '../../src/middleware/auth';
import multiTenantDB from '../../src/services/multiTenantDatabaseService';

async function analyticsHandler(req: AuthenticatedRequest, res: NextApiResponse) {
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
  

  
  const { startDate, endDate } = req.query;

  if (req.method === 'GET') {
    const start = startDate as string;
    const end = endDate as string;
    
    try {
      // Build date filter for MongoDB queries
      let dateFilter = {};
      if (start && end) {
        dateFilter = {
          created_at: {
            $gte: start,
            $lte: end
          }
        };
      }

      // Get all leads in the date range for detailed analysis
      const leads = await collections.leads.find(dateFilter).toArray();
      
      // 1. Total Sessions - Count distinct session_ids
      const totalSessions = new Set(leads.map(lead => lead.session_id)).size;
      
      // 2. Total Unique Customers - Count unique identifiers from form data
      const uniqueCustomers = new Set();
      leads.forEach(lead => {
        if (lead.form_data) {
          // Use email as primary identifier, fallback to phone, then session_id
          const identifier = lead.form_data.email || 
                           lead.form_data.phone || 
                           lead.form_data.user_id || 
                           lead.session_id;
          if (identifier) uniqueCustomers.add(identifier);
        } else {
          // If no form data, use session_id as anonymous identifier
          uniqueCustomers.add(lead.session_id);
        }
      });
      const totalUniqueCustomers = uniqueCustomers.size;

      // 3. Average Session Time - Calculate from chat history timestamps
      let totalSessionDuration = 0;
      let sessionsWithValidDuration = 0;
      
      leads.forEach(lead => {
        if (lead.chat_history && lead.chat_history.length > 1) {
          const messages = lead.chat_history;
          const firstMessage = messages[0];
          const lastMessage = messages[messages.length - 1];
          
          if (firstMessage.timestamp && lastMessage.timestamp) {
            const startTime = new Date(firstMessage.timestamp);
            const endTime = new Date(lastMessage.timestamp);
            const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // in minutes
            
            if (duration > 0 && duration < 1440) { // Sanity check: less than 24 hours
              totalSessionDuration += duration;
              sessionsWithValidDuration++;
            }
          }
        }
      });
      
      const avgSessionTime = sessionsWithValidDuration > 0 
        ? Math.round(totalSessionDuration / sessionsWithValidDuration * 100) / 100 
        : 0;

      // 4. Total Messages by Users - Count user messages from chat history
      let totalUserMessages = 0;
      leads.forEach(lead => {
        if (lead.chat_history) {
          totalUserMessages += lead.chat_history.filter(msg => msg.sender === 'user').length;
        }
      });

      // 5. AI Responses - Count bot messages from chat history
      let totalAiResponses = 0;
      leads.forEach(lead => {
        if (lead.chat_history) {
          totalAiResponses += lead.chat_history.filter(msg => msg.sender === 'bot').length;
        }
      });

      // 6. Total Leads - Count ONLY leads with actual form submissions
      // A lead is only counted if they submitted a Custom Form or Adaptive Card
      const qualifiedLeads = leads.filter(lead => {
        if (!lead.form_data) return false;
        
        // Exclude chat-only sessions (these are just conversations, not leads)
        const isChatOnlySession = (lead.form_data.purpose === 'Chat Only' || 
                                  lead.form_data.purpose === 'Chat Session') && 
                                  lead.form_data.name === 'Anonymous User' &&
                                  !lead.form_data.email && 
                                  !lead.form_data.phone &&
                                  !lead.form_data.company &&
                                  !lead.form_data.job_title &&
                                  !lead.form_data.jobtitle &&
                                  !lead.form_data.jobTitle &&
                                  !lead.form_data['Job Title'] &&
                                  !lead.form_data.position &&
                                  !lead.form_data.details;
        
        if (isChatOnlySession) return false;
        
        // A qualified lead must have submitted actual form data
        // This means they filled out either a Custom Form or an Adaptive Card
        const hasRealFormData = lead.form_data.email || 
                               lead.form_data.phone || 
                               lead.form_data.company ||
                               (lead.form_data.name && lead.form_data.name !== 'Anonymous User') ||
                               lead.form_data.job_title ||
                               lead.form_data.jobtitle ||
                               lead.form_data.jobTitle ||
                               lead.form_data['Job Title'] ||
                               lead.form_data.position ||
                               lead.form_data.details ||
                               (lead.form_data.purpose && 
                                lead.form_data.purpose !== 'Chat Only' && 
                                lead.form_data.purpose !== 'Chat Session' &&
                                lead.form_data.purpose !== 'Adaptive Card Submission');
        
        return hasRealFormData;
      });
      
      const totalLeads = qualifiedLeads.length;

      // Conversion Funnel Metrics
      // Count leads that have form submissions (same as qualified leads)
      const leadsCaptured = totalLeads;

      const response = {
        totalSessions,
        uniqueCustomers: totalUniqueCustomers,
        avgSessionTime,
        totalUserMessages,
        totalAiResponses,
        totalLeads,
        funnel: {
          sessions: totalSessions,
          uniqueCustomers: totalUniqueCustomers,
          userMessages: totalUserMessages,
          aiResponses: totalAiResponses,
          leadsCaptured
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withAuth)(analyticsHandler);
