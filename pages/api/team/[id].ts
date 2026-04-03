import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { ObjectId } from 'mongodb';

async function teamMemberHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const db = req.tenantDb;

  if (!db) {
    return res.status(500).json({ error: 'Tenant database connection failed' });
  }

  if (!ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: 'Invalid team member ID' });
  }

  const memberId = new ObjectId(id as string);

  if (req.method === 'GET') {
    const data = await db.collection('team_members').findOne({ _id: memberId });
    if (!data) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.status(200).json({ 
      data: {
        id: data._id.toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        created_at: data.created_at?.toISOString?.() ?? data.created_at,
        updated_at: data.updated_at?.toISOString?.() ?? data.updated_at ?? data.created_at?.toISOString?.() ?? data.created_at,
        created_by: data.created_by ?? null,
        cloudinary: data.cloudinary || undefined,
      }
    });
  } else if (req.method === 'PUT') {
    const updateData: any = { ...req.body, updated_at: new Date() };
    if (updateData.password) {
      const crypto = require('crypto');
      updateData.password_hash = crypto.createHash('sha256').update(updateData.password).digest('hex');
      delete updateData.password;
    }
    const updateResult = await db.collection('team_members').updateOne(
      { _id: memberId },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const data = await db.collection('team_members').findOne({ _id: memberId });
    res.status(200).json({ data });
  } else if (req.method === 'DELETE') {
    await db.collection('team_members').deleteOne({ _id: new ObjectId(id as string) });
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(teamMemberHandler);
