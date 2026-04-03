import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { multiTenantDB } from '../../../src/services/multiTenantDatabaseService';

// Util: Get client IP address
function getClientIp(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        ''
    );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tenant-ID');
        res.status(200).end();
        return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tenant-ID');

    const { method } = req;
    const configKey = req.body.configKey || req.headers['x-config-key'];
    if (!configKey) {
        return res.status(400).json({ error: 'Missing configKey' });
    }

    // Resolve tenantId from configKey
    const masterDb = await connectToDatabase();
    if (!masterDb) {
        return res.status(500).json({ error: 'Database connection failed' });
    }
    const tenant = await masterDb.collection('tenants').findOne({ configKey });
    if (!tenant) {
        return res.status(404).json({ error: 'Invalid configKey' });
    }
    const tenantId = tenant.id;

    // Connect to the specific tenant database
    const db = await multiTenantDB.connectToTenant(tenantId);
    const leads = db.collection('leads');

    if (method === 'POST') {
        // Create new lead on chat start
        const { session_id, form_data, chat_history, session_info ,sources} = req.body;
        if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
        const ip_address = getClientIp(req);
        const lead = {
            tenant_id: tenantId,
            session_id,
            form_data: form_data || {},
            chat_history: chat_history || [],
            sources: sources || [],
            created_at: new Date().toISOString().toString(),
            updated_at: new Date().toISOString().toString(),
            session_info,
            ip_address
        };

        console.log("Creating lead:", lead);
        const result = await leads.insertOne(lead);
        return res.status(201).json({ success: true, lead_id: result.insertedId });
    }

    if (method === 'PUT') {
        // Update lead on every message
        const { session_id, message, sender = 'user',sources } = req.body;
        if (!session_id || !message) return res.status(400).json({ error: 'Missing session_id or message' });
        const update = {
            $push: { chat_history: { sender, message, timestamp: String(new Date().toISOString()),sources: sources} },
            $set: { updated_at: String(new Date().toISOString()) }
        };
        await leads.updateOne({ tenant_id: tenantId, session_id }, update);
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
