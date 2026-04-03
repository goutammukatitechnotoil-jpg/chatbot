import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';

async function buttonConnectHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { buttonId, formId } = req.body;
  const db = req.tenantDb;

  if (!db) {
    return res.status(500).json({ error: 'Tenant database connection failed' });
  }

  if (req.method === 'POST') {
    const existing = await db.collection('button_form_connections').findOne({ button_id: buttonId });
    if (existing) {
      await db.collection('button_form_connections').updateOne(
        { button_id: buttonId },
        { $set: { form_id: formId } }
      );
    } else {
      await db.collection('button_form_connections').insertOne({ button_id: buttonId, form_id: formId });
    }
    res.status(200).json({ success: true });
  } else if (req.method === 'DELETE') {
    await db.collection('button_form_connections').deleteOne({ button_id: buttonId });
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(buttonConnectHandler);
