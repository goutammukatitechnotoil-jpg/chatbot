# 🔗 Webhook Integration - Visual Flow Diagrams

## Quick Visual Guide to Webhook Integration

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FPT CHATBOT PLATFORM                              │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  USER INTERFACE                                             │    │
│  │  http://localhost:3000/integrations                         │    │
│  │                                                              │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐           │    │
│  │  │ Create     │  │ Configure  │  │ Test       │           │    │
│  │  │ Webhook    │  │ Fields     │  │ Webhook    │           │    │
│  │  └────────────┘  └────────────┘  └────────────┘           │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                         │                                           │
│                         ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  API LAYER                                                  │    │
│  │  /api/integrations/webhook                                  │    │
│  │                                                              │    │
│  │  GET    → Fetch webhook configurations                      │    │
│  │  POST   → Create new webhook                                │    │
│  │  PUT    → Update webhook                                    │    │
│  │  DELETE → Remove webhook                                    │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                         │                                           │
│                         ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  MONGODB DATABASE (Tenant-Specific)                         │    │
│  │  Collection: webhook_configs                                │    │
│  │                                                              │    │
│  │  {                                                           │    │
│  │    webhook_id: "wh_123",                                    │    │
│  │    name: "HubSpot CRM",                                     │    │
│  │    url: "https://api.hubspot.com/...",                      │    │
│  │    method: "POST",                                          │    │
│  │    headers: {...},                                          │    │
│  │    fieldMappings: [...],                                    │    │
│  │    isActive: true                                           │    │
│  │  }                                                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  WEBHOOK TRIGGER POINTS                                     │    │
│  │                                                              │    │
│  │  1. POST /api/lead      → New lead created                 │    │
│  │  2. PUT  /api/lead/[id] → Lead updated                     │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                         │                                           │
│                         ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  WEBHOOK SERVICE                                            │    │
│  │  /src/services/webhookService.ts                            │    │
│  │                                                              │    │
│  │  • sendToWebhooksServer()                                   │    │
│  │  • mapLeadDataToWebhookFields()                             │    │
│  │  • sendToWebhookServer()                                    │    │
│  │  • testWebhook()                                            │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                         │                                           │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │   EXTERNAL SERVICES                     │
         │                                         │
         │   📊 CRM Systems                       │
         │      • HubSpot                         │
         │      • Salesforce                      │
         │      • Pipedrive                       │
         │                                         │
         │   📧 Email Marketing                   │
         │      • Mailchimp                       │
         │      • SendGrid                        │
         │      • ActiveCampaign                  │
         │                                         │
         │   💬 Communication                     │
         │      • Slack                           │
         │      • Discord                         │
         │      • Microsoft Teams                 │
         │                                         │
         │   🔧 Custom APIs                       │
         │      • Your custom backend             │
         │      • Legacy systems                  │
         │      • Third-party tools               │
         └────────────────────────────────────────┘
```

---

## 🔄 Complete Data Flow

### Step-by-Step Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER INTERACTION                                         │
│                                                                   │
│  👤 User                                                         │
│   │                                                               │
│   ├─ Chats with bot                                             │
│   ├─ Fills out form                                             │
│   │  • Name: "John Doe"                                         │
│   │  • Email: "john@example.com"                                │
│   │  • Phone: "+1234567890"                                     │
│   │  • Message: "Need enterprise plan"                          │
│   │                                                               │
│   └─ Clicks "Submit"                                            │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: FORM SUBMISSION                                          │
│                                                                   │
│  POST /api/form/submit                                           │
│  {                                                                │
│    form_id: "form_123",                                          │
│    data: {                                                        │
│      name: "John Doe",                                           │
│      email: "john@example.com",                                  │
│      phone: "+1234567890",                                       │
│      message: "Need enterprise plan"                             │
│    }                                                              │
│  }                                                                │
│                                                                   │
│  ✅ Form validated                                               │
│  ✅ Data sanitized                                               │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: LEAD CREATION                                            │
│                                                                   │
│  POST /api/lead                                                  │
│  {                                                                │
│    session_id: "sess_abc123",                                    │
│    form_data: {                                                  │
│      name: "John Doe",                                           │
│      email: "john@example.com",                                  │
│      phone: "+1234567890",                                       │
│      message: "Need enterprise plan"                             │
│    },                                                             │
│    conversation_history: [                                       │
│      { role: "user", message: "Hi" },                           │
│      { role: "bot", message: "Hello! How can I help?" },        │
│      ...                                                          │
│    ],                                                             │
│    ip_address: "192.168.1.1",                                    │
│    user_agent: "Mozilla/5.0...",                                 │
│    created_at: "2025-01-29T10:00:00Z"                           │
│  }                                                                │
│                                                                   │
│  ✅ Lead saved to MongoDB                                        │
│  ✅ Lead ID: 507f1f77bcf86cd799439011                           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: WEBHOOK SERVICE ACTIVATED                                │
│                                                                   │
│  WebhookService.sendToWebhooksServer(leadData, db)              │
│                                                                   │
│  1. Fetch active webhooks from database                         │
│     → Query: { isActive: true }                                 │
│     → Found: 2 active webhooks                                  │
│        • "HubSpot CRM"                                          │
│        • "Slack Notifications"                                  │
│                                                                   │
│  2. Process each webhook in parallel                            │
│     → Promise.allSettled([...])                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
        ┌───────────────┐ ┌───────────────┐
        │ Webhook #1    │ │ Webhook #2    │
        │ HubSpot CRM   │ │ Slack Notify  │
        └───────┬───────┘ └───────┬───────┘
                │                 │
                ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: FIELD MAPPING (for each webhook)                        │
│                                                                   │
│  Webhook #1: HubSpot CRM                                         │
│  ─────────────────────────────────────────────                  │
│  Field Mappings:                                                 │
│    name  → firstname                                             │
│    email → email                                                 │
│    phone → phone                                                 │
│                                                                   │
│  Lead Data:                    Mapped Data:                      │
│  {                             {                                 │
│    form_data: {                  firstname: "John Doe",         │
│      name: "John Doe",           email: "john@example.com",     │
│      email: "john@...",          phone: "+1234567890"           │
│      phone: "+123..."                                            │
│    }                           }                                 │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: ADD METADATA                                             │
│                                                                   │
│  Final Payload:                                                  │
│  {                                                                │
│    firstname: "John Doe",                                        │
│    email: "john@example.com",                                    │
│    phone: "+1234567890",                                         │
│    _metadata: {                                                  │
│      source: "FPT_Chatbot",                                      │
│      webhook_id: "wh_123",                                       │
│      webhook_name: "HubSpot CRM",                                │
│      timestamp: "2025-01-29T10:00:01Z",                         │
│      lead_id: "507f1f77bcf86cd799439011",                       │
│      session_id: "sess_abc123",                                  │
│      test: false                                                 │
│    }                                                              │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: HTTP REQUEST                                             │
│                                                                   │
│  fetch("https://api.hubspot.com/contacts/v1/contact", {         │
│    method: "POST",                                               │
│    headers: {                                                    │
│      "Content-Type": "application/json",                         │
│      "Authorization": "Bearer abc123...",                        │
│      "User-Agent": "FPT-Chatbot-Webhook/1.0"                    │
│    },                                                             │
│    body: JSON.stringify(payload)                                 │
│  })                                                               │
│                                                                   │
│  🚀 Sending webhook...                                           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: EXTERNAL SERVICE PROCESSES                               │
│                                                                   │
│  HubSpot API receives request:                                   │
│  POST /contacts/v1/contact                                       │
│                                                                   │
│  1. Validates authentication                                     │
│  2. Processes contact data                                       │
│  3. Creates new contact in HubSpot                              │
│  4. Returns response                                             │
│                                                                   │
│  Response:                                                       │
│  {                                                                │
│    status: 201,                                                  │
│    body: {                                                       │
│      vid: 12345,                                                 │
│      properties: {                                               │
│        firstname: { value: "John Doe" },                        │
│        email: { value: "john@example.com" }                     │
│      }                                                            │
│    }                                                              │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: CONFIRMATION & LOGGING                                   │
│                                                                   │
│  if (response.ok) {                                              │
│    console.log("✅ Webhook delivered successfully to HubSpot")  │
│  } else {                                                        │
│    console.error("❌ Webhook delivery failed")                  │
│  }                                                                │
│                                                                   │
│  Browser Console Output:                                         │
│  ─────────────────────────────────────────────────────────      │
│  🚀 Sending webhook to HubSpot CRM (https://api.hubspot...)    │
│  ✅ Webhook delivered successfully to HubSpot CRM (201)         │
│  🚀 Sending webhook to Slack Notifications (https://hooks...)  │
│  ✅ Webhook delivered successfully to Slack Notifications (200) │
│                                                                   │
│  Result: Lead data now in both HubSpot AND Slack! 🎉            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Webhook Configuration Flow

```
┌────────────────────────────────────────────────────────┐
│ 1. NAVIGATE TO INTEGRATIONS PAGE                       │
│                                                          │
│    http://localhost:3000/integrations                   │
│                                                          │
│    ┌──────────────────────────────────────┐            │
│    │  Integrations & Webhooks             │            │
│    │                                       │            │
│    │  [+ Add Webhook]                     │            │
│    │                                       │            │
│    │  📊 Existing Webhooks:               │            │
│    │  • HubSpot CRM (Active ✓)           │            │
│    │  • Mailchimp (Inactive)              │            │
│    └──────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
                    │
                    ▼ Click "Add Webhook"
┌────────────────────────────────────────────────────────┐
│ 2. BASIC CONFIGURATION                                  │
│                                                          │
│    ┌──────────────────────────────────────┐            │
│    │  Create New Webhook                  │            │
│    │                                       │            │
│    │  Name: [HubSpot CRM Integration   ] │            │
│    │  URL:  [https://api.hubspot.com/...] │            │
│    │  Method: [POST ▼]                    │            │
│    │  Status: [✓] Active                  │            │
│    │                                       │            │
│    │  [Next: Configure Headers]           │            │
│    └──────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ 3. HEADERS CONFIGURATION                                │
│                                                          │
│    ┌──────────────────────────────────────┐            │
│    │  HTTP Headers                        │            │
│    │                                       │            │
│    │  Header Name          | Value        │            │
│    │  ────────────────────────────────    │            │
│    │  Content-Type         | application/json          │
│    │  Authorization        | Bearer abc123xyz          │
│    │  [+ Add Header]                      │            │
│    │                                       │            │
│    │  [Next: Map Fields]                  │            │
│    └──────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ 4. FIELD MAPPING                                        │
│                                                          │
│    ┌──────────────────────────────────────┐            │
│    │  Map Lead Fields to Webhook Fields   │            │
│    │                                       │            │
│    │  Lead Field    →  Webhook Field  Req │            │
│    │  ─────────────────────────────────── │            │
│    │  name          →  firstname      [✓] │            │
│    │  email         →  email          [✓] │            │
│    │  phone         →  phone          [ ] │            │
│    │  company       →  company        [ ] │            │
│    │  message       →  notes          [ ] │            │
│    │  [+ Add Mapping]                     │            │
│    │                                       │            │
│    │  [Test Webhook] [Save & Activate]    │            │
│    └──────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
                    │
                    ▼ Click "Test Webhook"
┌────────────────────────────────────────────────────────┐
│ 5. TEST WEBHOOK                                         │
│                                                          │
│    ┌──────────────────────────────────────┐            │
│    │  Testing Webhook...                  │            │
│    │                                       │            │
│    │  Sending test payload:               │            │
│    │  {                                    │            │
│    │    firstname: "Test User",           │            │
│    │    email: "test@example.com",        │            │
│    │    phone: "+1234567890",             │            │
│    │    _metadata: { test: true }         │            │
│    │  }                                    │            │
│    │                                       │            │
│    │  ✅ Success! (201 Created)           │            │
│    │  Response time: 450ms                │            │
│    │                                       │            │
│    │  [Close]                              │            │
│    └──────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
                    │
                    ▼ Click "Save & Activate"
┌────────────────────────────────────────────────────────┐
│ 6. WEBHOOK ACTIVE                                       │
│                                                          │
│    ┌──────────────────────────────────────┐            │
│    │  ✅ Webhook Saved Successfully!      │            │
│    │                                       │            │
│    │  HubSpot CRM Integration is now      │            │
│    │  active and will receive all new     │            │
│    │  leads automatically.                │            │
│    │                                       │            │
│    │  [View Webhooks] [Create Another]    │            │
│    └──────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting Decision Tree

```
                  ┌─────────────────────┐
                  │  Webhook Not        │
                  │  Working?           │
                  └──────────┬──────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
     ┌──────────────────┐      ┌──────────────────┐
     │ Is webhook       │      │ Are leads being  │
     │ marked Active?   │      │ created?         │
     └────────┬─────────┘      └────────┬─────────┘
              │                         │
        ┌─────┴─────┐             ┌─────┴─────┐
        │           │             │           │
       Yes         No            Yes         No
        │           │             │           │
        ▼           ▼             ▼           ▼
     ┌──────┐   ┌──────┐      ┌──────┐   ┌──────┐
     │Continue│ │Enable│      │Continue│ │ Fix   │
     │        │ │ it   │      │        │ │ Lead  │
     └───┬────┘ └──────┘      └───┬────┘ │Creation│
         │                        │       └──────┘
         │                        │
         └────────┬───────────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │ Check Browser Console    │
     │ for webhook logs         │
     └────────────┬─────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ See "✅"     │    │ See "❌"     │
│ messages?    │    │ messages?    │
└───────┬──────┘    └───────┬──────┘
        │                   │
       Yes                 Yes
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────────┐
│ Webhook      │    │ Check error       │
│ working!     │    │ details           │
│ ✓            │    └────────┬──────────┘
└──────────────┘             │
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │ 401/403      │    │ 400 Bad      │
          │ Unauthorized │    │ Request      │
          └───────┬──────┘    └───────┬──────┘
                  │                   │
                  ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │ Check API    │    │ Check field  │
          │ key/auth     │    │ mappings     │
          │ headers      │    │              │
          └──────────────┘    └──────────────┘
```

---

## 📈 Monitoring & Success Metrics

```
┌─────────────────────────────────────────────────────────┐
│  WEBHOOK DELIVERY DASHBOARD (Future Feature)            │
│                                                           │
│  📊 Statistics (Last 30 Days)                            │
│  ─────────────────────────────────────────────          │
│  Total Webhooks Sent:     1,234                         │
│  Successful Deliveries:   1,189  (96.4%)                │
│  Failed Deliveries:          45  (3.6%)                 │
│  Average Response Time:    320ms                        │
│                                                           │
│  📈 Per Webhook Performance                              │
│  ─────────────────────────────────────────────          │
│  HubSpot CRM                                             │
│    ├─ Sent: 800                                         │
│    ├─ Success: 792 (99.0%)                              │
│    ├─ Failed: 8 (1.0%)                                  │
│    └─ Avg Response: 280ms                               │
│                                                           │
│  Mailchimp Newsletter                                    │
│    ├─ Sent: 434                                         │
│    ├─ Success: 397 (91.5%)                              │
│    ├─ Failed: 37 (8.5%)                                 │
│    └─ Avg Response: 510ms                               │
│                                                           │
│  🔔 Recent Failures                                      │
│  ─────────────────────────────────────────────          │
│  • Mailchimp: 401 Unauthorized (2 hours ago)            │
│  • HubSpot: Timeout (5 hours ago)                       │
│  • Custom API: 500 Server Error (1 day ago)             │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Common Integration Patterns

### Pattern 1: CRM Sync

```
Lead Captured
    ↓
Webhook to CRM
    ↓
Contact Created
    ↓
Sales Team Notified
    ↓
Follow-up Email Sent
```

### Pattern 2: Marketing Automation

```
Lead Captured
    ↓
Webhook to Email Service
    ↓
Added to Newsletter
    ↓
Welcome Email Sent
    ↓
Drip Campaign Started
```

### Pattern 3: Multi-Service Notification

```
Lead Captured
    ↓
┌───────┴────────┐
│                │
▼                ▼
Webhook to       Webhook to
Slack            Database
│                │
▼                ▼
Team             Data
Notified         Stored
```

---

## ✅ Quick Reference

### Webhook States

| State | Icon | Meaning |
|-------|------|---------|
| Active | ✅ | Webhook is enabled and sending |
| Inactive | ⚫ | Webhook disabled, not sending |
| Testing | 🧪 | Webhook in test mode |
| Error | ❌ | Last delivery failed |
| Success | ✓ | Last delivery succeeded |

### HTTP Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | ✅ OK | Success (common for existing resources) |
| 201 | ✅ Created | Success (resource created) |
| 400 | ❌ Bad Request | Invalid payload/missing required fields |
| 401 | ❌ Unauthorized | Invalid/missing authentication |
| 403 | ❌ Forbidden | Valid auth but insufficient permissions |
| 404 | ❌ Not Found | Endpoint doesn't exist |
| 429 | ⚠️ Too Many Requests | Rate limit exceeded |
| 500 | ❌ Server Error | External service issue |
| 503 | ⚠️ Service Unavailable | External service down |

---

**Version:** 2.2.0  
**Last Updated:** January 29, 2025  
**For:** Webhook Integration Visualization  

🎨 **Visual guide to understanding webhook flows!** 🎨
