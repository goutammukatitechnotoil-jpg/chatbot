import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../../src/middleware/auth';
import { ObjectId } from 'mongodb';
import multiTenantDB from '../../../../src/services/multiTenantDatabaseService';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function draftsHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const db = req.tenantDb;
    const { chatbotId } = req.query;

    if (req.method === 'GET') {
      // Get all drafts for this chatbot
      const drafts = await db.collection('appearance_drafts')
        .find({ chatbotId })
        .sort({ created_at: -1 })
        .toArray();

      res.status(200).json({ data: drafts });
    } else if (req.method === 'POST') {
      // Save a new draft
      const draftData = {
        ...req.body,
        chatbotId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await db.collection('appearance_drafts').insertOne(draftData);

      res.status(201).json({
        data: { ...draftData, _id: result.insertedId },
        message: 'Draft saved successfully'
      });
    } else if (req.method === 'DELETE') {
      // Delete a draft
      const { draftId } = req.body;
      if (!draftId) {
        return res.status(400).json({ error: 'Draft ID is required' });
      }

      await db.collection('appearance_drafts').deleteOne({ _id: new ObjectId(draftId), chatbotId });

      res.status(200).json({ message: 'Draft deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Drafts API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default compose(withErrorHandling, withTenant)(draftsHandler);