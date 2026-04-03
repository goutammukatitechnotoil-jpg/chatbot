import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

async function hashPassword(password: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await connectToDatabase();
    
    if (!db) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Reset admin password to 'admin123'
    const newPassword = 'admin123';
    const passwordHash = await hashPassword(newPassword);
    
    console.log('🔧 Resetting admin password...');
    console.log('🔧 New password:', newPassword);
    console.log('🔧 New password hash:', passwordHash);
    
    const result = await db.collection('team_members').updateOne(
      { email: 'mithunpj@fpt.com' },
      { 
        $set: { 
          password_hash: passwordHash,
          updated_at: new Date()
        } 
      }
    );
    
    console.log('🔧 Update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    // Verify the update
    const user = await db.collection('team_members').findOne({ email: 'mithunpj@fpt.com' });
    console.log('🔧 Updated user password hash:', user?.password_hash);
    
    return res.status(200).json({
      message: 'Admin password reset successfully',
      email: 'mithunpj@fpt.com',
      newPasswordHash: passwordHash,
      matched: result.matchedCount,
      modified: result.modifiedCount
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
