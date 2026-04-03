# 🔧 Webhook Testing & Debugging Guide

## Quick Start: Test Your Webhook Now!

### Option 1: Use Built-in Test Endpoint (Recommended for Testing)

1. **Access integrations page:**
   ```
   http://localhost:3000/integrations
   ```

2. **Create a new webhook with these settings:**
   ```
   Name: Test Webhook
   URL: http://localhost:3000/api/webhook/test-receiver
   Method: POST
   Headers: (keep default "Content-Type: application/json")
   
   Field Mappings:
   - name → firstname (required)
   - email → email (required)
   - phone → phone (optional)
   ```

3. **Click "Test" button**
   - Should see: ✅ "Webhook test successful!"
   - Check your terminal/console for the received data

4. **Check server logs:**
   - You should see something like:
   ```
   ========================================
   🎯 Test Webhook Received!
   Timestamp: 2025-11-29T...
   Body: { firstname: "Test User", email: "test@example.com", ... }
   ========================================
   ```

---

### Option 2: Use webhook.site (For External Testing)

1. **Get a test URL:**
   - Go to https://webhook.site
   - Copy the unique URL (e.g., `https://webhook.site/abc-123-def`)

2. **Create webhook in FPT Chatbot:**
   ```
   Name: Webhook.site Test
   URL: [paste your webhook.site URL]
   Method: POST
   Headers: Content-Type: application/json
   
   Field Mappings:
   - name → firstname
   - email → email
   ```

3. **Click "Test"**
   - Go back to webhook.site
   - You should see the request with all the data!

---

## Common Issues & Solutions

### ❌ Issue: "Webhook test failed. Check the URL and configuration."

#### **Possible Causes:**

1. **Invalid URL**
   ```
   ❌ Wrong: "localhost:3000/api/webhook/test"
   ✅ Right: "http://localhost:3000/api/webhook/test-receiver"
   ```

2. **Webhook endpoint is down**
   - Test the URL manually:
   ```bash
   curl -X POST YOUR_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

3. **HTTPS certificate issues** (for external URLs)
   - Ensure the webhook URL has valid SSL certificate
   - Self-signed certificates may fail

4. **Missing required headers**
   - Always include `Content-Type: application/json`
   - Add any authentication headers required by the service

5. **Timeout**
   - Webhook endpoint is too slow
   - Network connectivity issues

---

## Step-by-Step Debugging

### 1. Check Server Logs

**Open your terminal where `npm run dev` is running**

Look for these log messages:

✅ **Success:**
```
🧪 Testing webhook: Your Webhook Name
Webhook URL: http://localhost:3000/api/webhook/test-receiver
Webhook method: POST
🧪 Testing webhook Your Webhook Name (http://localhost:3000/...)
Test payload: { ... }
✅ Webhook test successful for Your Webhook Name (200)
```

❌ **Failure:**
```
🧪 Testing webhook: Your Webhook Name
❌ Webhook test failed for Your Webhook Name: { status: 404, ... }
```

### 2. Test the Webhook URL Manually

```bash
# Test if the webhook endpoint is accessible
curl -v -X POST http://localhost:3000/api/webhook/test-receiver \
  -H "Content-Type: application/json" \
  -d '{"test": "manual test"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook received successfully!",
  "received_at": "2025-11-29T...",
  "data": { "test": "manual test" }
}
```

### 3. Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Click "Test" on your webhook
4. Look for error messages

### 4. Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Test" on your webhook
4. Look for the request to `/api/integrations/test-webhook`
5. Check:
   - Request payload
   - Response status
   - Response body

---

## Testing Different Services

### Test with webhook.site

**Step 1:** Get URL from https://webhook.site

**Step 2:** Create webhook:
```json
{
  "name": "Webhook.site Test",
  "url": "https://webhook.site/YOUR-UNIQUE-ID",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "fieldMappings": [
    { "leadField": "name", "webhookField": "name", "required": true },
    { "leadField": "email", "webhookField": "email", "required": true }
  ]
}
```

**Step 3:** Click "Test" and check webhook.site for the request

### Test with RequestBin

**Step 1:** Create bin at https://requestbin.com

**Step 2:** Use the bin URL in your webhook configuration

**Step 3:** Test and view request details

### Test with Pipedream

**Step 1:** Create endpoint at https://pipedream.com

**Step 2:** Use Pipedream URL

**Step 3:** View request and trigger workflows

---

## Webhook URL Examples

### ✅ Valid URLs:

```
http://localhost:3000/api/webhook/test-receiver
https://webhook.site/abc-123-def-456
https://api.example.com/webhooks/leads
https://hooks.slack.com/services/T00/B00/XXX
https://api.hubspot.com/contacts/v1/contact
```

### ❌ Invalid URLs:

```
localhost:3000/api/webhook           # Missing http://
www.example.com/webhook              # Missing https://
/api/webhook                         # Relative URL
example.com                          # Not a full URL
```

---

## Expected Webhook Payload

When you test or trigger a webhook, this is what gets sent:

```json
{
  "firstname": "Test User",
  "email": "test@example.com",
  "phone": "+1234567890",
  "company": "Test Company",
  "_metadata": {
    "source": "FPT_Chatbot",
    "webhook_id": "wh_1234567890",
    "webhook_name": "Your Webhook Name",
    "timestamp": "2025-11-29T10:00:00Z",
    "test": true,
    "session_id": "test_session_1234567890"
  }
}
```

---

## Troubleshooting Checklist

### Before Testing:

- [ ] Webhook URL is complete and valid (starts with http:// or https://)
- [ ] Content-Type header is set to "application/json"
- [ ] At least one field mapping is configured
- [ ] Webhook is marked as "Active"

### If Test Fails:

1. [ ] Check server console logs for detailed error
2. [ ] Test webhook URL manually with curl
3. [ ] Verify URL is accessible (not blocked by firewall)
4. [ ] Check if authentication headers are correct
5. [ ] Try using webhook.site first to verify it works
6. [ ] Check browser console for JavaScript errors

### For External Services:

1. [ ] API key is valid and not expired
2. [ ] API endpoint URL is correct
3. [ ] Required fields are properly mapped
4. [ ] Authentication header format is correct
5. [ ] Service accepts POST requests with JSON body

---

## Quick Tests

### 1. Test Built-in Endpoint

```bash
curl -X POST http://localhost:3000/api/webhook/test-receiver \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "test": true
  }'
```

**Expected:** Success response with 200 status

### 2. Test Your Webhook Configuration

Via UI:
1. Go to http://localhost:3000/integrations
2. Find your webhook
3. Click "Test"
4. Check logs

### 3. Test Real Lead Capture

1. Go to http://localhost:3000
2. Open chatbot
3. Fill and submit a form
4. Check if webhook receives the lead data

---

## Server Logs Reference

### Successful Test:

```
🧪 Testing webhook: Test Webhook
Webhook URL: http://localhost:3000/api/webhook/test-receiver
Webhook method: POST
🧪 Testing webhook Test Webhook (http://localhost:3000/api/webhook/test-receiver)
Test payload: {
  "firstname": "Test User",
  "email": "test@example.com",
  ...
}
========================================
🎯 Test Webhook Received!
Timestamp: 2025-11-29T10:00:00Z
Body: { ... }
========================================
✅ Webhook test successful for Test Webhook (200)
Response: {"success":true,...}
```

### Failed Test:

```
🧪 Testing webhook: Test Webhook
Webhook URL: http://invalid-url.com/webhook
❌ Webhook test failed for Test Webhook: {
  status: 404,
  statusText: 'Not Found',
  error: 'Endpoint not found'
}
```

---

## Integration Examples

### Example 1: Test with Built-in Receiver

```json
{
  "name": "Local Test",
  "url": "http://localhost:3000/api/webhook/test-receiver",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "fieldMappings": [
    { "leadField": "name", "webhookField": "name", "required": true },
    { "leadField": "email", "webhookField": "email", "required": true },
    { "leadField": "phone", "webhookField": "phone", "required": false }
  ],
  "isActive": true
}
```

### Example 2: Webhook.site

```json
{
  "name": "Webhook.site Test",
  "url": "https://webhook.site/YOUR-UNIQUE-ID",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "fieldMappings": [
    { "leadField": "name", "webhookField": "contact_name", "required": true },
    { "leadField": "email", "webhookField": "contact_email", "required": true }
  ],
  "isActive": true
}
```

### Example 3: Slack Webhook

```json
{
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/services/T00/B00/XXX",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "fieldMappings": [
    { "leadField": "name", "webhookField": "text", "required": true }
  ],
  "isActive": true
}
```

---

## Need More Help?

1. **Check documentation:**
   - [WEBHOOK_EXPLANATION.md](./WEBHOOK_EXPLANATION.md)
   - [WEBHOOK_FIXES.md](./WEBHOOK_FIXES.md)
   - [WEBHOOK_VISUAL_GUIDE.md](./WEBHOOK_VISUAL_GUIDE.md)

2. **Check server logs:**
   - Look at terminal where `npm run dev` is running
   - Check for error messages and stack traces

3. **Test manually:**
   - Use curl or Postman to test webhook endpoint
   - Verify it accepts POST requests with JSON

4. **Use test services:**
   - webhook.site - Free, instant webhook testing
   - requestbin.com - HTTP request inspection
   - pipedream.com - Webhook workflows

---

## Quick Reference

| Issue | Solution |
|-------|----------|
| "Webhook test failed" | Check server logs for detailed error |
| URL not accessible | Test with curl, verify URL is complete |
| 401/403 errors | Check API key and auth headers |
| 404 errors | Verify URL is correct |
| Timeout | Check if service is down, reduce payload size |
| CORS errors | Use server-side test (already implemented) |
| No data received | Check field mappings, verify webhook is active |

---

**Last Updated:** November 29, 2025  
**Status:** Ready for Testing 🧪
