# Session Tracking Debugging - Summary of Changes

## Issue Reported
**User:** "I used Tenant fpteu.fptchatbot.com, i dont see any session ID entries for anonymous conversations on chatbot."

## Root Cause Analysis

The issue could be caused by several factors:
1. Tenant ID not being detected from the domain
2. Session API not being called correctly
3. Database connection issues
4. Sessions being created but not visible due to filtering

## Solutions Implemented

### 1. Enhanced Server-Side Logging (`/pages/api/lead/session.ts`)

Added comprehensive logging to help diagnose the issue:

```typescript
// Added logs for:
- Request method and tenant ID
- Database connection status
- Session data being processed
- Whether session exists or is new
- Insert/update operations
- Success/failure states
```

**Benefits:**
- Server terminal will show exactly what's happening with each API call
- Easy to identify where the flow breaks
- Detailed error messages if something fails

**Example logs you'll see:**
```
[Session API] POST request for tenant: fpteu
[Session API] Connecting to tenant database: chatbot_fpteu
[Session API] ✅ Connected to tenant database successfully
[Session API] POST request - Session: session_..., Message: Hello, Sender: user
[Session API] Existing lead found: false
[Session API] Creating new lead for session: session_...
[Session API] ✅ Created new lead with ID: 673e...
```

### 2. Interactive Test Page (`/public/test-session-tracking.html`)

Created a comprehensive testing tool that:

**Features:**
- ✅ Automatic tenant detection from domain
- ✅ Visual status indicators
- ✅ One-click API testing
- ✅ Real-time console logs
- ✅ Full test suite automation
- ✅ Detailed error reporting

**How to Use:**
1. Visit: `http://fpteu.fptchatbot.com/test-session-tracking.html`
2. Click "Run Full Test Suite"
3. Watch the results in real-time
4. Check the console logs for detailed information

**What It Tests:**
- Tenant ID detection from domain
- Session creation API
- Session update API
- API connectivity
- Error handling

### 3. Debugging Documentation

Created two comprehensive guides:

#### `ANONYMOUS_SESSION_DEBUGGING.md`
- General debugging guide for all anonymous session issues
- Step-by-step troubleshooting process
- Common issues and solutions
- Console test scripts
- Flow diagrams

#### `FPTEU_SESSION_TROUBLESHOOTING.md`
- Specific to fpteu.fptchatbot.com domain
- Quick diagnosis steps
- Manual database verification
- Diagnostic scripts
- Verification checklist

### 4. README Updates

Added references to:
- New debugging guides
- Interactive test page
- Testing tools section

## How to Debug Your Issue

### Quick Steps:

1. **Access Test Page**
   ```
   http://fpteu.fptchatbot.com/test-session-tracking.html
   ```

2. **Run Full Test Suite**
   - Click "▶️ Run Full Test Suite"
   - Watch for ✅ success or ❌ error indicators

3. **Check Server Logs**
   - Look at your terminal where the dev server is running
   - Should see `[Session API]` logs

4. **Verify in Database**
   ```javascript
   use chatbot_fpteu;
   db.leads.find({}).limit(5).pretty();
   ```

5. **Check Admin Panel**
   - Go to http://localhost:3000/leads
   - Select tenant "fpteu"
   - Look for recent sessions

### If Still Not Working:

Run this diagnostic script in browser console:

```javascript
// Copy and paste this entire block
console.log('=== DIAGNOSTIC INFO ===');
console.log('URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
console.log('Detected Tenant:', localStorage.getItem('detectedTenantId'));

const parts = window.location.hostname.split('.');
console.log('Hostname parts:', parts);
console.log('Extracted tenant:', parts[0]);

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
  console.log('Status:', r.status);
  return r.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

## Expected Behavior

### When Everything Works:

**Browser Console:**
```
🌐 Current hostname: fpteu.fptchatbot.com
📍 Tenant ID from subdomain: fpteu
📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu" }
✅ Session created/updated successfully: created
```

**Server Logs:**
```
[Session API] POST request for tenant: fpteu
[Session API] Connecting to tenant database: chatbot_fpteu
[Session API] ✅ Connected to tenant database successfully
[Session API] ✅ Created new lead with ID: 673e...
```

**Admin Panel:**
- Session appears in lead list
- Shows "Anonymous User" as name
- Has chat history
- Shows device/browser info

## Common Issues We Can Now Diagnose

### Issue 1: Tenant Not Detected
**How to spot:**
- Test page shows "Tenant ID: N/A"
- Console shows: "❌ Unable to determine tenant ID"

**What to check:**
- Verify you're actually on fpteu.fptchatbot.com (not localhost)
- Check localStorage: `localStorage.getItem('detectedTenantId')`
- Try manual override: `localStorage.setItem('detectedTenantId', 'fpteu')`

### Issue 2: API Call Failing
**How to spot:**
- Test page shows "API Status: ✗ Failed"
- Network tab shows 400 or 500 error

**What to check:**
- Server logs for error messages
- Request URL includes `?tenantId=fpteu`
- Request body includes `session_id`

### Issue 3: Database Not Connected
**How to spot:**
- Server logs: "Failed to connect to tenant database"
- API returns 500 error

**What to check:**
- Database `chatbot_fpteu` exists in MongoDB
- MongoDB connection string is correct
- Database permissions are set up

### Issue 4: Sessions Created But Not Visible
**How to spot:**
- Test succeeds
- Database has sessions
- Admin panel is empty

**What to check:**
- Correct tenant selected in admin panel
- Date range filter not excluding sessions
- User has access to fpteu tenant

## Files Modified

1. **`/pages/api/lead/session.ts`**
   - Added comprehensive logging
   - Enhanced error messages
   - Better status reporting

2. **`/public/test-session-tracking.html`** ✨ NEW
   - Interactive testing interface
   - Real-time diagnostics
   - Automated test suite

3. **`/ANONYMOUS_SESSION_DEBUGGING.md`** ✨ NEW
   - General debugging guide
   - Common issues and fixes
   - Flow diagrams

4. **`/FPTEU_SESSION_TROUBLESHOOTING.md`** ✨ NEW
   - Domain-specific guide
   - Quick diagnosis steps
   - Verification checklist

5. **`/README.md`**
   - Added documentation references
   - Added testing tools section

## Next Steps

1. **Visit the test page**: `http://fpteu.fptchatbot.com/test-session-tracking.html`
2. **Run the test suite**
3. **Share the results**:
   - Browser console logs
   - Server terminal logs
   - Test page status indicators

This will pinpoint exactly where the issue is occurring and help us fix it quickly!

## Benefits of These Changes

✅ **Visibility**: Can see exactly what's happening at each step
✅ **Self-Service**: Can diagnose issues without developer help
✅ **Comprehensive**: Covers all potential failure points
✅ **Actionable**: Provides specific fixes for each issue
✅ **Documented**: Everything is well-documented for future reference

## Production Considerations

**Note:** The enhanced logging in `/pages/api/lead/session.ts` should remain enabled in production as it's helpful for debugging, but if you're concerned about log volume, you can wrap them in:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(...);
}
```

The test page is safe to leave in production as it's only accessible if you know the URL and doesn't expose any sensitive data.
