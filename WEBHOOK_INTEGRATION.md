# Webhook Integration Documentation

## Overview

The FPT Chatbot platform now includes a comprehensive webhook integration system that allows you to automatically send lead data to external services when leads are captured through the chatbot.

## Features

### 🔗 **Webhook Configuration**
- Add multiple webhook endpoints with custom names
- Support for POST and PUT HTTP methods
- Custom headers configuration
- Enable/disable individual webhooks
- Field mapping between chatbot leads and webhook payloads

### 📊 **Field Mapping**
- Map chatbot form fields to your webhook fields
- Support for required and optional field mappings
- Available lead fields:
  - `name` - Lead's name
  - `email` - Lead's email address
  - `phone` - Lead's phone number
  - `company` - Lead's company name
  - `message` - Lead's message or last chat message
  - `source` - Always "FPT Chatbot"
  - `created_at` - Lead creation timestamp
  - `ip_address` - Lead's IP address (if available)
  - `user_agent` - Lead's browser user agent (if available)

### 🚀 **Automatic Delivery**
- Webhooks are triggered automatically when:
  - New leads are created
  - Existing leads are updated with meaningful form data
- Asynchronous delivery (doesn't block chatbot responses)
- Error handling and logging
- Metadata included in every webhook payload

### 🧪 **Testing & Debugging**
- Built-in webhook testing with sample data
- Detailed logging for webhook deliveries
- Success/failure status reporting
- Test button in the admin interface

## Setup Guide

### Step 1: Access Integration Settings
1. Log into the admin panel
2. Navigate to **"Integrations"** in the sidebar
3. Click **"Add Webhook"**

### Step 2: Configure Basic Settings
```
Webhook Name: CRM Integration
Webhook URL: https://your-crm.com/api/webhooks/leads
HTTP Method: POST (recommended)
Active: ✓ Enabled
```

### Step 3: Set Headers (Optional)
Common headers to add:
```
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json (automatically included)
X-Source: FPT-Chatbot
```

### Step 4: Configure Field Mappings
Map chatbot fields to your system's fields:
```
Chatbot Field  →  Your Field Name  →  Required
name           →  customer_name     →  ✓
email          →  email_address     →  ✓
phone          →  phone_number      →  ✗
company        →  company_name      →  ✗
message        →  inquiry_details   →  ✗
source         →  lead_source       →  ✗
```

### Step 5: Test the Integration
1. Click **"Test"** next to your webhook
2. Check your webhook endpoint for the test data
3. Verify all mapped fields are received correctly

## Webhook Payload Format

### Standard Payload Structure
```json
{
  "customer_name": "John Doe",
  "email_address": "john@example.com",
  "phone_number": "+1234567890",
  "company_name": "Acme Corp",
  "inquiry_details": "Interested in your services",
  "lead_source": "FPT Chatbot",
  "_metadata": {
    "source": "FPT_Chatbot",
    "webhook_id": "wh_1234567890_abc123",
    "webhook_name": "CRM Integration",
    "timestamp": "2024-11-26T10:30:00.000Z",
    "lead_id": "674b1234567890abcdef1234",
    "session_id": "session_1732615800123"
  }
}
```

### Metadata Fields
- `source`: Always "FPT_Chatbot"
- `webhook_id`: Unique identifier for the webhook configuration
- `webhook_name`: Human-readable name of the webhook
- `timestamp`: ISO 8601 timestamp when the webhook was sent
- `lead_id`: Database ID of the lead record
- `session_id`: Chatbot session identifier
- `test`: `true` if this is a test webhook (only present during testing)

## Integration Examples

### Example 1: HubSpot Integration
```json
{
  "properties": {
    "firstname": "John",
    "lastname": "Doe", 
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "message": "Interested in your services",
    "hs_lead_status": "NEW",
    "lifecyclestage": "lead"
  }
}
```

**Field Mappings:**
- `name` → `properties.firstname`
- `email` → `properties.email`
- `phone` → `properties.phone`
- `company` → `properties.company`
- `message` → `properties.message`

### Example 2: Salesforce Integration
```json
{
  "FirstName": "John",
  "LastName": "Doe",
  "Email": "john@example.com",
  "Phone": "+1234567890", 
  "Company": "Acme Corp",
  "Description": "Interested in your services",
  "LeadSource": "Website Chat"
}
```

**Field Mappings:**
- `name` → `FirstName` (could split name if needed)
- `email` → `Email`
- `phone` → `Phone`
- `company` → `Company`
- `message` → `Description`
- `source` → `LeadSource`

### Example 3: Custom CRM Integration
```json
{
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "organization": "Acme Corp"
  },
  "lead": {
    "source": "chatbot",
    "message": "Interested in your services",
    "priority": "medium",
    "status": "new"
  }
}
```

## Webhook Endpoint Requirements

### HTTP Methods
- **POST**: Recommended for creating new records
- **PUT**: For updating existing records (if you have deduplication logic)

### Response Codes
Your webhook endpoint should respond with:
- **200-299**: Success (webhook marked as delivered)
- **400-599**: Error (webhook marked as failed, logged for debugging)

### Content-Type
- Webhooks always send `application/json`
- Your endpoint should accept JSON payloads

### Security Recommendations
1. **Use HTTPS** for webhook URLs
2. **Validate payloads** using the metadata
3. **Implement authentication** via headers or URL parameters
4. **Rate limiting** to handle multiple webhooks
5. **Idempotency** to handle duplicate deliveries

## Troubleshooting

### Common Issues

**Webhook not triggering:**
- Ensure webhook is set to "Active"
- Check that leads are being created (visit Lead List)
- Verify field mappings are configured

**Webhook failing:**
- Test the webhook endpoint independently
- Check webhook URL is accessible and accepting POST/PUT
- Verify authentication headers are correct
- Check server logs for error details

**Missing data in webhook:**
- Verify field mappings match your expected field names
- Check that required fields are being captured in forms
- Test with sample data using the Test button

### Debugging Tips

1. **Use the Test Button**: Always test webhooks before going live
2. **Check Browser Console**: Webhook test results are logged
3. **Monitor Webhook Logs**: Server logs show delivery attempts and failures
4. **Webhook.site Testing**: Use https://webhook.site for testing payloads

### Server Logs
Webhook activities are logged with prefixes:
- `🚀 Sending webhook to...` - Webhook attempt started
- `✅ Webhook delivered successfully...` - Webhook succeeded
- `❌ Webhook delivery failed...` - Webhook failed with error details
- `🧪 Testing webhook...` - Test webhook sent

## API Reference

### Webhook Configuration API
- `GET /api/integrations/webhook` - List all webhooks
- `POST /api/integrations/webhook` - Create new webhook
- `PUT /api/integrations/webhook` - Update existing webhook
- `DELETE /api/integrations/webhook?id={webhook_id}` - Delete webhook

### Lead APIs (with webhook integration)
- `POST /api/lead` - Create lead (triggers webhooks)
- `PUT /api/lead/[id]` - Update lead (triggers webhooks if meaningful form data added)

## Best Practices

### Performance
- Keep webhook endpoints fast (< 5 seconds response time)
- Use asynchronous processing for heavy operations
- Implement proper error handling

### Data Handling
- Validate webhook payloads before processing
- Handle duplicate lead submissions gracefully
- Store webhook metadata for audit trails

### Security
- Use authentication headers for sensitive integrations
- Validate webhook source using metadata
- Log webhook activities for security monitoring

### Monitoring
- Set up alerts for webhook failures
- Monitor webhook delivery success rates
- Test webhooks periodically

## Support

If you encounter issues with webhook integrations:

1. Check the Integration Settings for configuration errors
2. Test webhooks using the built-in test feature
3. Review server logs for delivery attempts
4. Verify your webhook endpoint is accessible and working
5. Contact support with webhook configuration details and error logs
