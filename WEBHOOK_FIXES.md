# 🔧 Webhook Integration Fixes

## Issues Resolved

This document explains the issues that were preventing webhooks from working and the fixes that were implemented.

**Date:** November 29, 2025  
**Status:** ✅ Fixed and Tested

---

## 🐛 Problems Identified

### **Problem 1: CORS Error on Webhook Test**

**Symptom:**
```
Error: "Webhook test failed. Check the URL and configuration."
```

**Root Cause:**
The webhook test function (`WebhookService.testWebhook()`) was making a `fetch()` call directly from the **browser** to external webhook URLs. This caused **Cross-Origin Resource Sharing (CORS)** errors because:

1. External APIs often don't allow requests from browser origins (e.g., `http://localhost:3000`)
2. Browsers block cross-origin requests for security reasons
3. The webhook endpoint expects requests from a server, not a browser

**Code Location:**
- `/src/services/webhookService.ts` - `testWebhook()` method
- `/src/components/IntegrationSettings.tsx` - calling client-side test

---

### **Problem 2: Leads Not Triggering Webhooks**

**Symptom:**
```
Create a new Lead with session ID session_1764354916267_4cm69ydvo, 
but still not pushed to webhook
```

**Root Cause:**
In `/pages/api/lead/index.ts`, the webhook service was receiving `null` as the database connection:

```typescript
// BEFORE (BROKEN):
WebhookService.sendToWebhooksServer(createdLead, null as any)
```

This meant the webhook service couldn't fetch the webhook configurations from the database because it had no database access.

**Code Location:**
- `/pages/api/lead/index.ts` - Line ~107

---

### **Problem 3: Missing Tenant Database Connection**

**Root Cause:**
The webhook service needs the tenant's database connection to:
1. Fetch active webhook configurations
2. Read field mappings
3. Determine which webhooks to trigger

Without the database connection, the service would silently fail to send webhooks.

---

## ✅ Solutions Implemented

### **Solution 1: Server-Side Webhook Testing**

**What Was Done:**

1. **Created new API endpoint** `/api/integrations/test-webhook.ts`:
   ```typescript
   // This endpoint handles webhook testing from the server
   // Avoids CORS issues completely
   ```

2. **Added new method** `testWebhookServer()` to `WebhookService`:
   ```typescript
   static async testWebhookServer(webhook: any, sampleLeadData?: any): Promise<boolean>
   ```
   - Runs on the server (Node.js)
   - No CORS restrictions
   - Better error logging
   - Returns detailed test results

3. **Updated UI component** to use server-side test:
   ```typescript
   // IntegrationSettings.tsx
   const response = await fetch('/api/integrations/test-webhook', {
     method: 'POST',
     body: JSON.stringify({ webhook })
   });
   ```

**Flow Now:**
```
Browser (Click "Test")
    ↓
POST /api/integrations/test-webhook
    ↓
Server-side WebhookService.testWebhookServer()
    ↓
External Webhook URL (no CORS!)
    ↓
Success/Failure response to browser
```

---

### **Solution 2: Fixed Database Connection for Webhooks**

**What Was Done:**

Updated `/pages/api/lead/index.ts` to provide proper database connection:

```typescript
// AFTER (FIXED):
const tenantDb = await multiTenantDB.connectToTenant(tenantId);
WebhookService.sendToWebhooksServer(createdLead, tenantDb).catch(error => {
  console.error('Webhook delivery error (non-blocking):', error);
});
```

**Key Changes:**
- Get tenant database using `connectToTenant(tenantId)`
- Pass the database connection to webhook service
- Webhook service can now fetch webhook configurations
- Webhooks will be triggered on lead creation

---

### **Solution 3: Enhanced Error Logging**

**What Was Done:**

Added comprehensive logging to `testWebhookServer()`:

```typescript
console.log(`🧪 Testing webhook ${webhook.name} (${webhook.url})`);
console.log('Test payload:', JSON.stringify(payload, null, 2));

if (success) {
  console.log(`✅ Webhook test successful (${response.status})`);
  console.log('Response:', responseText);
} else {
  console.error(`❌ Webhook test failed:`, {
    status: response.status,
    statusText: response.statusText,
    error: errorText
  });
}
```

**Benefits:**
- See exactly what data is being sent
- View webhook endpoint responses
- Easier debugging when webhooks fail
- Clear success/failure indicators

---

## 🎯 How It Works Now

### **Testing a Webhook:**

1. User clicks **"Test"** button on a webhook in the UI
2. Browser sends request to `/api/integrations/test-webhook` API
3. Server-side code:
   - Creates sample lead data
   - Maps fields according to webhook configuration
   - Sends HTTP request to webhook URL (no CORS!)
   - Returns success/failure to browser
4. UI shows success or error message

### **Lead Capture Triggering Webhooks:**

1. User submits form in chatbot
2. Lead is created via `POST /api/lead`
3. Lead is saved to MongoDB
4. Code gets tenant database connection
5. `WebhookService.sendToWebhooksServer()` is called:
   - Fetches all active webhooks from database
   - For each webhook:
     - Maps lead data to webhook fields
     - Sends HTTP POST/PUT to webhook URL
     - Logs success/failure
6. Lead creation response sent to user (doesn't wait for webhooks)

---

## 📝 Files Modified

### **New Files:**
1. **`/pages/api/integrations/test-webhook.ts`**
   - Server-side webhook test endpoint
   - Handles CORS-free testing
   - Returns detailed test results

### **Modified Files:**
1. **`/src/services/webhookService.ts`**
   - Added `testWebhookServer()` method
   - Enhanced error logging
   - Better test data generation

2. **`/pages/api/lead/index.ts`**
   - Fixed database connection for webhook service
   - Now properly passes tenant database
   - Webhooks will trigger on lead creation

3. **`/src/components/IntegrationSettings.tsx`**
   - Updated to use server-side test API
   - Better error handling
   - Removed unused imports

---

## 🧪 Testing the Fixes

### **Test Webhook Functionality:**

1. **Create a test webhook:**
   - Go to `http://localhost:3000/integrations`
   - Click "Add Webhook"
   - Use this test URL: `https://webhook.site` (get a unique URL)
   - Configure field mappings:
     - `name` → `firstname`
     - `email` → `email`
   - Save

2. **Test the webhook:**
   - Click "Test" button
   - Should see: ✅ "Webhook test successful!"
   - Check webhook.site to see the received data

3. **Test lead creation:**
   - Go to your chatbot (`http://localhost:3000`)
   - Fill out a form and submit
   - Check webhook.site - you should see the lead data!
   - Check browser console - you should see:
     ```
     🚀 Sending webhook to [Your Webhook Name]
     ✅ Webhook delivered successfully (200)
     ```

### **Test with Real Services:**

**HubSpot Example:**
```json
{
  "name": "HubSpot CRM",
  "url": "https://api.hubspot.com/contacts/v1/contact",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_HUBSPOT_API_KEY"
  },
  "fieldMappings": [
    { "leadField": "email", "webhookField": "email", "required": true },
    { "leadField": "name", "webhookField": "firstname", "required": true }
  ]
}
```

**Slack Example:**
```json
{
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "fieldMappings": [
    { "leadField": "name", "webhookField": "text", "required": true }
  ]
}
```

---

## 🔍 Debugging Tips

### **If Webhook Test Fails:**

1. **Check the webhook URL:**
   - Must be a valid HTTPS URL (HTTP may work for localhost)
   - Must be publicly accessible
   - Cannot be `localhost` unless running locally

2. **Check server console logs:**
   ```bash
   # Look for:
   🧪 Testing webhook [Name] (https://...)
   Test payload: { ... }
   ✅ Webhook test successful (200)
   # OR
   ❌ Webhook test failed: { status: 401, ... }
   ```

3. **Check authentication:**
   - Verify API keys in headers
   - Check authorization format (Bearer, Basic, etc.)
   - Ensure keys are not expired

4. **Check field mappings:**
   - Ensure required fields are mapped
   - Verify field names match external service expectations
   - Check for typos in webhook field names

### **If Leads Don't Trigger Webhooks:**

1. **Verify webhook is active:**
   - Check `isActive: true` in webhook configuration
   - Look for green "Active" badge in UI

2. **Check server logs when lead is created:**
   ```bash
   # Look for:
   [Webhook] Fetching active webhooks...
   [Webhook] Found 2 active webhooks
   🚀 Sending webhook to [Name]
   ✅ Webhook delivered successfully (200)
   ```

3. **Verify lead was created:**
   - Go to `/leads` page
   - Check if lead appears in the list
   - Verify it has form data (email, name, etc.)

4. **Check database connection:**
   - Look for errors about database connection
   - Ensure tenant exists and is active

---

## 🎉 Summary

### **Before:**
❌ Webhook tests failed due to CORS  
❌ Leads didn't trigger webhooks  
❌ No database connection for webhook service  

### **After:**
✅ Webhook tests work via server-side API  
✅ Leads properly trigger webhooks  
✅ Database connection provided to webhook service  
✅ Comprehensive error logging  
✅ Better debugging capabilities  

---

## 📚 Related Documentation

- [WEBHOOK_EXPLANATION.md](./WEBHOOK_EXPLANATION.md) - Complete webhook guide
- [WEBHOOK_VISUAL_GUIDE.md](./WEBHOOK_VISUAL_GUIDE.md) - Visual diagrams
- [README.md](./README.md#webhook-integration) - Project documentation

---

**All webhook issues are now resolved! 🎉**

Webhooks will now:
- ✅ Test successfully via server-side API
- ✅ Trigger when leads are created
- ✅ Send properly formatted data to external services
- ✅ Provide detailed logging for debugging
