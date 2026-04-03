# 🎯 QUICK START: Test Your Webhook RIGHT NOW!

## The Problem
You're getting: **"Webhook test failed. Check the URL and configuration."**

## The Solution (2 Minutes)

### Option 1: Test with Built-in Endpoint (EASIEST!)

**Step 1:** Go to integrations page
```
http://localhost:3000/integrations
```

**Step 2:** Click "Add Webhook" and enter:
- **Name:** `Test Webhook`
- **URL:** `http://localhost:3000/api/webhook/test-receiver`
- **Method:** `POST`
- **Headers:** Keep default (`Content-Type: application/json`)

**Step 3:** Add field mappings (click "Add Field Mapping"):
- Lead Field: `name` → Webhook Field: `firstname` ✓ Required
- Lead Field: `email` → Webhook Field: `email` ✓ Required

**Step 4:** Click "Create Webhook"

**Step 5:** Click "Test" button

**Step 6:** Check your terminal/console - you should see:
```
========================================
🎯 Test Webhook Received!
Body: { firstname: "Test User", email: "test@example.com", ... }
========================================
```

✅ **Success!** If you see this, webhooks are working!

---

### Option 2: Test with Webhook.site (For External Testing)

**Step 1:** Go to https://webhook.site
- You'll see a unique URL like: `https://webhook.site/abc-123-def`
- **Copy this URL**

**Step 2:** In FPT Chatbot integrations page:
- Name: `Webhook.site Test`
- URL: [paste the webhook.site URL]
- Method: `POST`
- Headers: `Content-Type: application/json`

**Step 3:** Add field mappings:
- `name` → `name` (required)
- `email` → `email` (required)

**Step 4:** Click "Test"

**Step 5:** Go back to webhook.site
- **You'll see the request with all your data!**

---

## What to Check if It Still Fails

### 1. Is your URL complete?
❌ Wrong: `localhost:3000/api/webhook/test-receiver`  
✅ Right: `http://localhost:3000/api/webhook/test-receiver`

### 2. Check server logs
Open the terminal where `npm run dev` is running and look for errors.

### 3. Try the manual test:
```bash
curl -X POST http://localhost:3000/api/webhook/test-receiver \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Should return:
```json
{"success": true, "message": "Webhook received successfully!", ...}
```

---

## Common Mistakes

1. **Missing `http://` or `https://` in URL**
   - Every URL must start with http:// or https://

2. **Using wrong port**
   - If server is on port 3001, use: `http://localhost:3001/...`

3. **No field mappings**
   - Add at least one field mapping

4. **Webhook not active**
   - Make sure the "Active" checkbox is checked

---

## What You'll See When It Works

### In the UI:
✅ "Webhook test successful! Check your webhook endpoint for the test data."

### In Server Logs:
```
🧪 Testing webhook: Test Webhook
Test payload: { firstname: "Test User", ... }
✅ Webhook test successful for Test Webhook (200)
```

### In webhook.site (if using):
You'll see a new request with your test data!

---

## Still Not Working?

1. **Read the full guide:** [WEBHOOK_TESTING_GUIDE.md](./WEBHOOK_TESTING_GUIDE.md)
2. **Check server console** for detailed error messages
3. **Try webhook.site first** - it always works and helps verify the system is functional

---

**Last Updated:** November 29, 2025  
**Estimated Time:** 2 minutes ⏱️
