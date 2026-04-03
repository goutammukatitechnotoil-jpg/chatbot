# Deep Dive: Session Not Visible Despite Messages

## Issue Clarification

**Session ID:** `session_1764393515669_9gkx91yhp`  
**Status:** Messages WERE sent by user, but session is STILL not visible in Lead List

This indicates the issue is NOT the filter logic, but something else is preventing the session from appearing.

## Possible Root Causes

### 1. Session Not in Database at All

**Most Likely Cause:** The session creation API call is failing silently.

**Check:**
```javascript
// In browser console on fpteu.fptchatbot.com
// Look for these logs when you open chatbot and send messages:
// ✅ Should see:
📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu", ... }
✅ Session created/updated successfully: created

// ❌ If you see:
⚠️ No tenant ID found - cannot create/update session
❌ Session create/update failed: 400 Bad Request
❌ Error creating/updating session: ...
```

**Action:** Check your browser console for these specific error messages.

### 2. Wrong Tenant Database

**Possible:** Session was created in a different tenant's database.

**Check:**
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
console.log('Current User Tenant:', user.tenantId);
console.log('Detected Tenant:', localStorage.getItem('detectedTenantId'));

// They should BOTH be 'fpteu'
```

**MongoDB Check:**
```javascript
// Check if session exists in fpteu database
use chatbot_fpteu;
db.leads.findOne({ session_id: "session_1764393515669_9gkx91yhp" });

// If null, check other databases
show dbs;
// Check each chatbot_* database
```

### 3. API Call Not Being Made

**Possible:** The chatbot component is not calling `createOrUpdateSession`.

**Check browser Network tab:**
- Filter by "session"
- Look for POST requests to `/api/lead/session?tenantId=fpteu`
- Should see one when chat opens, and one for each message

**If no requests:**
- Session tracking is not working at all
- Check if `leadService.createOrUpdateSession` is being called
- Check for JavaScript errors preventing the call

### 4. Authentication Issue

**Possible:** The API is rejecting anonymous sessions.

**Check server logs:**
```
[Session API] POST request for tenant: fpteu
❌ Tenant ID is required
// OR
❌ Failed to connect to tenant database
```

**Action:** Look at your terminal where `npm run dev` is running.

### 5. Database Connection Failure

**Possible:** The database connection is failing but not showing an error.

**Check:**
```javascript
// Server-side - add to /pages/api/lead/session.ts temporarily
console.log('Database name:', db.databaseName);
console.log('Collection exists:', await db.listCollections({name: 'leads'}).hasNext());
```

### 6. Silent Insert Failure

**Possible:** The insert operation fails but doesn't throw an error.

**Check server logs for:**
```
[Session API] Inserting new lead with data: ...
[Session API] ✅ Created new lead with ID: 673e...
```

**If you see the insert log but no success log:**
- The insert is failing
- Check for unique index violations
- Check for schema validation errors

## Debugging Steps

### Step 1: Enable Maximum Logging

Add this to your browser console on fpteu.fptchatbot.com:

```javascript
// Override console to capture all logs
const originalLog = console.log;
const originalError = console.error;
const logs = [];

console.log = function(...args) {
  logs.push({type: 'log', time: new Date().toISOString(), args});
  originalLog.apply(console, args);
};

console.error = function(...args) {
  logs.push({type: 'error', time: new Date().toISOString(), args});
  originalError.apply(console, args);
};

// After using chatbot, dump all logs
setTimeout(() => {
  console.log('=== ALL LOGS ===');
  logs.forEach(l => {
    console.log(`[${l.type}] ${l.time}:`, ...l.args);
  });
}, 30000); // After 30 seconds
```

### Step 2: Monitor Network Requests

```javascript
// In browser console
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('session')) {
    console.log('🌐 FETCH SESSION API:', args);
    return originalFetch.apply(this, args).then(response => {
      console.log('📥 RESPONSE:', response.status, response.statusText);
      return response.clone().json().then(data => {
        console.log('📦 DATA:', data);
        return response;
      });
    });
  }
  return originalFetch.apply(this, args);
};
```

### Step 3: Direct API Test

Test the session API directly:

```javascript
// In browser console on fpteu.fptchatbot.com
const testSession = async () => {
  const sessionId = 'test_' + Date.now();
  console.log('Testing with session ID:', sessionId);
  
  const response = await fetch('/api/lead/session?tenantId=fpteu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message: 'Test message at ' + new Date().toISOString(),
      sender: 'user'
    })
  });
  
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Response:', data);
  
  if (data.success) {
    console.log('✅ API works! Session created:', sessionId);
    console.log('Now check if it appears in lead list...');
    
    // Wait 2 seconds then check
    setTimeout(async () => {
      const checkResponse = await fetch('/api/lead?sessionId=' + sessionId);
      const checkData = await checkResponse.json();
      
      if (checkData.data) {
        console.log('✅ Session found via API!');
        console.log(checkData.data);
      } else {
        console.log('❌ Session NOT found via API');
      }
      
      // Also check lead list
      const listResponse = await fetch('/api/lead');
      const listData = await listResponse.json();
      const found = listData.data.find(l => l.session_id === sessionId);
      
      if (found) {
        console.log('✅ Session in lead list!');
      } else {
        console.log('❌ Session NOT in lead list');
        console.log('Total leads:', listData.data.length);
        console.log('Recent session IDs:', listData.data.slice(0, 5).map(l => l.session_id));
      }
    }, 2000);
  } else {
    console.log('❌ API failed:', data);
  }
};

testSession();
```

### Step 4: Check Admin Panel Authentication

```javascript
// In browser console on admin panel (localhost:3000/leads)
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Logged in as:', user);
console.log('Tenant ID:', user?.tenantId);

// Verify you're viewing the right tenant
if (user?.tenantId !== 'fpteu') {
  console.log('❌ YOU ARE VIEWING THE WRONG TENANT!');
  console.log('Expected: fpteu');
  console.log('Actual:', user?.tenantId);
}
```

## Checklist for Diagnosis

Please check and report:

- [ ] **Browser console logs** when opening chatbot (on fpteu.fptchatbot.com)
- [ ] **Network tab** - POST to `/api/lead/session?tenantId=fpteu` - Status? Response?
- [ ] **Server terminal logs** - Any `[Session API]` logs? Errors?
- [ ] **MongoDB database** - Does `chatbot_fpteu` exist? Does `leads` collection exist?
- [ ] **Session in DB** - Run: `db.leads.findOne({session_id: "session_1764393515669_9gkx91yhp"})`
- [ ] **Admin panel tenant** - Are you logged in viewing tenant `fpteu`?
- [ ] **Lead list total** - How many leads show in the list?
- [ ] **Date filter** - Is "All time" or appropriate range selected?

## Most Likely Scenarios

### Scenario A: Session API Never Called
**Symptoms:**
- No POST to `/api/lead/session` in Network tab
- No `[Session API]` logs in terminal
- No browser console logs about session creation

**Cause:** JavaScript error or conditional preventing the call

**Fix:** Check browser console for errors

### Scenario B: API Called but Failed
**Symptoms:**
- POST to `/api/lead/session` shows 400/500 error
- Server logs show error message
- Browser console shows error

**Cause:** Missing tenant ID, database connection issue, or validation error

**Fix:** Check server logs for specific error

### Scenario C: Session Created in Wrong Tenant
**Symptoms:**
- API returns success
- Server logs show success
- Session exists in database but in different tenant

**Cause:** Tenant detection failing or using wrong tenant ID

**Fix:** Verify `tenantId` parameter in API call

### Scenario D: Session Created but Filtered Out (UNLIKELY given you sent messages)
**Symptoms:**
- Session exists in DB
- Has chat_history with messages
- Still not in lead list

**Cause:** Very restrictive filter or data format issue

**Fix:** Check filter logic and data structure

## Next Steps

**Please provide:**

1. **Screenshot of browser console** (on fpteu.fptchatbot.com after sending message)
2. **Screenshot of Network tab** (showing the /api/lead/session request)
3. **Server terminal output** (around the time you sent the message)
4. **MongoDB query result:**
   ```javascript
   use chatbot_fpteu;
   db.leads.findOne({session_id: "session_1764393515669_9gkx91yhp"});
   ```
5. **Results from the Direct API Test** (Step 3 above)

This will help me pinpoint exactly where the problem is occurring.
