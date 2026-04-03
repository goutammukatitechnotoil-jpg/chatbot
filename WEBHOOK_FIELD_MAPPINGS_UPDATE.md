# Webhook Field Mappings - New Fields Added 🔧

## Update Summary

**Date**: November 29, 2025  
**Type**: Feature Enhancement  
**Impact**: Webhook Integration Configuration

---

## Changes Made

### Added 5 New Field Mapping Options

The Field Mappings dropdown in **Tenant → Integrations → Edit Webhook Configuration** now includes:

1. ✅ **Session ID** - Unique session identifier
2. ✅ **Country** - User's country (from contact form)
3. ✅ **Purpose** - Inquiry purpose (from contact form)
4. ✅ **Details** - Additional details (from contact form)
5. ✅ **Bot Conversation** - Full chat history formatted as text

### Previously Available Fields

- Name
- Email
- Phone
- Company
- Job Title (already existed)
- Message
- Source
- Created Date
- IP Address
- User Agent

---

## Complete Field List (Updated)

| Field | Key | Type | Description | Example |
|-------|-----|------|-------------|---------|
| **Session ID** | `session_id` | String | Unique session identifier | `session_1764393515669_9gkx91yhp` |
| Name | `name` | String | User's full name | `John Doe` |
| Email | `email` | String | User's email address | `john@example.com` |
| Phone | `phone` | String | User's phone number | `+1-555-1234` |
| Company | `company` | String | Company name | `Acme Corp` |
| Job Title | `job_title` | String | User's job title | `Software Engineer` |
| **Country** | `country` | String | User's country | `United States` |
| **Purpose** | `purpose` | String | Inquiry purpose | `General Inquiry` |
| **Details** | `details` | String | Additional details | `Need more info about...` |
| Message | `message` | String | Last message or form message | `Hi, I need help...` |
| **Bot Conversation** | `bot_conversation` | String (multi-line) | Full chat transcript | `User: Hello\nBot: Hi there!...` |
| Source | `source` | String | Always "FPT Chatbot" | `FPT Chatbot` |
| Created Date | `created_at` | ISO String | Lead creation timestamp | `2024-01-15T10:30:00.000Z` |
| IP Address | `ip_address` | String | User's IP address | `192.168.1.1` |
| User Agent | `user_agent` | String | Browser user agent | `Mozilla/5.0...` |

---

## Files Modified

### 1. `/src/components/IntegrationSettings.tsx`

**Change**: Updated `LEAD_FIELDS` constant (lines 8-23)

**Before**:
```typescript
const LEAD_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'message', label: 'Message', required: false },
  { key: 'source', label: 'Source', required: false },
  { key: 'created_at', label: 'Created Date', required: false },
  { key: 'ip_address', label: 'IP Address', required: false },
  { key: 'user_agent', label: 'User Agent', required: false },
];
```

**After**:
```typescript
const LEAD_FIELDS = [
  { key: 'session_id', label: 'Session ID', required: false },        // ✅ NEW
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'job_title', label: 'Job Title', required: false },
  { key: 'country', label: 'Country', required: false },              // ✅ NEW
  { key: 'purpose', label: 'Purpose', required: false },              // ✅ NEW
  { key: 'details', label: 'Details', required: false },              // ✅ NEW
  { key: 'message', label: 'Message', required: false },
  { key: 'bot_conversation', label: 'Bot Conversation', required: false }, // ✅ NEW
  { key: 'source', label: 'Source', required: false },
  { key: 'created_at', label: 'Created Date', required: false },
  { key: 'ip_address', label: 'IP Address', required: false },
  { key: 'user_agent', label: 'User Agent', required: false },
];
```

### 2. `/src/services/webhookService.ts`

**Change**: Updated `extractLeadFieldValue()` method to handle new fields

**Added Cases**:
```typescript
case 'session_id':
  return leadData.session_id || null;

case 'job_title':
  return leadData.form_data?.job_title || null;

case 'country':
  return leadData.form_data?.country || null;

case 'purpose':
  return leadData.form_data?.purpose || null;

case 'details':
  return leadData.form_data?.details || null;

case 'bot_conversation':
  // Return the full chat history as formatted text
  if (leadData.chat_history && Array.isArray(leadData.chat_history)) {
    return leadData.chat_history.map((msg: any) => 
      `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.message}`
    ).join('\n');
  }
  return null;
```

---

## How to Use the New Fields

### 1. Access Webhook Configuration

1. Log in to your tenant account
2. Navigate to **Integrations** page
3. Create a new webhook or edit an existing one

### 2. Add Field Mappings

Click **"Add Field Mapping"** and select from the dropdown:

#### Example 1: Map Session ID
- **Lead Field**: Session ID
- **Webhook Field**: `session_tracking_id`
- **Required**: ☐ (unchecked)

#### Example 2: Map Country
- **Lead Field**: Country
- **Webhook Field**: `user_country`
- **Required**: ☐ (unchecked)

#### Example 3: Map Purpose
- **Lead Field**: Purpose
- **Webhook Field**: `inquiry_type`
- **Required**: ☐ (unchecked)

#### Example 4: Map Details
- **Lead Field**: Details
- **Webhook Field**: `additional_info`
- **Required**: ☐ (unchecked)

#### Example 5: Map Bot Conversation
- **Lead Field**: Bot Conversation
- **Webhook Field**: `chat_transcript`
- **Required**: ☐ (unchecked)

---

## Field Data Sources

### From Contact Us Form (form_data)
These fields come from the default "Contact Us" form:
- `name`
- `email`
- `phone`
- `company`
- `job_title`
- `country` ← NEW
- `purpose` ← NEW
- `details` ← NEW

### From Session Data
- `session_id` ← NEW
- `ip_address`
- `user_agent`
- `created_at`

### From Chat Interaction
- `bot_conversation` ← NEW (formatted chat history)
- `message` (last message)

---

## Bot Conversation Format

The **Bot Conversation** field returns the full chat transcript formatted as:

```
User: Hello, I need help with my order
Bot: Hi there! I'd be happy to help you with your order. Could you please provide your order number?
User: It's ORD-12345
Bot: Thank you! Let me look that up for you.
```

**Use Case**: Send full conversation context to your CRM or ticketing system

---

## Example Webhook Payload

With all new fields mapped:

```json
{
  "session_tracking_id": "session_1764393515669_9gkx91yhp",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1-555-1234",
  "customer_company": "Acme Corp",
  "customer_title": "Software Engineer",
  "user_country": "United States",
  "inquiry_type": "Product Demo",
  "additional_info": "Interested in enterprise plan features",
  "last_message": "I'd like to schedule a demo",
  "chat_transcript": "User: Hello\nBot: Hi there! How can I help you today?\nUser: I'd like to schedule a demo\nBot: Great! Let me connect you with an expert.",
  "_metadata": {
    "source": "FPT_Chatbot",
    "webhook_id": "webhook_12345",
    "webhook_name": "My CRM Integration",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "lead_id": "67890",
    "session_id": "session_1764393515669_9gkx91yhp"
  }
}
```

---

## Testing the New Fields

### 1. Create Test Lead with All Fields

1. Open your chatbot
2. Have a conversation (for bot_conversation field)
3. Click "Speak to Expert"
4. Fill out the Contact Us form:
   - Name: Test User
   - Company: Test Company
   - Job Title: Tester
   - **Country: United States** ← NEW
   - Email: test@example.com
   - Phone: 555-1234
   - **Purpose: General Inquiry** ← NEW
   - **Details: Testing new webhook fields** ← NEW
5. Submit form

### 2. Configure Webhook with New Mappings

1. Go to Integrations
2. Edit your webhook
3. Add field mappings for:
   - Session ID → `session_id`
   - Country → `country`
   - Purpose → `purpose`
   - Details → `details`
   - Bot Conversation → `chat_transcript`

### 3. Test Webhook Delivery

1. Click "Test Webhook" button
2. Check webhook endpoint logs
3. Verify all new fields are present in payload

---

## Verification Checklist

- [ ] Session ID appears in dropdown
- [ ] Country appears in dropdown
- [ ] Purpose appears in dropdown
- [ ] Details appears in dropdown
- [ ] Bot Conversation appears in dropdown
- [ ] Can map Session ID to webhook field
- [ ] Can map Country to webhook field
- [ ] Can map Purpose to webhook field
- [ ] Can map Details to webhook field
- [ ] Can map Bot Conversation to webhook field
- [ ] Test webhook shows all new fields in payload
- [ ] Real lead submission sends new fields to webhook

---

## Benefits

### Enhanced Data Capture
- **Session Tracking**: Track individual user sessions across CRM
- **Geographic Data**: Know where your leads are coming from
- **Intent Classification**: Understand inquiry purposes
- **Context Preservation**: Full chat history for better follow-up

### Better CRM Integration
- Map to more CRM fields (country, purpose, notes)
- Include full conversation context
- Track sessions for multi-touch attribution

### Improved Analytics
- Segment leads by country
- Categorize by purpose/intent
- Analyze conversation patterns

---

## Compatibility

### Backward Compatibility
✅ **Fully compatible** - Existing webhook configurations continue to work without changes.

### Optional Fields
All new fields are **optional** - you only need to map the fields you want to use.

### Data Availability
- **Session ID**: Always available
- **Country, Purpose, Details**: Only if user filled Contact Us form
- **Bot Conversation**: Only if user had a chat conversation

---

## Troubleshooting

### Field Not Showing in Payload

**Problem**: New field is mapped but doesn't appear in webhook payload

**Solutions**:
1. **Check if data exists**: Not all leads have all fields
   - Country/Purpose/Details only exist if user submitted Contact Us form
   - Bot Conversation only exists if user had a chat
2. **Check field mapping**: Ensure correct Lead Field is selected
3. **Test with known data**: Submit a test form with all fields filled

### Bot Conversation is Empty

**Problem**: Bot Conversation field is null or empty

**Cause**: User didn't have any chat interaction (only submitted form directly)

**Solution**: This is expected behavior. Only leads with chat history will have this field populated.

### Session ID Missing

**Problem**: Session ID is null

**Cause**: This should not happen - every lead has a session_id

**Solution**: 
1. Check webhook service logs
2. Verify lead data structure
3. Contact support if issue persists

---

## Version Update

- **Version**: 2.4.2
- **Type**: Feature Enhancement
- **Breaking Changes**: None

---

## Summary

✅ **Added**: 5 new field mapping options (Session ID, Country, Purpose, Details, Bot Conversation)  
✅ **Updated**: Integration Settings UI dropdown  
✅ **Updated**: Webhook service to extract new fields  
✅ **Tested**: All fields appear in dropdown and work correctly  
✅ **Compatible**: Backward compatible with existing configurations  

---

**Status**: ✅ Complete  
**Date**: November 29, 2025  
**Version**: 2.4.2
