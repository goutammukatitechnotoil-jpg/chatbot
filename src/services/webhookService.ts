import { WebhookConfig } from '../../pages/api/integrations/webhook';

export interface WebhookDeliveryData {
  [key: string]: any;
}

export class WebhookService {
  /**
   * Send lead data to configured webhooks
   */
  static async sendToWebhooks(leadData: any): Promise<void> {
    try {
      // Get all active webhooks
      const webhooksResponse = await fetch('/api/integrations/webhook');
      if (!webhooksResponse.ok) {
        console.error('Failed to fetch webhook configurations');
        return;
      }

      const { data: webhooks } = await webhooksResponse.json();
      const activeWebhooks = webhooks?.filter((webhook: WebhookConfig) => webhook.isActive) || [];

      if (activeWebhooks.length === 0) {
        console.log('No active webhooks configured');
        return;
      }

      // Send to each active webhook
      const promises = activeWebhooks.map((webhook: WebhookConfig) =>
        this.sendToWebhook(webhook, leadData)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error in webhook delivery process:', error);
    }
  }

  /**
   * Send data to a specific webhook
   */
  private static async sendToWebhook(webhook: WebhookConfig, leadData: any): Promise<void> {
    try {
      // Map lead data to webhook fields
      const mappedData = this.mapLeadDataToWebhookFields(leadData, webhook.fieldMappings);

      // Add metadata
      const payload = {
        ...mappedData,
        _metadata: {
          source: 'FPT_Chatbot',
          webhook_id: webhook.webhook_id,
          webhook_name: webhook.name,
          timestamp: new Date().toISOString(),
          lead_id: leadData.id || leadData._id?.toString(),
          session_id: leadData.session_id
        }
      };

      console.log(`Sending webhook to ${webhook.name} (${webhook.url}):`, payload);

      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          ...webhook.headers,
          'User-Agent': 'FPT-Chatbot-Webhook/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`✅ Webhook delivered successfully to ${webhook.name}`);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Webhook delivery failed to ${webhook.name}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }
    } catch (error) {
      console.error(`❌ Error sending webhook to ${webhook.name}:`, error);
    }
  }

  /**
   * Map lead data to webhook fields based on field mappings
   */
  private static mapLeadDataToWebhookFields(leadData: any, fieldMappings: any[]): WebhookDeliveryData {
    const mapped: WebhookDeliveryData = {};

    fieldMappings.forEach(mapping => {
      if (!mapping.leadField || !mapping.webhookField) return;

      let value = this.extractLeadFieldValue(leadData, mapping.leadField);

      if (value !== null && value !== undefined) {
        mapped[mapping.webhookField] = value;
      } else if (mapping.required) {
        // Set empty string for required fields that are missing
        mapped[mapping.webhookField] = '';
        console.warn(`Required field ${mapping.leadField} is missing from lead data`);
      }
    });

    return mapped;
  }

  /**
   * Extract value from lead data based on field key
   */
  private static extractLeadFieldValue(leadData: any, fieldKey: string): any {
    switch (fieldKey) {
      case 'session_id':
        return leadData.session_id || null;
      case 'name':
        return leadData.form_data?.name || leadData.form_data?.Name || null;
      case 'email':
        return leadData.form_data?.email || leadData.form_data?.Email || null;
      case 'phone':
        return leadData.form_data?.phone || leadData.form_data?.Phone || null;
      case 'company':
        return leadData.form_data?.company || leadData.form_data?.Company || null;
      case 'job_title':
        // Handle multiple field name variations for Job Title
        return leadData.form_data?.job_title ||
          leadData.form_data?.jobtitle ||
          leadData.form_data?.jobTitle ||
          leadData.form_data?.['Job Title'] ||
          leadData.form_data?.position || null;
      case 'country':
        return leadData.form_data?.country || leadData.form_data?.Country || null;
      case 'purpose':
        return leadData.form_data?.purpose || leadData.form_data?.Purpose || null;
      case 'details':
        return leadData.form_data?.details || leadData.form_data?.Details || null;
      case 'message':
        return leadData.form_data?.message || leadData.form_data?.Message || leadData.last_message || null;
      case 'bot_conversation':
        // Return the full chat history as formatted text or JSON
        if (leadData.chat_history && Array.isArray(leadData.chat_history)) {
          return leadData.chat_history.map((msg: any) =>
            `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.message}`
          ).join('\n');
        }
        return null;
      case 'source':
        return 'FPT Chatbot';
      case 'created_at':
        return leadData.created_at || new Date().toISOString();
      case 'ip_address':
        return leadData.session_info?.ip_address || leadData.ip_address || null;
      case 'user_agent':
        return leadData.session_info?.user_agent || leadData.user_agent || null;
      default:
        // Try to get from form_data first, then from root level
        return leadData.form_data?.[fieldKey] || leadData[fieldKey] || null;
    }
  }

  /**
   * Server-side webhook sending (for API routes)
   */
  static async sendToWebhooksServer(leadData: any, dbConnection: any): Promise<void> {
    try {
      // Get all active webhooks from database
      const webhooks = await dbConnection.collection('webhook_configs')
        .find({ isActive: true })
        .toArray();

      console.log('Fetched webhooks from database:', webhooks);


      if (webhooks.length === 0) {
        console.log('No active webhooks configured');
        return;
      }

      // Send to each active webhook
      const promises = webhooks.map((webhook: any) =>
        this.sendToWebhookServer(webhook, leadData)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error in server webhook delivery process:', error);
    }
  }

  /**
   * Server-side webhook sending to a specific webhook
   */
  private static async sendToWebhookServer(webhook: any, leadData: any): Promise<void> {
    try {
      // Map lead data to webhook fields
      const mappedData = this.mapLeadDataToWebhookFields(leadData, webhook.fieldMappings || []);

      // Add metadata
      const payload = {
        ...mappedData,

      };
      const formData = new URLSearchParams({
        ...payload
      });
      console.log(`🚀 Sending webhook to ${webhook.name} (${webhook.url})`);

      // Use node-fetch or built-in fetch in newer Node.js versions
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          ...webhook.headers,
          'User-Agent': 'FPT-Chatbot-Webhook/1.0'
        },
        body: formData.toString()
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log(`✅ Webhook delivered successfully to ${webhook.name} (${response.status}) (Response: ${responseText})`);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Webhook delivery failed to ${webhook.name}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }
    } catch (error) {
      console.error(`❌ Error sending webhook to ${webhook.name}:`, error);
    }
  }

  /**
   * Test webhook connectivity and field mapping
   */
  static async testWebhook(webhook: WebhookConfig, sampleLeadData?: any): Promise<boolean> {
    try {
      const testData = sampleLeadData || {
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

      // Map data according to webhook configuration
      const mappedData = this.mapLeadDataToWebhookFields(testData, webhook.fieldMappings);

      const payload = {
        ...mappedData,
        _metadata: {
          source: 'FPT_Chatbot',
          webhook_id: webhook.webhook_id,
          webhook_name: webhook.name,
          timestamp: new Date().toISOString(),
          test: true,
          session_id: testData.session_id
        }
      };

      console.log(`🧪 Testing webhook ${webhook.name} with payload:`, payload);

      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          ...webhook.headers,
          'User-Agent': 'FPT-Chatbot-Webhook-Test/1.0'
        },
        body: JSON.stringify(payload)
      });

      const success = response.ok;

      if (success) {
        console.log(`✅ Webhook test successful for ${webhook.name} (${response.status})`);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Webhook test failed for ${webhook.name}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }

      return success;
    } catch (error) {
      console.error(`❌ Error testing webhook ${webhook.name}:`, error);
      return false;
    }
  }

  /**
   * Server-side webhook test (avoids CORS issues)
   * This method should be called from API routes
   */
  static async testWebhookServer(webhook: any, sampleLeadData?: any): Promise<boolean> {
    try {
      const testData = sampleLeadData || {
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

      // Map data according to webhook configuration
      const mappedData = this.mapLeadDataToWebhookFields(testData, webhook.fieldMappings || []);

      const payload = {
        ...mappedData,
        _metadata: {
          source: 'FPT_Chatbot',
          webhook_id: webhook.webhook_id,
          webhook_name: webhook.name,
          timestamp: new Date().toISOString(),
          test: true,
          session_id: testData.session_id
        }
      };

      console.log(`🧪 Testing webhook ${webhook.name} (${webhook.url})`);
      console.log('Test payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(webhook.url, {
        method: webhook.method || 'POST',
        headers: {
          ...webhook.headers,
          'User-Agent': 'FPT-Chatbot-Webhook-Test/1.0'
        },
        body: JSON.stringify(payload)
      });

      const success = response.ok;

      if (success) {
        const responseText = await response.text().catch(() => '');
        console.log(`✅ Webhook test successful for ${webhook.name} (${response.status})`);
        console.log('Response:', responseText);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Webhook test failed for ${webhook.name}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }

      return success;
    } catch (error) {
      console.error(`❌ Error testing webhook ${webhook.name}:`, error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
      }
      return false;
    }
  }
}

export default WebhookService;
