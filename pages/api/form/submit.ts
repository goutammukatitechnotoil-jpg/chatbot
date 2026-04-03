import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling, compose } from '../../../src/middleware/auth';
import multiTenantDB from '../../../src/services/multiTenantDatabaseService';

// Extended request for public tenant endpoints
interface PublicTenantRequest extends NextApiRequest {
  tenantDb?: any;
  tenant?: any;
}

async function formSubmitHandler(req: PublicTenantRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { tenantId, form_id, session_id, custom_data } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Connect to the specific tenant database
    const db = await multiTenantDB.connectToTenant(tenantId);
    if (!db) {
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }

    // Create form submission record
    const submissionData = {
      form_id,
      session_id,
      custom_data,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await db.collection('form_submissions').insertOne(submissionData);
    
    res.status(201).json({ 
      data: {
        id: result.insertedId.toString(),
        ...submissionData
      }
    });

  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
}

export default compose(withErrorHandling)(formSubmitHandler);
