import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { ObjectId } from 'mongodb';

function mapForm(doc: any) {
  return {
    id: doc._id?.toString() ?? doc.id,
    form_name: doc.form_name,
    form_title: doc.form_title,
    form_description: doc.form_description,
    // include default country if present (support legacy keys)
    defaultCountryName: doc.defaultCountryName || doc.default_country_name || '',
    thank_you_title: doc.thank_you_title || '',
    thank_you_message: doc.thank_you_message || '',
      // Terms & Privacy fields
      terms_message: doc.terms_message || '',
      terms_url: doc.terms_url || '',
      privacy_url: doc.privacy_url || '',
    cta_button_text: doc.cta_button_text,
    cta_button_color: doc.cta_button_color,
    is_active: doc.is_active,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

function mapField(doc: any) {
  return {
    id: doc._id?.toString() ?? doc.id,
    form_id: doc.form_id,
    field_name: doc.field_name,
    field_type: doc.field_type,
    placeholder: doc.placeholder,
    placement: doc.placement,
    is_required: doc.is_required,
    order_index: doc.order_index,
    options: doc.options,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

async function formHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const db = req.tenantDb;
    
    if (!db) {
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }

    if (req.method === 'GET') {
      const forms = await db.collection('forms').find({}).toArray();
      res.status(200).json({ data: forms.map(mapForm) });
    } else if (req.method === 'POST') {
      const doc = {
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const result = await db.collection('forms').insertOne(doc);
      res.status(201).json({ data: mapForm({ ...doc, _id: result.insertedId }) });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default compose(withErrorHandling, withTenant)(formHandler);
