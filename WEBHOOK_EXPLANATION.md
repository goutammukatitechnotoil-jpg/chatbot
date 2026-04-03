# 🔗 Webhook Integration - Complete Explanation

## Overview

The FPT Chatbot platform includes a **powerful webhook integration system** that automatically sends lead data to external services (CRM, marketing automation, databases, etc.) whenever a lead is captured.

**Version:** 2.2.0  
**Last Updated:** January 29, 2025

---

## 📋 Table of Contents

1. [What Are Webhooks?](#what-are-webhooks)
2. [How It Works](#how-it-works)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Data Flow](#data-flow)
6. [Field Mapping](#field-mapping)
7. [Testing](#testing)
8. [Use Cases](#use-cases)
9. [Troubleshooting](#troubleshooting)

---

## 🤔 What Are Webhooks?

### Simple Explanation

**Webhooks** are automated messages sent from one application to another when an event happens. Think of them as "reverse APIs" or "notifications".

### How They Work

```
Event Happens (Lead Captured)
    ↓
FPT Chatbot sends HTTP POST/PUT request
    ↓
External Service (e.g., CRM) receives the data
    ↓
External Service processes the data
    ↓
FPT Chatbot continues operation
```

### Real-World Example

```
User submits form on chatbot
    ↓
Lead is saved in FPT Chatbot database
    ↓
Webhook automatically sends lead to:
    - HubSpot CRM
    - Mailchimp
    - Your custom database
    - Slack notification
    - Any HTTP endpoint
```

---

## ⚙️ How It Works

### System Components

#### 1. **Webhook Configuration** (`/api/integrations/webhook`)
Stores webhook settings in MongoDB:

```typescript
{
  webhook_id: "wh_1234567890",
  name: "HubSpot CRM Integration",
  url: "https://api.hubspot.com/contacts/v1/contact",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-api-key"
  },
  fieldMappings: [
    { leadField: "name", webhookField: "firstname", required: true },
    { leadField: "email", webhookField: "email", required: true },
    { leadField: "phone", webhookField: "phone", required: false }
  ],
  isActive: true,
  created_at: "2025-01-29T10:00:00Z",
  updated_at: "2025-01-29T10:00:00Z"
}
```

#### 2. **Webhook Service** (`/src/services/webhookService.ts`)
Handles webhook delivery:

- Fetches active webhook configurations
- Maps lead data to webhook format
- Sends HTTP requests to external services
- Handles errors and retries
- Provides testing functionality

#### 3. **Trigger Points**
Webhooks are triggered when:

- **New lead created** (`POST /api/lead`)
- **Lead updated** (`PUT /api/lead/[id]`)

---

## 🏗️ Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FPT Chatbot Platform                      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         User Interface (Integrations Page)           │   │
│  │  - Configure webhooks                                │   │
│  │  - Test webhooks                                     │   │
│  │  - Map fields                                        │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         API Layer (/api/integrations/webhook)        │   │
│  │  - GET: Fetch webhook configs                       │   │
│  │  - POST: Create webhook                              │   │
│  │  - PUT: Update webhook                               │   │
│  │  - DELETE: Remove webhook                            │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         MongoDB (webhook_configs collection)         │   │
│  │  - Stores webhook configurations                     │   │
│  │  - Per-tenant isolation                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Lead Capture Events                          │   │
│  │  - POST /api/lead                                    │   │
│  │  - PUT /api/lead/[id]                                │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         WebhookService                               │   │
│  │  - sendToWebhooksServer()                            │   │
│  │  - mapLeadDataToWebhookFields()                      │   │
│  │  - sendToWebhookServer()                             │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │    External Services              │
         │  - CRM (HubSpot, Salesforce)     │
         │  - Email (Mailchimp, SendGrid)   │
         │  - Slack, Discord                │
         │  - Custom APIs                   │
         └──────────────────────────────────┘
```

---

## 🔧 Configuration

### Step 1: Access Integrations Page

Navigate to: `http://localhost:3000/integrations`

### Step 2: Create New Webhook

Click **"Add Webhook"** and configure:

#### Basic Settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive name for the webhook | "HubSpot CRM Integration" |
| **URL** | Endpoint to send data to | `https://api.hubspot.com/contacts/v1/contact` |
| **Method** | HTTP method (POST or PUT) | POST |
| **Status** | Active or inactive | Active ✓ |

#### Headers

Add authentication and content-type headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-api-key-here",
  "X-Custom-Header": "custom-value"
}
```

**Common Headers:**
- **Content-Type:** `application/json` (required)
- **Authorization:** API keys, bearer tokens, basic auth
- **X-API-Key:** Some services use this
- **User-Agent:** Custom user agent (auto-added: `FPT-Chatbot-Webhook/1.0`)

#### Field Mappings

Map FPT Chatbot lead fields to external service fields:

| Lead Field | Webhook Field | Required | Example |
|------------|---------------|----------|---------|
| name | firstname | ✓ | "John Doe" → firstname |
| email | email | ✓ | "john@example.com" → email |
| phone | phone | ✗ | "+1234567890" → phone |
| company | company_name | ✗ | "Acme Corp" → company_name |
| message | note | ✗ | "I need help" → note |

**Available Lead Fields:**
- `name` - Contact name
- `email` - Email address
- `phone` - Phone number
- `company` - Company name
- `message` - Message/inquiry
- `source` - Always "FPT Chatbot"
- `created_at` - Timestamp
- `ip_address` - User IP
- `user_agent` - User's browser info
- Custom form fields (dynamic)

---

## 🔄 Data Flow

### Complete Lead Capture → Webhook Flow

```
1. USER INTERACTION
   └─ User fills out form in chatbot
   └─ Clicks submit
      ↓
2. FORM SUBMISSION
   └─ POST /api/form/submit
   └─ Data validated
      ↓
3. LEAD CREATION
   └─ POST /api/lead
   └─ Lead saved to MongoDB
   └─ Lead data structure:
      {
        session_id: "sess_123456",
        form_data: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          company: "Acme Corp",
          message: "Need a demo"
        },
        conversation_history: [...],
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0...",
        created_at: "2025-01-29T10:00:00Z"
      }
      ↓
4. WEBHOOK TRIGGER
   └─ WebhookService.sendToWebhooksServer(leadData, db)
   └─ Fetch all active webhooks from database
      ↓
5. WEBHOOK PROCESSING (for each active webhook)
   └─ Map lead fields to webhook fields
   └─ Add metadata
   └─ Prepared payload:
      {
        firstname: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        company_name: "Acme Corp",
        note: "Need a demo",
        _metadata: {
          source: "FPT_Chatbot",
          webhook_id: "wh_123456",
          webhook_name: "HubSpot CRM",
          timestamp: "2025-01-29T10:00:00Z",
          lead_id: "507f1f77bcf86cd799439011",
          session_id: "sess_123456"
        }
      }
      ↓
6. HTTP REQUEST
   └─ fetch(webhook.url, {
        method: webhook.method,
        headers: webhook.headers,
        body: JSON.stringify(payload)
      })
      ↓
7. EXTERNAL SERVICE
   └─ HubSpot/CRM receives data
   └─ Creates new contact
   └─ Returns response (200 OK)
      ↓
8. CONFIRMATION
   └─ FPT Chatbot logs success
   └─ Console: "✅ Webhook delivered successfully to HubSpot CRM (200)"
```

---

## 🗺️ Field Mapping

### How Field Mapping Works

Field mapping translates FPT Chatbot's lead data structure into the format expected by external services.

### Example: HubSpot Integration

**FPT Chatbot Lead Data:**
```json
{
  "form_data": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+19876543210",
    "company": "Tech Solutions Inc",
    "message": "Interested in enterprise plan"
  }
}
```

**Field Mapping Configuration:**
```typescript
fieldMappings: [
  { leadField: "name", webhookField: "firstname", required: true },
  { leadField: "email", webhookField: "email", required: true },
  { leadField: "phone", webhookField: "phone", required: false },
  { leadField: "company", webhookField: "company", required: false },
  { leadField: "message", webhookField: "notes", required: false }
]
```

**Resulting Webhook Payload:**
```json
{
  "firstname": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+19876543210",
  "company": "Tech Solutions Inc",
  "notes": "Interested in enterprise plan",
  "_metadata": {
    "source": "FPT_Chatbot",
    "webhook_id": "wh_1234567890",
    "webhook_name": "HubSpot CRM Integration",
    "timestamp": "2025-01-29T10:00:00Z",
    "lead_id": "507f1f77bcf86cd799439011",
    "session_id": "sess_987654"
  }
}
```

### Field Extraction Logic

The `extractLeadFieldValue()` method intelligently extracts data:

```typescript
// Priority order:
1. Check form_data first
2. Fallback to root level
3. Apply special logic for certain fields

Example:
- "name" → form_data.name || null
- "email" → form_data.email || null
- "message" → form_data.message || last_message || null
- "source" → Always "FPT Chatbot"
- "created_at" → created_at || new Date()
```

---

## 🧪 Testing

### Built-in Test Function

The platform provides a webhook testing feature:

#### From UI:
1. Go to `/integrations`
2. Find your webhook
3. Click **"Test Webhook"**
4. System sends sample data
5. View result (success/failure)

#### Test Payload Structure

```json
{
  "firstname": "Test User",
  "email": "test@example.com",
  "phone": "+1234567890",
  "company": "Test Company",
  "note": "This is a test webhook message",
  "_metadata": {
    "source": "FPT_Chatbot",
    "webhook_id": "wh_1234567890",
    "webhook_name": "Your Webhook Name",
    "timestamp": "2025-01-29T10:00:00Z",
    "test": true,
    "session_id": "test_session_1738152000000"
  }
}
```

### Manual Testing

#### Using curl:

```bash
# Test your webhook endpoint
curl -X POST https://your-webhook-url.com/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "firstname": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "_metadata": {
      "source": "FPT_Chatbot",
      "test": true
    }
  }'
```

#### Using Postman:
1. Create new POST request
2. Set URL to your webhook endpoint
3. Add headers (Authorization, Content-Type)
4. Add JSON body with test data
5. Send and verify response

### Testing Services

**Webhook.site** (https://webhook.site)
- Get free temporary webhook URL
- View incoming requests in real-time
- Perfect for testing payload structure

**RequestBin** (https://requestbin.com)
- Similar to webhook.site
- Inspects HTTP requests
- Useful for debugging

---

## 💡 Use Cases

### 1. CRM Integration (HubSpot, Salesforce)

**Goal:** Automatically create contacts in CRM when leads are captured

**Configuration:**
```javascript
{
  name: "HubSpot CRM",
  url: "https://api.hubspot.com/contacts/v1/contact",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_HUBSPOT_API_KEY"
  },
  fieldMappings: [
    { leadField: "email", webhookField: "email", required: true },
    { leadField: "name", webhookField: "firstname", required: true },
    { leadField: "phone", webhookField: "phone", required: false },
    { leadField: "company", webhookField: "company", required: false }
  ]
}
```

**Result:** Every chatbot lead becomes a HubSpot contact automatically!

### 2. Email Marketing (Mailchimp, SendGrid)

**Goal:** Add leads to email marketing lists

**Configuration:**
```javascript
{
  name: "Mailchimp Newsletter",
  url: "https://us1.api.mailchimp.com/3.0/lists/{list_id}/members",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Basic YOUR_MAILCHIMP_API_KEY"
  },
  fieldMappings: [
    { leadField: "email", webhookField: "email_address", required: true },
    { leadField: "name", webhookField: "merge_fields.FNAME", required: false }
  ]
}
```

**Result:** Chatbot leads automatically subscribed to your newsletter!

### 3. Slack Notifications

**Goal:** Get notified in Slack when new leads arrive

**Configuration:**
```javascript
{
  name: "Slack Sales Channel",
  url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  fieldMappings: [
    { leadField: "name", webhookField: "text", required: true }
  ]
}
```

**Custom Payload (if needed):**
```json
{
  "text": "🎯 New Lead: {{name}}",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*New Lead Captured!*\n*Name:* {{name}}\n*Email:* {{email}}\n*Company:* {{company}}"
      }
    }
  ]
}
```

### 4. Custom Database/API

**Goal:** Send leads to your custom application

**Configuration:**
```javascript
{
  name: "Custom CRM API",
  url: "https://your-domain.com/api/leads",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "your-custom-api-key",
    "X-Tenant-ID": "your-tenant-id"
  },
  fieldMappings: [
    { leadField: "name", webhookField: "full_name", required: true },
    { leadField: "email", webhookField: "email_address", required: true },
    { leadField: "phone", webhookField: "phone_number", required: false },
    { leadField: "message", webhookField: "inquiry", required: false },
    { leadField: "source", webhookField: "lead_source", required: true }
  ]
}
```

### 5. Google Sheets (via Zapier/Make)

**Goal:** Log leads in Google Sheets for easy tracking

**Steps:**
1. Create Zapier webhook trigger
2. Connect to Google Sheets
3. Map fields
4. Use Zapier webhook URL in FPT Chatbot

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Webhook Not Firing

**Symptoms:** Leads captured but webhook not sending

**Checklist:**
- [ ] Is webhook marked as "Active"?
- [ ] Check console logs for webhook delivery attempts
- [ ] Verify lead is actually being created (check `/leads` page)
- [ ] Test webhook manually with "Test Webhook" button

**Solution:**
```javascript
// Check webhook status
GET /api/integrations/webhook

// Response should show:
{
  "isActive": true  // Must be true!
}
```

#### 2. 401 Unauthorized / 403 Forbidden

**Symptoms:** Webhook fails with authentication error

**Causes:**
- Invalid API key
- Expired token
- Incorrect authorization header format

**Solutions:**
```javascript
// Check header format:
Correct: "Authorization": "Bearer abc123"
Wrong: "Authorization": "abc123"

// Or use different auth header:
"X-API-Key": "your-key-here"

// Basic Auth:
"Authorization": "Basic base64(username:password)"
```

#### 3. 400 Bad Request

**Symptoms:** External service rejects the payload

**Causes:**
- Missing required fields
- Incorrect field names
- Invalid data format

**Solutions:**
1. Test webhook endpoint with curl/Postman first
2. Verify required fields in external API docs
3. Check field mapping configuration
4. Use webhook.site to inspect actual payload being sent

#### 4. Timeout / No Response

**Symptoms:** Webhook hangs or times out

**Causes:**
- External service is down
- URL is incorrect
- Firewall blocking outbound requests

**Solutions:**
```bash
# Test URL is reachable
curl -v https://your-webhook-url.com

# Check DNS resolution
nslookup your-webhook-url.com

# Verify SSL certificate
openssl s_client -connect your-webhook-url.com:443
```

#### 5. SSL/TLS Errors

**Symptoms:** "certificate verify failed" errors

**Causes:**
- Self-signed certificates
- Expired SSL certificates
- Certificate chain issues

**Solutions:**
- Use valid SSL certificates (Let's Encrypt is free)
- Update to HTTPS endpoint
- Contact external service support

### Debugging Tools

#### 1. Browser Console

View webhook delivery logs:
```javascript
// Open browser console (F12)
// Look for logs like:
🚀 Sending webhook to HubSpot CRM (https://api.hubspot.com/...)
✅ Webhook delivered successfully to HubSpot CRM (200)
❌ Webhook delivery failed to HubSpot CRM: {status: 401, ...}
```

#### 2. Network Tab

Inspect actual HTTP requests:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `/api/integrations/webhook`
4. Check request/response bodies

#### 3. Server Logs

Check server console output:
```bash
# Terminal running `npm run dev`
[Webhook] Fetching active webhooks...
[Webhook] Found 2 active webhooks
[Webhook] Mapping lead data for: HubSpot CRM
[Webhook] Sending to: https://api.hubspot.com/...
[Webhook] Response: 201 Created
```

#### 4. Test Services

Use these to inspect webhooks:
- **webhook.site** - Real-time request inspection
- **requestbin.com** - HTTP request testing
- **beeceptor.com** - Mock API endpoints

---

## 📊 Webhook Data Structure

### Complete Payload Example

```json
{
  "firstname": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corporation",
  "notes": "Interested in enterprise plan. Budget: $50k/year",
  "_metadata": {
    "source": "FPT_Chatbot",
    "webhook_id": "wh_1738152000_abc123def",
    "webhook_name": "HubSpot CRM Integration",
    "timestamp": "2025-01-29T10:30:45.123Z",
    "lead_id": "507f1f77bcf86cd799439011",
    "session_id": "sess_1738151000_xyz789",
    "test": false
  }
}
```

### Metadata Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| `source` | Always "FPT_Chatbot" | "FPT_Chatbot" |
| `webhook_id` | Unique webhook identifier | "wh_1738152000_abc123" |
| `webhook_name` | Human-readable webhook name | "HubSpot CRM Integration" |
| `timestamp` | When webhook was sent (ISO 8601) | "2025-01-29T10:30:45.123Z" |
| `lead_id` | MongoDB ObjectId of the lead | "507f1f77bcf86cd799439011" |
| `session_id` | Chatbot session identifier | "sess_1738151000_xyz789" |
| `test` | Whether this is a test webhook | true/false |

---

## 🎯 Best Practices

### 1. Security

✅ **Use HTTPS endpoints only**
```javascript
// Good
url: "https://api.example.com/webhooks"

// Bad (unsecure)
url: "http://api.example.com/webhooks"
```

✅ **Store API keys securely**
- Use environment variables for sensitive keys
- Rotate keys regularly
- Never commit keys to version control

✅ **Validate webhook signatures** (if service supports it)
```javascript
// Example: Verify HMAC signature
const signature = headers['X-Webhook-Signature'];
const isValid = verifySignature(payload, signature, secret);
```

### 2. Error Handling

✅ **Handle failures gracefully**
- Webhook failures don't stop lead capture
- Leads are saved even if webhook fails
- Check logs to troubleshoot failed deliveries

✅ **Implement retry logic** (future enhancement)
```javascript
// Potential future feature
{
  retryOnFailure: true,
  maxRetries: 3,
  retryDelay: 5000 // 5 seconds
}
```

### 3. Performance

✅ **Use asynchronous delivery**
- Webhooks are sent asynchronously (Promise.allSettled)
- Don't block lead creation waiting for webhook response
- Multiple webhooks sent in parallel

✅ **Set reasonable timeouts**
```javascript
// Webhook requests should timeout if service is slow
timeout: 30000 // 30 seconds max
```

### 4. Testing

✅ **Always test webhooks before going live**
1. Use "Test Webhook" button in UI
2. Verify external service receives data correctly
3. Check field mappings are correct
4. Confirm required fields are present

✅ **Use test mode webhooks during development**
- Create separate webhook for testing
- Mark with "Test" prefix in name
- Can be deactivated after testing

### 5. Monitoring

✅ **Regularly check webhook status**
- Review console logs for errors
- Monitor external service for incoming data
- Set up alerts for webhook failures (future feature)

---

## 🔮 Future Enhancements

### Planned Features

1. **Retry Logic**
   - Auto-retry failed webhooks (3 attempts)
   - Exponential backoff
   - Dead letter queue for permanent failures

2. **Webhook History/Logs**
   - UI to view webhook delivery history
   - Success/failure rates
   - Response times

3. **Conditional Webhooks**
   - Trigger only for specific form submissions
   - Filter by lead source
   - Custom business rules

4. **Template Payloads**
   - Pre-built templates for popular services
   - Custom payload transformations
   - JSON path expressions

5. **Webhook Queue**
   - Background job processing
   - Better reliability
   - Rate limiting

---

## 📚 Related Documentation

- [Webhook Integration Guide](./WEBHOOK_INTEGRATION.md)
- [Integrations Page Guide](./TENANT_FACING_PAGES.md#8️⃣-integrations)
- [Lead Management](./ANALYTICS_KPIs.md)
- [API Documentation](./README.md#api-endpoints)

---

## 📞 Support

### Need Help?

1. **Check logs** - Browser console and server logs
2. **Test endpoint** - Use webhook.site or Postman
3. **Review docs** - External service API documentation
4. **Common issues** - Check troubleshooting section above

### External Service Documentation

- **HubSpot:** https://developers.hubspot.com/docs/api/crm/contacts
- **Salesforce:** https://developer.salesforce.com/docs/apis
- **Mailchimp:** https://mailchimp.com/developer/marketing/api/
- **Slack:** https://api.slack.com/messaging/webhooks
- **Zapier:** https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks

---

## ✅ Summary

### What Webhooks Do
✅ Automatically send lead data to external services  
✅ Trigger in real-time when leads are captured  
✅ Support custom field mapping  
✅ Work with any HTTP endpoint  
✅ Include metadata for tracking  

### How to Use
1. Go to `/integrations` page
2. Click "Add Webhook"
3. Configure URL, headers, and field mappings
4. Test the webhook
5. Activate and save
6. Leads automatically sync to external service!

### Key Benefits
🚀 **Automation** - No manual data entry  
🔄 **Real-time** - Instant delivery  
🎯 **Flexible** - Works with any API  
🔒 **Secure** - HTTPS and authentication  
📊 **Trackable** - Includes metadata  

---

**Version:** 2.2.0  
**Implementation:** Complete and Production Ready  
**Last Updated:** January 29, 2025  

🎉 **Start integrating your favorite tools today!** 🎉
