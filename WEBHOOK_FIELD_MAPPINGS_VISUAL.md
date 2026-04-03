# Webhook Field Mappings - Visual Reference 📊

## Before vs After

### BEFORE (10 Fields)

```
Field Mappings Dropdown:
┌────────────────────────────────┐
│ Select Lead Field       ▼      │
├────────────────────────────────┤
│ Name                           │
│ Email                          │
│ Phone                          │
│ Company                        │
│ Message                        │
│ Source                         │
│ Created Date                   │
│ IP Address                     │
│ User Agent                     │
└────────────────────────────────┘
```

### AFTER (15 Fields) ✅

```
Field Mappings Dropdown:
┌────────────────────────────────┐
│ Select Lead Field       ▼      │
├────────────────────────────────┤
│ Session ID              ✨ NEW │
│ Name                           │
│ Email                          │
│ Phone                          │
│ Company                        │
│ Job Title                      │
│ Country                 ✨ NEW │
│ Purpose                 ✨ NEW │
│ Details                 ✨ NEW │
│ Message                        │
│ Bot Conversation        ✨ NEW │
│ Source                         │
│ Created Date                   │
│ IP Address                     │
│ User Agent                     │
└────────────────────────────────┘
```

---

## UI Screenshot Reference

### Edit Webhook Configuration Page

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Webhook Configuration                           [×]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Webhook Name                                                │
│  [My CRM Integration.........................]              │
│                                                              │
│  Webhook URL                                                 │
│  [https://crm.example.com/api/leads.......]                │
│                                                              │
│  Method: ⦿ POST  ○ PUT                                      │
│                                                              │
│  ┌─ Field Mappings ──────────────────────────────────────┐  │
│  │                                   [+ Add Field Mapping]│  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  [Session ID ▼]  →  [tracking_id....]  ☐ Required  [×]│  │
│  │                                                         │  │
│  │  [Name ▼]  →  [customer_name....]  ☑ Required      [×]│  │
│  │                                                         │  │
│  │  [Email ▼]  →  [customer_email....]  ☑ Required    [×]│  │
│  │                                                         │  │
│  │  [Country ▼]  →  [user_country....]  ☐ Required    [×]│  │
│  │                                                         │  │
│  │  [Purpose ▼]  →  [inquiry_type....]  ☐ Required    [×]│  │
│  │                                                         │  │
│  │  [Bot Conversation ▼]  →  [chat_log...]  ☐ Req.   [×]│  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│                              [Cancel]  [Test]  [Save]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Field Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  USER INTERACTION                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────────┐          ┌─────────▼────────┐
│  Chat with │          │  Fill Contact    │
│  Chatbot   │          │  Us Form         │
└───┬────────┘          └─────────┬────────┘
    │                             │
    │ Generates:                  │ Generates:
    │ • Bot Conversation          │ • Name
    │ • Session ID                │ • Email
    │ • Message                   │ • Company
    │                             │ • Job Title
    │                             │ • Country      ← NEW
    │                             │ • Purpose      ← NEW
    │                             │ • Details      ← NEW
    │                             │ • Phone
    │                             │
    └──────────────┬──────────────┘
                   │
            ┌──────▼───────┐
            │  Lead Data   │
            │  Captured    │
            └──────┬───────┘
                   │
                   │ Maps to webhook fields
                   │
            ┌──────▼───────┐
            │   Webhook    │
            │   Payload    │
            └──────────────┘
```

---

## Field Mapping Matrix

| Lead Field | Data Source | Always Available? | Example Value |
|------------|-------------|-------------------|---------------|
| **Session ID** ✨ | Session tracking | ✅ Yes | `session_1764393515669_9gkx91yhp` |
| Name | Contact form | ⭕ If form filled | `John Doe` |
| Email | Contact form | ⭕ If form filled | `john@example.com` |
| Phone | Contact form | ⭕ If form filled | `+1-555-1234` |
| Company | Contact form | ⭕ If form filled | `Acme Corp` |
| Job Title | Contact form | ⭕ If form filled | `Software Engineer` |
| **Country** ✨ | Contact form | ⭕ If form filled | `United States` |
| **Purpose** ✨ | Contact form | ⭕ If form filled | `Product Demo` |
| **Details** ✨ | Contact form | ⭕ If form filled | `Need more info...` |
| Message | Chat/Form | ⭕ If available | `I need help` |
| **Bot Conversation** ✨ | Chat history | ⭕ If chat occurred | `User: Hi\nBot: Hello!` |
| Source | System | ✅ Yes | `FPT Chatbot` |
| Created Date | System | ✅ Yes | `2024-01-15T10:30:00Z` |
| IP Address | Session info | ✅ Yes | `192.168.1.1` |
| User Agent | Session info | ✅ Yes | `Mozilla/5.0...` |

---

## Use Case Examples

### Use Case 1: Basic CRM Integration

**Goal**: Send name, email, company to CRM

```
Field Mappings:
├─ Name → customer_name (required)
├─ Email → customer_email (required)
└─ Company → company_name (optional)
```

### Use Case 2: Enhanced CRM with Geography

**Goal**: Include location data for lead segmentation

```
Field Mappings:
├─ Name → customer_name (required)
├─ Email → customer_email (required)
├─ Country → location (optional)          ← NEW
└─ Purpose → lead_source (optional)       ← NEW
```

### Use Case 3: Support Ticketing System

**Goal**: Create support ticket with full context

```
Field Mappings:
├─ Name → requester_name (required)
├─ Email → requester_email (required)
├─ Session ID → ticket_ref (optional)     ← NEW
├─ Purpose → ticket_category (optional)   ← NEW
├─ Details → ticket_description (optional) ← NEW
└─ Bot Conversation → conversation_log (optional) ← NEW
```

### Use Case 4: Analytics Platform

**Goal**: Track user journeys and behavior

```
Field Mappings:
├─ Session ID → session_tracking_id       ← NEW
├─ Country → user_location                ← NEW
├─ Purpose → user_intent                  ← NEW
├─ Bot Conversation → interaction_log     ← NEW
└─ Created Date → event_timestamp
```

---

## Bot Conversation Format Example

### Raw Chat History:
```json
[
  { "sender": "user", "message": "Hello, I need help" },
  { "sender": "bot", "message": "Hi there! How can I assist you today?" },
  { "sender": "user", "message": "I want to know about pricing" },
  { "sender": "bot", "message": "I can help with that! Let me connect you with an expert." }
]
```

### Formatted Output (sent to webhook):
```
User: Hello, I need help
Bot: Hi there! How can I assist you today?
User: I want to know about pricing
Bot: I can help with that! Let me connect you with an expert.
```

**Perfect for**: 
- Support ticket context
- CRM activity logs
- Analytics dashboards
- Email notifications

---

## Configuration Examples

### Example 1: Minimal Configuration
```
Webhook: Mailchimp
├─ Name → FNAME
├─ Email → EMAIL
└─ Country → LOCATION
```

### Example 2: Complete Configuration
```
Webhook: Salesforce
├─ Session ID → External_ID__c
├─ Name → FirstName + LastName
├─ Email → Email
├─ Phone → Phone
├─ Company → Company
├─ Job Title → Title
├─ Country → MailingCountry
├─ Purpose → Lead_Source__c
├─ Details → Description
└─ Bot Conversation → Comments__c
```

### Example 3: Custom API
```
Webhook: Custom CRM API
├─ Session ID → tracking.session_id
├─ Name → contact.full_name
├─ Email → contact.email
├─ Country → contact.address.country
├─ Purpose → lead.category
├─ Details → lead.notes
└─ Bot Conversation → lead.interaction_log
```

---

## Testing Checklist

### Visual Verification
- [ ] Open Integrations page
- [ ] Create/edit webhook
- [ ] Click "Add Field Mapping"
- [ ] Verify dropdown shows 15 fields
- [ ] Verify new fields are marked (if UI shows indicators)

### Functional Verification
- [ ] Map Session ID → test field
- [ ] Map Country → test field
- [ ] Map Purpose → test field
- [ ] Map Details → test field
- [ ] Map Bot Conversation → test field
- [ ] Save configuration
- [ ] Click "Test Webhook"
- [ ] Verify payload includes all mapped fields

### Data Verification
- [ ] Submit test lead with all fields
- [ ] Check webhook endpoint received data
- [ ] Verify Session ID format is correct
- [ ] Verify Country value matches form
- [ ] Verify Purpose value matches form
- [ ] Verify Details value matches form
- [ ] Verify Bot Conversation is formatted correctly

---

## Quick Reference Card

```
╔════════════════════════════════════════════════════════════╗
║         WEBHOOK FIELD MAPPINGS - QUICK REFERENCE           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  NEW FIELDS (5):                                          ║
║  ✨ Session ID       - Unique session identifier          ║
║  ✨ Country          - User's country                     ║
║  ✨ Purpose          - Inquiry purpose                    ║
║  ✨ Details          - Additional details                 ║
║  ✨ Bot Conversation - Full chat transcript               ║
║                                                            ║
║  TOTAL FIELDS: 15                                         ║
║                                                            ║
║  LOCATION:                                                ║
║  Tenant → Integrations → Edit Webhook → Field Mappings    ║
║                                                            ║
║  DOCUMENTATION:                                           ║
║  WEBHOOK_FIELD_MAPPINGS_UPDATE.md                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

**Version**: 2.4.2  
**Last Updated**: November 29, 2025  
**Status**: ✅ Ready to Use
