import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';

async function buttonConnectionHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { buttonId } = req.query;
  const db = req.tenantDb;

  if (!db) {
    return res.status(500).json({ error: 'Tenant database connection failed' });
  }

  if (req.method === 'GET') {
    const connection = await db.collection('button_form_connections').findOne({ button_id: buttonId });
    res.status(200).json({ formId: connection?.form_id || null });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(buttonConnectionHandler);
