import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { ObjectId } from 'mongodb';

async function buttonByIdHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const db = req.tenantDb;

  if (!db) {
    return res.status(500).json({ error: 'Tenant database connection failed' });
  }

  if (req.method === 'GET') {
    const button = await db.collection('chatbot_buttons').findOne({ _id: new ObjectId(id as string) });
    if (!button) {
      return res.status(404).json({ error: 'Button not found' });
    }
    res.status(200).json({ 
      data: {
        id: button._id.toString(),
        label: button.label,
        type: button.type,
        description: button.description,
        location: button.location,
      }
    });
  } else if (req.method === 'PUT') {
    const { label, description } = req.body;
    
    const updateData: any = {};
    if (label !== undefined) updateData.label = label;
    if (description !== undefined) updateData.description = description;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const result = await db.collection('chatbot_buttons').updateOne(
      { _id: new ObjectId(id as string) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Button not found' });
    }
    
    res.status(200).json({ success: true, message: 'Button updated successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(buttonByIdHandler);
