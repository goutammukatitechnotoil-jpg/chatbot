import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { ObjectId } from 'mongodb';

function mapButton(doc: any) {
  return {
    id: doc._id?.toString() ?? doc.id,
    label: doc.label,
    type: doc.type,
    description: doc.description,
    location: doc.location,
  };
}

async function buttonHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = req.tenantDb;

  if (!db) {
    return res.status(500).json({ error: 'Tenant database connection failed' });
  }

  if (req.method === 'GET') {
    const { type } = req.query;
    const query = type ? { type } : {};
    const buttons = await db.collection('chatbot_buttons').find(query).toArray();
    res.status(200).json({ data: buttons.map(mapButton) });
  } else if (req.method === 'POST') {
    const doc = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await db.collection('chatbot_buttons').insertOne(doc);
    res.status(201).json({ data: mapButton({ ...doc, _id: result.insertedId }) });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(buttonHandler);
