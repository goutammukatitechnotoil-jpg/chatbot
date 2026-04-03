

import type { NextApiRequest, NextApiResponse } from 'next';
import TenantService from '../../../src/services/tenantService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return default public widget content
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { configKey } = JSON.parse(req.body);
      console.log('Received configKey:', configKey);
      if (!configKey || typeof configKey !== 'string') {
        res.status(400).json({ error: 'Missing or invalid configKey in request body' });
        return;
      }
      // Resolve tenantId from configKey
      const { connectToDatabase } = await import('../../../lib/mongodb');
      const masterDb = await connectToDatabase();
      if (!masterDb) {
        res.status(500).json({ error: 'Failed to connect to master database' });
        return;
      }
      const tenant = await masterDb.collection('tenants').findOne({ configKey: configKey });
      if (!tenant) {
        res.status(404).json({ error: 'Tenant not found for configKey' });
        return;
      }
      const tenantId = tenant.id;
      // Connect to tenant DB and get chat_config and chatbot_content
      const multiTenantDB = (await import('../../../src/services/multiTenantDatabaseService')).multiTenantDB;
      const db = await multiTenantDB.connectToTenant(tenantId);
      const config = db.collection('chatbot_config');
      const chatConfig = await config.findOne({});

      let chatbotContent = null;
      let formFields: any[] = [];
      let forms: any[] = [];
      let chatbotButtons: any[] = [];
      let buttonFormConnections: any[] = [];
      try {
        const chatbotContentCollection = db.collection('chatbot_content');
        chatbotContent = await chatbotContentCollection.findOne({});
      } catch (err) {
        chatbotContent = null;
      }

      // Fetch form fields for the default contact form (if exists)
      try {

        const formsCollection = db.collection('forms');
        forms = await formsCollection.find({ is_active: true }).toArray();

        const fieldsCollection = db.collection('form_fields');
        formFields = await fieldsCollection.find({}).toArray();

      } catch (err) {
        formFields = [];
      }

      // Fetch chatbot buttons
      try {
        const buttonsCollection = db.collection('chatbot_buttons');
        chatbotButtons = await buttonsCollection.find({}).toArray();
      } catch (err) {
        chatbotButtons = [];
      }

      // Fetch public button-form connections so the widget can mirror /test-chatbot behavior
      try {
        const connectionsCollection = db.collection('button_form_connections');
        buttonFormConnections = await connectionsCollection.find({}).toArray();
      } catch (err) {
        buttonFormConnections = [];
      }

      var url_visibility ;
      // Fetch chatbot buttons
      try {
        const system_settings = db.collection('system_settings');
        url_visibility = await system_settings.findOne({});
      } catch (err) {
        url_visibility = [];
      }
      
      const mergedConfig = {
        ...chatConfig,
        ...chatbotContent,
      };
      res.status(200).json({
        config: mergedConfig,
        formFields,
        forms,
        chatbotButtons,
        buttonFormConnections,
        chatbot_visibility: (url_visibility && !Array.isArray(url_visibility)) ? url_visibility.chatbot_visibility : undefined
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch tenant details' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

