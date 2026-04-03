import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Test webhook endpoint for development and demonstration purposes
 * This endpoint simply logs all incoming webhook data and returns success
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST and PUT methods
  if (!['POST', 'PUT'].includes(req.method || '')) {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed_methods: ['POST', 'PUT']
    });
  }

  try {
    // Log the incoming webhook data
    console.log('🔔 Test Webhook Received:');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Timestamp:', new Date().toISOString());
    console.log('---');

    // Extract useful information from the webhook
    const isTestWebhook = req.body._metadata?.test === true;
    const webhookName = req.body._metadata?.webhook_name || 'Unknown';
    const sessionId = req.body._metadata?.session_id || 'Unknown';

    // Simulate processing time (optional)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      webhook_info: {
        name: webhookName,
        session_id: sessionId,
        is_test: isTestWebhook,
        received_at: new Date().toISOString(),
        fields_received: Object.keys(req.body).filter(key => !key.startsWith('_')),
        total_fields: Object.keys(req.body).length
      },
      echo: {
        method: req.method,
        content_type: req.headers['content-type'],
        user_agent: req.headers['user-agent']
      }
    });

  } catch (error) {
    console.error('❌ Error processing test webhook:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error while processing webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Configure body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
