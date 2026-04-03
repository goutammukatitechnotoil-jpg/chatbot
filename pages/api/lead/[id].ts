import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { WebhookService } from '../../../src/services/webhookService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const db = await connectToDatabase();

  if (!db) {
    return res.status(500).json({ error: 'Database connection failed' });
  }

  if (req.method === 'GET') {
    const lead = await db.collection('leads').findOne({ _id: new ObjectId(id as string) });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.status(200).json({ 
      data: {
        id: lead._id.toString(),
        session_id: lead.session_id,
        date: lead.date,
        chat_history: lead.chat_history ?? [],
        form_data: lead.form_data ?? {},
        last_message: lead.last_message ?? '',
        session_info: lead.session_info ?? null,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      }
    });
  } else if (req.method === 'PUT') {
    // First get the existing lead
    const existingLead = await db.collection('leads').findOne({ _id: new ObjectId(id as string) });
    
    if (!existingLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Prepare update data with smart merging
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update fields that are provided in the request
    if (req.body.session_id) updateData.session_id = req.body.session_id;
    if (req.body.date) updateData.date = req.body.date;
    if (req.body.last_message) updateData.last_message = req.body.last_message;
    if (req.body.chat_history) updateData.chat_history = req.body.chat_history;
    
    // Smart merge form_data (merge with existing, don't overwrite completely)
    if (req.body.form_data) {
      updateData.form_data = {
        ...existingLead.form_data,
        ...req.body.form_data
      };
    }
    
    const result = await db.collection('leads').updateOne(
      { _id: new ObjectId(id as string) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const updatedLead = await db.collection('leads').findOne({ _id: new ObjectId(id as string) });
    
    if (!updatedLead) {
      return res.status(404).json({ error: 'Lead not found after update' });
    }
    
    const responseData = {
      id: updatedLead._id.toString(),
      session_id: updatedLead.session_id,
      date: updatedLead.date,
      chat_history: updatedLead.chat_history ?? [],
      form_data: updatedLead.form_data ?? {},
      last_message: updatedLead.last_message ?? '',
      session_info: updatedLead.session_info ?? null,
      created_at: updatedLead.created_at,
      updated_at: updatedLead.updated_at,
    };
    
    // Check if this update includes meaningful form data (potential new lead data)
    const hasNewFormData = req.body.form_data && (
      req.body.form_data.email || 
      req.body.form_data.phone || 
      req.body.form_data.company ||
      (req.body.form_data.name && req.body.form_data.name !== 'Anonymous User')
    );
    
    // Send to webhooks if there's new meaningful form data
    if (hasNewFormData) {
      WebhookService.sendToWebhooksServer(updatedLead, db).catch(error => {
        console.error('Webhook delivery error on lead update (non-blocking):', error);
      });
    }
    
    res.status(200).json({ data: responseData });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
