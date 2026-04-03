import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';

async function buttonConnectionsHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { buttonId, formId } = req.query;
  const db = req.tenantDb;

  if (req.method === 'GET') {
    if (buttonId) {
      const connection = await db.collection('button_form_connections').findOne({ button_id: buttonId });
      return res.status(200).json({ formId: connection?.form_id || null });
    }
    
    if (formId) {
      const connections = await db.collection('button_form_connections').find({ form_id: formId }).toArray();
      const buttonIds = connections.map(conn => conn.button_id);
      const buttons = await db.collection('chatbot_buttons').find({ id: { $in: buttonIds } }).toArray();
      return res.status(200).json({ 
        data: buttons.map(btn => ({
          id: btn._id.toString(),
          label: btn.label,
          type: btn.type,
          description: btn.description,
          location: btn.location,
        }))
      });
    }
    
    const connections = await db.collection('button_form_connections').find({}).toArray();
    res.status(200).json({ 
      data: connections.map(conn => ({
        button_id: conn.button_id,
        form_id: conn.form_id,
      }))
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default compose(withErrorHandling, withTenant)(buttonConnectionsHandler);
