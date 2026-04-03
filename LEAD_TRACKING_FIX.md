# 🔧 Lead Tracking Fix - Chat Sessions Not Appearing in Lead List

## Issue Identified

**Problem:** Chat sessions (normal conversations and quick reply interactions) were not creating lead entries in the lead list.

**Symptoms:**
- Users could chat with the bot
- Click quick reply buttons
- But no session appeared in the Leads page
- Only form submissions were being tracked

---

## Root Cause

The `/api/lead/session` endpoint requires a `tenantId` query parameter to identify which tenant database to use, but the `leadService` was not including it in the API calls.

**Before (Broken):**
```typescript
const response = await fetch('/api/lead/session', {
  method: 'POST',
  ...
});
```

**Issue:** No tenant ID = API couldn't determine which database to write to = Sessions not saved

---

## Solution Implemented

### 1. Added Tenant ID Detection

Modified `/src/services/leadService.ts` to automatically get the tenant ID from localStorage:

```typescript
// Get tenant ID from localStorage
function getTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.tenantId || null;
    }
  } catch (error) {
    console.error('Error getting tenant ID:', error);
  }
  
  return null;
}
```

### 2. Updated API Calls

Modified `createOrUpdateSession()` and `updateSessionFormData()` to include tenant ID:

```typescript
const tenantId = getTenantId();

if (!tenantId) {
  console.warn('⚠️ No tenant ID found - cannot create/update session');
  return false;
}

const response = await fetch(`/api/lead/session?tenantId=${tenantId}`, {
  method: 'POST',
  ...
});
```

### 3. Added Enhanced Logging

Added detailed console logging to help debug session tracking:

```typescript
console.log('📝 Creating/updating session:', { sessionId, tenantId, message: message?.substring(0, 50) });
// ...
console.log('✅ Session created/updated successfully:', result.action);
```

---

## What Works Now

✅ **Chat Sessions Tracked:** Every chat conversation creates a lead entry  
✅ **Quick Replies Tracked:** Quick reply button clicks are logged  
✅ **Message History:** All chat messages are stored in lead's chat_history  
✅ **Session Info:** Device, browser, IP, country captured  
✅ **Real-time Updates:** Sessions update as chat continues  

---

## How It Works

### Flow:

1. **User opens chatbot**
   - Session ID created: `session_1234567890_abc123`
   - Tenant ID retrieved from localStorage

2. **Initial session created**
   ```
   POST /api/lead/session?tenantId=tenant_123
   ```
   - Creates lead with:
     - `session_id`
     - `chat_history: []`
     - `form_data: { name: "Anonymous User", purpose: "Chat Only" }`
     - `session_info: { device, browser, IP, country, etc }`

3. **User sends message or clicks quick reply**
   ```
   POST /api/lead/session?tenantId=tenant_123
   {
     session_id: "session_1234...",
     message: "Hello",
     sender: "user"
   }
   ```
   - Updates existing lead
   - Appends message to `chat_history`

4. **Bot responds**
   ```
   POST /api/lead/session?tenantId=tenant_123
   {
     session_id: "session_1234...",
     message: "Hi! How can I help?",
     sender: "bot",
     sources: [...]
   }
   ```
   - Appends bot message to `chat_history`

5. **User submits form (optional)**
   ```
   PUT /api/lead/session?tenantId=tenant_123
   {
     session_id: "session_1234...",
     form_data: { name: "John Doe", email: "john@example.com", ... }
   }
   ```
   - Updates `form_data` from "Anonymous User" to actual contact info

---

## Testing

### How to Test:

1. **Login as tenant user:**
   ```
   http://localhost:3000/
   Email: demo@company.com
   Password: Demo123!
   ```

2. **Open chatbot**
   - Click the chatbot icon

3. **Send a message:**
   - Type: "Hello"
   - Press Enter

4. **Check browser console:**
   ```
   📝 Creating/updating session: { sessionId: "session_...", tenantId: "...", message: "Hello" }
   ✅ Session created/updated successfully: created
   ```

5. **Go to Leads page:**
   ```
   http://localhost:3000/leads
   ```

6. **Verify:**
   - You should see a new lead entry
   - Session ID: `session_1234567890_abc123`
   - Name: "Anonymous User"
   - Purpose: "Chat Only"
   - Click "View" to see chat history

### Expected Console Logs:

**Session Creation:**
```
📝 Creating/updating session: {
  sessionId: "session_1764354916267_4cm69ydvo",
  tenantId: "tenant_123",
  message: undefined
}
✅ Session created/updated successfully: created
```

**Message Added:**
```
📝 Creating/updating session: {
  sessionId: "session_1764354916267_4cm69ydvo",
  tenantId: "tenant_123",
  message: "Hello"
}
✅ Session created/updated successfully: updated
```

---

## What Gets Stored

### Lead Entry Structure:

```json
{
  "session_id": "session_1764354916267_4cm69ydvo",
  "date": "2025-11-29",
  "chat_history": [
    {
      "id": "user-1732900000000-abc123",
      "sender": "user",
      "message": "Hello",
      "timestamp": "2025-11-29T10:00:00Z"
    },
    {
      "id": "bot-1732900001000-def456",
      "sender": "bot",
      "message": "Hi! How can I help you today?",
      "timestamp": "2025-11-29T10:00:01Z",
      "sources": [...]
    }
  ],
  "form_data": {
    "name": "Anonymous User",
    "purpose": "Chat Only"
  },
  "last_message": "Hi! How can I help you today?",
  "session_info": {
    "device": "Desktop",
    "os": "macOS",
    "browser": "Chrome",
    "ip_address": "192.168.1.100",
    "country": "United States",
    "city": "San Francisco",
    "timezone": "America/Los_Angeles"
  },
  "created_at": "2025-11-29T10:00:00Z",
  "updated_at": "2025-11-29T10:00:01Z"
}
```

---

## Troubleshooting

### Issue: Sessions still not appearing

**Check 1: Is user logged in?**
- Lead tracking requires authentication
- Tenant ID comes from logged-in user

**Check 2: Check browser console**
```javascript
// Open console (F12)
// Look for:
📝 Creating/updating session: ...
✅ Session created/updated successfully: ...

// If you see:
⚠️ No tenant ID found - cannot create/update session
// Then user is not properly logged in
```

**Check 3: Verify localStorage**
```javascript
// In browser console:
localStorage.getItem('currentUser')
// Should return user object with tenantId
```

**Check 4: Check server logs**
```
POST /api/lead/session?tenantId=tenant_123
Session created/updated successfully
```

---

## Files Modified

✅ `/src/services/leadService.ts`
- Added `getTenantId()` function
- Updated `createOrUpdateSession()` to include tenant ID
- Updated `updateSessionFormData()` to include tenant ID
- Added comprehensive logging

---

## Benefits

1. **Complete Tracking:** Every chat interaction is now tracked
2. **Anonymous Sessions:** Even users who don't submit forms are tracked
3. **Better Analytics:** More accurate session and engagement metrics
4. **Debugging:** Enhanced logging makes it easy to troubleshoot
5. **Data Continuity:** Sessions upgrade from anonymous to identified when form is submitted

---

## Related Documentation

- [Lead Management](./README.md#lead-management-system)
- [Analytics & KPIs](./ANALYTICS_KPIs.md)
- [Tenant Pages](./TENANT_FACING_PAGES.md)

---

**Status:** ✅ Fixed  
**Version:** 2.2.1  
**Date:** November 29, 2025

🎉 **All chat sessions are now properly tracked!**
