# Anonymous Session Debugging Guide

## Issue
Anonymous conversations on custom domains (e.g., `fpteu.fptchatbot.com`) are not creating session entries in the lead list.

## How It Should Work

### 1. **User Visits fpteu.fptchatbot.com**
   - Browser loads the chatbot
   - Tenant detection extracts `fpteu` from subdomain
   - Session ID is generated

### 2. **User Opens Chat**
   - Chatbot initializes
   - Session info is captured (browser, device, location)
   - API call: `POST /api/lead/session?tenantId=fpteu`
   - Session entry created in database

### 3. **User Sends Messages**
   - Each message triggers: `POST /api/lead/session?tenantId=fpteu`
   - Chat history is updated
   - Session entry is updated

## Debugging Steps

### Step 1: Check Browser Console Logs

Open the browser console (F12) when visiting `fpteu.fptchatbot.com` and look for:

```
✅ Expected logs:
🌐 Current hostname: fpteu.fptchatbot.com
📍 Tenant ID from subdomain: fpteu
📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu", ... }
✅ Session created/updated successfully: created
```

```
❌ Error logs to watch for:
⚠️ No tenant ID found - cannot create/update session
❌ Session create/update failed: 400 Bad Request
❌ Error creating/updating session: ...
```

### Step 2: Check Network Tab

1. Open Network tab in browser DevTools
2. Filter by "session"
3. Look for POST request to `/api/lead/session?tenantId=fpteu`

**What to check:**
- Request URL should include `tenantId=fpteu`
- Request body should include `session_id`
- Response should be 200 or 201
- Response should include `{ success: true, action: "created" }`

### Step 3: Check Database

Connect to MongoDB and check the tenant database:

```javascript
// Connect to the tenant database
use chatbot_fpteu;

// Check for session entries
db.leads.find({}).pretty();

// Count sessions
db.leads.countDocuments();

// Check recent sessions (last hour)
db.leads.find({
  created_at: { 
    $gte: new Date(Date.now() - 3600000).toISOString() 
  }
}).pretty();
```

### Step 4: Check Server Logs

Look for these logs in your terminal where the dev server is running:

```
Expected server logs:
POST /api/lead/session?tenantId=fpteu
Creating new session for fpteu
Session created successfully
```

## Common Issues and Fixes

### Issue 1: Tenant ID Not Detected

**Symptoms:**
- Console shows: `❌ Unable to determine tenant ID from any source`
- No API calls to `/api/lead/session`

**Causes:**
- Subdomain extraction failing
- Hostname not matching expected pattern

**Fix:**
Check the tenant detection code in `src/services/leadService.ts`:

```typescript
// This should work for fpteu.fptchatbot.com
const hostname = window.location.hostname; // Should be: fpteu.fptchatbot.com
const parts = hostname.split('.'); // Should be: ['fpteu', 'fptchatbot', 'com']
const subdomain = parts[0]; // Should be: 'fpteu'
```

**Manual override for testing:**
```javascript
// In browser console:
localStorage.setItem('detectedTenantId', 'fpteu');
// Then reload the page
```

### Issue 2: API Call Failing

**Symptoms:**
- Console shows: `❌ Session create/update failed: 400 Bad Request`
- Network tab shows 400 or 500 error

**Causes:**
- Missing tenant ID in query string
- Invalid request body
- Database connection issue

**Fix:**
1. Check the API endpoint expects `tenantId` as query param
2. Ensure request body includes `session_id`
3. Check server logs for database errors

### Issue 3: Database Not Connected

**Symptoms:**
- API returns 500 error
- Server logs: "Failed to connect to tenant database"

**Causes:**
- Tenant database doesn't exist
- MongoDB connection string incorrect
- Database name mismatch

**Fix:**
1. Verify database name matches pattern: `chatbot_<tenantId>`
2. Create database if it doesn't exist:
   ```javascript
   use chatbot_fpteu;
   db.leads.insertOne({ test: true });
   db.leads.deleteOne({ test: true });
   ```

### Issue 4: Session Created But Not Visible

**Symptoms:**
- API returns success
- Database has session entries
- Admin panel doesn't show sessions

**Causes:**
- Admin panel filtering by wrong tenant
- Date range filter excluding sessions
- Admin user doesn't have access to tenant

**Fix:**
1. Check admin panel tenant selector
2. Expand date range filter
3. Verify admin user permissions

## Testing Checklist

- [ ] Visit `fpteu.fptchatbot.com`
- [ ] Open browser console (F12)
- [ ] Check for tenant detection logs
- [ ] Open chatbot
- [ ] Check for session creation logs
- [ ] Send a message
- [ ] Check for session update logs
- [ ] Open Network tab
- [ ] Verify POST to `/api/lead/session?tenantId=fpteu`
- [ ] Check response is successful
- [ ] Open admin panel
- [ ] Switch to fpteu tenant
- [ ] Check lead list for new session

## Quick Test Script

Paste this in the browser console on `fpteu.fptchatbot.com`:

```javascript
// Test tenant detection
console.log('Testing tenant detection...');
console.log('Hostname:', window.location.hostname);
console.log('Expected tenant ID: fpteu');

// Extract tenant ID
const parts = window.location.hostname.split('.');
const detectedTenant = parts[0];
console.log('Detected tenant ID:', detectedTenant);

// Check localStorage
console.log('Stored tenant ID:', localStorage.getItem('detectedTenantId'));

// Test API endpoint
const testSession = async () => {
  const sessionId = 'test_' + Date.now();
  const response = await fetch(`/api/lead/session?tenantId=${detectedTenant}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message: 'Test message',
      sender: 'user'
    })
  });
  const result = await response.json();
  console.log('API Test Result:', result);
  return result;
};

// Run the test
testSession().then(result => {
  if (result.success) {
    console.log('✅ Session API working correctly!');
  } else {
    console.error('❌ Session API failed:', result);
  }
});
```

## Expected Flow Diagram

```
┌─────────────────────────────────────────────────┐
│  User visits fpteu.fptchatbot.com              │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Tenant Detection (leadService.ts)             │
│  - Extract subdomain: 'fpteu'                  │
│  - Store in localStorage                       │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  User Opens Chatbot                            │
│  - Generate session ID                         │
│  - Capture device/browser info                 │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  createOrUpdateSession() called                │
│  - tenantId: 'fpteu'                          │
│  - sessionId: 'session_...'                   │
│  - sessionInfo: {...}                         │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  POST /api/lead/session?tenantId=fpteu        │
│  Body: { session_id, session_info }           │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Server: leadSessionHandler                    │
│  1. Connect to chatbot_fpteu DB               │
│  2. Check if session exists                   │
│  3. Create new lead entry                     │
│  4. Return success                            │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Response: { success: true, action: "created" }│
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Session appears in Admin Panel → Leads       │
└─────────────────────────────────────────────────┘
```

## What to Report

If sessions are still not appearing, please provide:

1. **Browser console logs** (all messages, especially those starting with 🌐, 📍, 📝, ✅, or ❌)
2. **Network tab screenshot** showing the `/api/lead/session` request and response
3. **Server terminal logs** from when you open the chat and send a message
4. **Database query result** from `db.leads.find({}).limit(5).pretty()`
5. **Quick test script output** from the script above

This will help identify exactly where the flow is breaking.
