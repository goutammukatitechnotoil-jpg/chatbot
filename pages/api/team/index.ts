import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { ObjectId } from 'mongodb';
import AuthService from '../../../src/services/authService';

interface TeamMember {
  id?: string;
  _id?: ObjectId;
  name: string;
  email: string;
  role: string;
  status: string;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapTeamMember(doc: any): TeamMember {
  return {
    id: doc._id?.toString() ?? doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    created_at: doc.created_at?.toISOString?.() ?? doc.created_at,
    updated_at: doc.updated_at?.toISOString?.() ?? doc.updated_at ?? doc.created_at?.toISOString?.() ?? doc.created_at,
    created_by: doc.created_by ?? null,
    ...(doc.cloudinary ? { cloudinary: doc.cloudinary } : {}),
  };
}

async function hashPassword(password: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function teamHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = req.tenantDb;

  if (req.method === 'GET') {
    const { search, role, status, page = 1, pageSize = 10 } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;
    
    const skip = (Number(page) - 1) * Number(pageSize);
    const cursor = db.collection('team_members')
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(pageSize));
    
    const data = await cursor.toArray();
    const total = await db.collection('team_members').countDocuments(query);
    const totalPages = Math.ceil(total / Number(pageSize));
    
    res.status(200).json({
      data: data.map(mapTeamMember),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages,
    });
  } else if (req.method === 'POST') {
    const { name, email, role, password, createdBy } = req.body;
    const passwordHash = await AuthService.hashPassword(password);

    // const passwordHash = await hashPassword(password);
    const now = new Date();
    
    const doc = {
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role,
      status: 'active',
      created_by: createdBy,
      created_at: now,
      updated_at: now,
    };
    
    const result = await db.collection('team_members').insertOne(doc);
    const data = mapTeamMember({ ...doc, _id: result.insertedId });
    
    res.status(201).json({ data, error: null });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(teamHandler);
