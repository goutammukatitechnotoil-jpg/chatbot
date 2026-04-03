import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../src/middleware/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { multiTenantDB } from '../../../src/services/multiTenantDatabaseService';
import { AuthenticatedRequest } from '../../../src/middleware/auth';

function mapField(doc: any) {
  // Migrate old string array options to new SelectOption format
  let options = doc.options;
  if (options && Array.isArray(options) && options.length > 0 && typeof options[0] === 'string') {
    options = options.map((opt: string) => ({ label: opt, id: opt }));
  }

  return {
    id: doc._id?.toString() ?? doc.id,
    field_id: doc.field_id,
    form_id: doc.form_id,
    field_name: doc.field_name,
    field_type: doc.field_type,
    placeholder: doc.placeholder,
    placement: doc.placement,
    is_required: doc.is_required,
    order_index: doc.order_index,
    options: options,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { formId } = req.query;
  const user = req.user;
  console.log('Authenticated user:', user);
  

  // Determine tenant ID
  let tenantId: string;
  if (user?.isSuperAdmin) {
    const requestedTenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;
    if (!requestedTenantId) {
      return res.status(400).json({ error: 'Super admin must provide tenantId' });
    }
    tenantId = requestedTenantId;
  } else {
    if (!user?.tenantId) {
      return res.status(403).json({ error: 'User does not belong to a tenant' });
    }
    tenantId = user.tenantId;
  }

  // Get tenant database access
  const db = await multiTenantDB.connectToTenant(tenantId);

  if (!formId || typeof formId !== 'string') {
    return res.status(400).json({ error: 'Invalid form ID' });
  }

  if (req.method === 'GET') {
    const fields = await db.collection('form_fields').find({ form_id: formId }).sort({ order_index: 1 }).toArray();
    res.status(200).json({ data: fields.map(mapField) });
  } else if (req.method === 'POST') {
    const doc = {
      ...req.body,
      form_id: formId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await db.collection('form_fields').insertOne(doc);
    res.status(201).json({ data: mapField({ ...doc, _id: result.insertedId }) });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(handler);