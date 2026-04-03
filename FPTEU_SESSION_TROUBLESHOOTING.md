# Troubleshooting: Anonymous Sessions on fpteu.fptchatbot.com

## Issue
When visiting `fpteu.fptchatbot.com`, anonymous chatbot conversations are not creating session entries in the lead list.

## Quick Diagnosis

### Step 1: Access the Test Page
Visit: **http://fpteu.fptchatbot.com/test-session-tracking.html**

This page will automatically:
1. Detect your tenant ID from the domain
2. Show tenant detection status
3. Allow you to test session creation
4. Display all API calls and responses

### Step 2: Run the Test Suite
1. Click **"▶️ Run Full Test Suite"**
2. Watch the console logs
3. Look for ✅ success or ❌ error indicators

## What Should Happen

### ✅ Expected Results:
```
🌐 Current hostname: fpteu.fptchatbot.com
📍 Tenant ID from subdomain: fpteu
📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu" }
✅ Session created/updated successfully: created
```

### Tenant Detection should show:
- **Detection Method**: Subdomain extraction
- **Tenant ID**: fpteu
- **Status**: ✓ Detected

### Session API Test should show:
- **API Status**: ✓ Success
- **Last Response**: created

## Common Issues & Solutions

### Issue 1: "Tenant ID Not Detected"

**Symptoms:**
- Detection Method shows "none"
- Tenant ID shows "N/A"
- Status shows "✗ Not Detected"

**Cause:** Domain name doesn't match expected pattern

**Solution:**
```javascript
// Manual override in browser console:
localStorage.setItem('detectedTenantId', 'fpteu');
location.reload();
```

### Issue 2: "API Call Returns 400 Bad Request"

**Symptoms:**
- API Status shows "✗ Failed"
- Response: "Tenant ID is required"

**Cause:** Tenant ID not being sent in query string

**Check:**
1. Open browser DevTools → Network tab
2. Look for POST to `/api/lead/session`
3. URL should include `?tenantId=fpteu`

**Solution:**
```javascript
// Test manually:
const tenantId = 'fpteu';
const sessionId = 'test_' + Date.now();

fetch(`/api/lead/session?tenantId=${tenantId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    message: 'Test',
    sender: 'user'
  })
}).then(r => r.json()).then(console.log);
```

### Issue 3: "API Call Returns 500 Internal Server Error"

**Symptoms:**
- API Status shows "✗ Error"
- Response: "Failed to connect to tenant database"

**Cause:** Tenant database `chatbot_fpteu` doesn't exist

**Solution:**
1. Connect to MongoDB
2. Create the database:
   ```javascript
   use chatbot_fpteu
   db.leads.createIndex({ session_id: 1 }, { unique: true })
   db.leads.createIndex({ created_at: -1 })
   ```

### Issue 4: "Session Created But Not Visible in Admin Panel"

**Symptoms:**
- Test page shows success
- Database has the session
- Admin panel doesn't show it

**Possible Causes:**
1. **Wrong tenant selected in admin panel**
   - Solution: Check tenant selector, make sure "fpteu" is selected

2. **Date range filter excluding the session**
   - Solution: Expand date range to "All time"

3. **Admin user doesn't have access to fpteu tenant**
   - Solution: Log in as fpteu tenant owner or Super Admin

## Server-Side Debugging

### Check Server Logs

When you run the test, you should see these logs in your terminal:

```
[Session API] POST request for tenant: fpteu
[Session API] Connecting to tenant database: chatbot_fpteu
[Session API] ✅ Connected to tenant database successfully
[Session API] POST request - Session: test_..., Message: Test message..., Sender: user
[Session API] Existing lead found: false
[Session API] Creating new lead for session: test_...
[Session API] Inserting new lead with data: { session_id: "test_...", date: "2025-11-29", ... }
[Session API] ✅ Created new lead with ID: 673e...
```

### If You See Errors:

**Error: "Failed to connect to tenant database"**
```bash
# Check MongoDB connection
mongosh "mongodb+srv://your-connection-string"

# List databases
show dbs

# If chatbot_fpteu doesn't exist:
use chatbot_fpteu
db.leads.insertOne({ test: true })
db.leads.deleteOne({ test: true })
```

**Error: "Duplicate key error"**
```javascript
// Session already exists, this is actually OK
// The API should update it instead of creating new one
```

## Manual Database Check

### Connect to MongoDB and verify:

```javascript
// Switch to tenant database
use chatbot_fpteu;

// Check if sessions exist
db.leads.find({}).pretty();

// Count total sessions
db.leads.countDocuments();

// Check recent sessions (last hour)
const oneHourAgo = new Date(Date.now() - 3600000);
db.leads.find({
  created_at: { $gte: oneHourAgo.toISOString() }
}).pretty();

// Check for specific session ID
db.leads.findOne({ session_id: "test_1732896000000" });
```

### Expected Lead Document Structure:

```json
{
  "_id": ObjectId("..."),
  "session_id": "test_1732896000000",
  "date": "2025-11-29",
  "chat_history": [
    {
      "id": "user-1732896000000-...",
      "sender": "user",
      "message": "Test message",
      "timestamp": "2025-11-29T10:00:00.000Z"
    }
  ],
  "form_data": {
    "name": "Anonymous User",
    "purpose": "Chat Only"
  },
  "last_message": "Test message",
  "session_info": {
    "userAgent": "...",
    "language": "en-US",
    "platform": "MacIntel",
    ...
  },
  "created_at": "2025-11-29T10:00:00.000Z",
  "updated_at": "2025-11-29T10:00:00.000Z"
}
```

## Using the Real Chatbot

After verifying the test page works, try the real chatbot:

1. Visit: `http://fpteu.fptchatbot.com`
2. Open browser console (F12)
3. Click the chatbot icon to open it
4. Look for these logs:
   ```
   🌐 Current hostname: fpteu.fptchatbot.com
   📍 Tenant ID from subdomain: fpteu
   Initializing chat...
   📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu", ... }
   ✅ Session created/updated successfully: created
   ```

5. Send a test message
6. You should see:
   ```
   📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu", message: "your message" }
   ✅ Session created/updated successfully: updated
   ```

7. Check the admin panel:
   - Go to: `http://localhost:3000/leads`
   - Select tenant: "fpteu"
   - You should see your session in the list

## Still Not Working?

### Collect Diagnostic Information

Run this script in the browser console:

```javascript
console.log('=== DIAGNOSTIC INFORMATION ===');
console.log('URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
console.log('Detected Tenant:', localStorage.getItem('detectedTenantId'));

// Test tenant detection
const parts = window.location.hostname.split('.');
console.log('Hostname parts:', parts);
console.log('Extracted tenant:', parts[0]);

// Test API connectivity
fetch('/api/lead/session?tenantId=fpteu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'diagnostic_' + Date.now(),
    message: 'Diagnostic test',
    sender: 'user'
  })
})
.then(r => {
  console.log('API Response Status:', r.status);
  return r.json();
})
.then(data => console.log('API Response Data:', data))
.catch(err => console.error('API Error:', err));
```

### Share This Information:

1. **Browser Console Logs** (full output)
2. **Network Tab** (screenshot of failed request)
3. **Server Terminal Logs** (during the test)
4. **Diagnostic Script Output**
5. **MongoDB Query Results** (`db.leads.find({}).limit(1)`)

This will help identify exactly where the flow is breaking.

## Expected Flow (For Reference)

```
User visits fpteu.fptchatbot.com
           ↓
Tenant detection extracts "fpteu" from subdomain
           ↓
Stored in localStorage
           ↓
User opens chatbot
           ↓
Session ID generated
           ↓
createOrUpdateSession('session_...') called
           ↓
POST /api/lead/session?tenantId=fpteu
           ↓
Server connects to chatbot_fpteu database
           ↓
Checks if session exists
           ↓
Creates new lead entry
           ↓
Returns { success: true, action: "created" }
           ↓
Session appears in admin panel
```

## Quick Fixes

### Reset Everything:
```javascript
// Clear all cached data
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Tenant ID:
```javascript
// Set tenant ID manually
localStorage.setItem('detectedTenantId', 'fpteu');
location.reload();
```

### Test Without Cache:
```javascript
// Open in incognito/private window
// Or clear cache and hard reload: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

## Verification Checklist

- [ ] Test page loads at fpteu.fptchatbot.com/test-session-tracking.html
- [ ] Tenant ID detected as "fpteu"
- [ ] Test suite runs successfully
- [ ] Session API returns success
- [ ] Database has the session entry
- [ ] Admin panel shows the session
- [ ] Real chatbot creates sessions
- [ ] Messages update the session

If all items are checked ✅, the system is working correctly!
