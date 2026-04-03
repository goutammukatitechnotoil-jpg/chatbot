import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await connectToDatabase();
    
    if (!db) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const users = await db.collection('team_members').find({}).toArray();
    
    return res.status(200).json({
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password_hash: user.password_hash,
        created_at: user.created_at,
        created_by: user.created_by
      }))
    });

  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
