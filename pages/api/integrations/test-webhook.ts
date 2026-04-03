import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { WebhookService } from '../../../src/services/webhookService';

/**
 * API endpoint to test webhook from server-side
 * This avoids CORS issues when testing webhooks from the browser
 */
async function testWebhookHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const db = req.tenantDb;
    
    if (!db) {
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }

    const { webhook } = req.body;

    if (!webhook || !webhook.url) {
      return res.status(400).json({ error: 'Webhook configuration is required' });
    }

    // Create test lead data
    const testData = {
      session_id: 'test_session_' + Date.now(),
      form_data: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        message: 'This is a test webhook message'
      },
      created_at: new Date().toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'FPT-Chatbot-Test/1.0'
    };

    console.log(`🧪 Testing webhook: ${webhook.name}`);
    console.log('Webhook URL:', webhook.url);
    console.log('Webhook method:', webhook.method);

    // Use server-side method to send webhook (avoids CORS)
    let success = false;
    let errorDetails = '';
    
    try {
      success = await WebhookService.testWebhookServer(webhook, testData);
    } catch (testError) {
      console.error('Webhook test execution error:', testError);
      errorDetails = testError instanceof Error ? testError.message : 'Unknown error during test';
    }

    if (success) {
      res.status(200).json({ 
        success: true,
        message: `✅ Webhook test successful! Check your webhook endpoint for the test data.`
      });
    } else {
      res.status(200).json({ 
        success: false,
        message: errorDetails 
          ? `❌ Webhook test failed: ${errorDetails}` 
          : `❌ Webhook test failed. Check the URL and configuration. See server logs for details.`
      });
    }
  } catch (error) {
    console.error('Test Webhook API Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default compose(withErrorHandling, withTenant)(testWebhookHandler);
