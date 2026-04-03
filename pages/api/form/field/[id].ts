import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { AuthenticatedRequest, withAuth, withErrorHandling, compose } from '../../../../src/middleware/auth';
import multiTenantDB from '../../../../src/services/multiTenantDatabaseService';

function mapField(doc: any) {
  // Migrate old string array options to new SelectOption format
  let options = doc.options;
  if (options && Array.isArray(options) && options.length > 0 && typeof options[0] === 'string') {
    options = options.map((opt: string) => ({ label: opt, id: opt }));
  }

  return {
    id: doc._id?.toString() ?? doc.id,
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

async function fieldHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user!;
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid field ID' });
  }

  // Determine tenant ID
  let tenantId: string;
  if (user.isSuperAdmin) {
    const requestedTenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;
    if (!requestedTenantId) {
      return res.status(400).json({ error: 'Super admin must provide tenantId' });
    }
    tenantId = requestedTenantId;
  } else {
    if (!user.tenantId) {
      return res.status(403).json({ error: 'User does not belong to a tenant' });
    }
    tenantId = user.tenantId;
  }

  // Get tenant database access
  const db = await multiTenantDB.connectToTenant(tenantId);

  console.log(`Handling ${req.method} request for field ID: ${id} for tenant ID: ${tenantId}`);
  if (req.method === 'POST') {
    try {
      const body = req.body || {};

      const { form_id, field_name, field_type } = body;

      if (!form_id || !field_name || !field_type) {
        return res.status(400).json({ error: 'Missing required fields: form_id, field_name, field_type' });
      }

      // Determine order_index if not provided
      let order_index = typeof body.order_index === 'number' ? body.order_index : undefined;
      if (order_index === undefined) {
        const count = await db.collection('form_fields').countDocuments({ form_id });
        order_index = count;
      }

      const newField = {
        form_id,
        field_name,
        field_type,
        placeholder: body.placeholder || '',
        placement: body.placement || 'full',
        is_required: !!body.is_required,
        order_index,
        options: Array.isArray(body.options) ? body.options : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      const insertResult = await db.collection('form_fields').insertOne(newField);
      const created = await db.collection('form_fields').findOne({ _id: insertResult.insertedId });

      return res.status(201).json({ data: mapField(created) });
    } catch (error) {
      console.error('Error creating field:', error);
      return res.status(500).json({ error: 'Failed to create field' });
    }
  }else if (req.method === 'GET') {
    try {
      const field = await db.collection('form_fields').findOne({ _id: new ObjectId(id) });
      if (!field) {
        return res.status(404).json({ error: 'Field not found' });
      }
      console.log('Fetched field:', field);
      return res.status(200).json({ data: mapField(field),field: field });
    } catch (error) {
      console.error('Error fetching field:', error);
      return res.status(500).json({ error: 'Failed to fetch field' });
    }
    
  } else if (req.method === 'PUT') {
    try {
      const updateDoc = {
        ...req.body,
        updated_at: new Date().toISOString(),
      };
      
      // Remove fields that shouldn't be updated
      delete updateDoc.id;
      delete updateDoc._id;
      delete updateDoc.created_at;
      
      const result = await db.collection('form_fields').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        return res.status(404).json({ error: 'Field not found' });
      }
      
      return res.status(200).json({ data: mapField(result) });
    } catch (error) {
      console.error('Error updating field:', error);
      return res.status(500).json({ error: 'Failed to update field' });
    }
    
  } else if (req.method === 'DELETE') {
    try {
      const result = await db.collection('form_fields').deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Field not found' });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting field:', error);
      return res.status(500).json({ error: 'Failed to delete field' });
    }
    
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withAuth)(fieldHandler);
