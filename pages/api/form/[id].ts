import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { ObjectId } from 'mongodb';

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

async function formByIdHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const db = req.tenantDb;

  if (!db) {
    return res.status(500).json({ error: 'Tenant database connection failed' });
  }
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
    const form = await db.collection('forms').findOne({ _id: new ObjectId(id as string) });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.status(200).json({ 
      data: {
        id: form._id.toString(),
        form_name: form.form_name,
        form_title: form.form_title,
        form_description: form.form_description,
        // include default country if present (support legacy key)
        defaultCountryName: form.defaultCountryName || form.default_country_name || '',
        thank_you_title: form.thank_you_title || '',
        thank_you_message: form.thank_you_message || '',
        cta_button_text: form.cta_button_text,
        cta_button_color: form.cta_button_color,
         terms_message: form.terms_message || '',
      terms_url: form.terms_url || '',
      privacy_url: form.privacy_url || '',
        is_active: form.is_active,
        created_at: form.created_at,
        updated_at: form.updated_at,
      }
    });
  } else if (req.method === 'PUT') {
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    await db.collection('forms').updateOne(
      { _id: new ObjectId(id as string) },
      { $set: updateData }
    );
    const form = await db.collection('forms').findOne({ _id: new ObjectId(id as string) });
    res.status(200).json({ data: form });
  } else if (req.method === 'DELETE') {
    await db.collection('forms').deleteOne({ _id: new ObjectId(id as string) });
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(formByIdHandler);
