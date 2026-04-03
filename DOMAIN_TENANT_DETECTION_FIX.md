# 🔧 Domain-Based Tenant Detection Fix

## Issue Reported

**Problem:** When using a custom domain like `fpteu.fptchatbot.com`, anonymous chatbot conversations were not creating session entries in the lead list.

**User Report:**
> "I used Tenant fpteu.fptchatbot.com, i dont see any session ID entries for anonymous conversations on chatbot."

---

## Root Cause

The previous tenant detection logic only worked for authenticated users (getting tenant ID from `localStorage.currentUser`). 

**For anonymous/public chatbot users:**
- No user logged in = No `currentUser` in localStorage
- No tenant ID detected = API calls failed
- Sessions not saved to database

**This affected:**
- Public chatbot visitors (not logged in)
- Anonymous chat sessions
- Custom domain deployments (e.g., `fpteu.fptchatbot.com`)

---

## Solution Implemented

### Multi-Source Tenant Detection

Updated `/src/services/leadService.ts` with a cascading tenant detection strategy:

```typescript
function getTenantId(): string | null {
  // Priority 1: Get from logged-in user
  if (user in localStorage) return user.tenantId;
  
  // Priority 2: Get from domain/subdomain
  if (hostname === 'fpteu.fptchatbot.com') return 'fpteu';
  
  // Priority 3: Get from URL parameter (?tenant=xxx)
  if (URL has ?tenant=xxx) return 'xxx';
  
  // Priority 4: Get from cached detection
  if (previously detected) return cached value;
  
  return null;
}
```

### Detection Logic:

#### 1. **Logged-in User (Priority 1)**
```typescript
const user = localStorage.getItem('currentUser');
if (user.tenantId) return user.tenantId;
```

#### 2. **Domain/Subdomain (Priority 2)**
```typescript
hostname: 'fpteu.fptchatbot.com'
  ↓
Extract subdomain: 'fpteu'
  ↓
Use as tenant ID: 'fpteu'
```

#### 3. **URL Parameter (Priority 3)**
```typescript
http://localhost:3000?tenant=fpteu
  ↓
Extract param: 'fpteu'
  ↓
Use as tenant ID: 'fpteu'
```

#### 4. **Cached Detection (Priority 4)**
```typescript
localStorage.getItem('detectedTenantId')
  ↓
Use cached value from previous detection
```

---

## How It Works Now

### For Custom Domains:

**Domain:** `fpteu.fptchatbot.com`

1. User visits chatbot (not logged in)
2. System detects hostname: `fpteu.fptchatbot.com`
3. Extracts subdomain: `fpteu`
4. Uses `fpteu` as tenant ID
5. Creates session with tenant ID: `fpteu`
6. Session appears in leads for tenant `fpteu`

**Console Logs:**
```
🌐 Current hostname: fpteu.fptchatbot.com
📍 Tenant ID from subdomain: fpteu
📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu", ... }
✅ Session created/updated successfully: created
```

### For Localhost Development:

**URL:** `http://localhost:3000?tenant=fpteu`

1. User visits chatbot
2. System detects localhost
3. Checks URL parameter: `?tenant=fpteu`
4. Uses `fpteu` as tenant ID
5. Session created with tenant ID

**Console Logs:**
```
🌐 Current hostname: localhost
📍 Tenant ID from URL param: fpteu
📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu", ... }
✅ Session created/updated successfully: created
```

### For Authenticated Users:

**Already logged in:**

1. User already authenticated
2. Gets tenant ID from user session: `user.tenantId`
3. Uses that tenant ID
4. Works as before

**Console Logs:**
```
📍 Tenant ID from user: fpteu
📝 Creating/updating session: { sessionId: "session_...", tenantId: "fpteu", ... }
✅ Session created/updated successfully: created
```

---

## Testing

### Test with Custom Domain:

1. **Access chatbot at:**
   ```
   http://fpteu.fptchatbot.com
   ```

2. **Open browser console (F12)**

3. **Open chatbot and send a message**

4. **Check console logs:**
   ```
   🌐 Current hostname: fpteu.fptchatbot.com
   📍 Tenant ID from subdomain: fpteu
   📝 Creating/updating session: { sessionId: "...", tenantId: "fpteu", message: "Hello" }
   ✅ Session created/updated successfully: created
   ```

5. **Go to leads page:**
   ```
   http://fpteu.fptchatbot.com/leads
   ```

6. **Verify:** You should see the session entry!

### Test with Localhost:

1. **Access chatbot at:**
   ```
   http://localhost:3000?tenant=fpteu
   ```

2. **Follow same steps as above**

3. **Session should be created with tenant ID: `fpteu`**

### Expected Lead Entry:

```json
{
  "session_id": "session_1764354916267_4cm69ydvo",
  "date": "2025-11-29",
  "chat_history": [
    {
      "id": "user-1732900000000-abc",
      "sender": "user",
      "message": "Hello",
      "timestamp": "2025-11-29T10:00:00Z"
    }
  ],
  "form_data": {
    "name": "Anonymous User",
    "purpose": "Chat Only"
  },
  "last_message": "Hello",
  "session_info": {
    "device": "Desktop",
    "os": "macOS",
    "browser": "Chrome",
    "ip_address": "192.168.1.100",
    "country": "Vietnam"
  },
  "created_at": "2025-11-29T10:00:00Z",
  "updated_at": "2025-11-29T10:00:00Z"
}
```

---

## Supported Deployment Scenarios

### ✅ **Subdomain-based Multi-tenancy**
```
fpteu.fptchatbot.com   → Tenant: fpteu
acme.fptchatbot.com    → Tenant: acme
demo.fptchatbot.com    → Tenant: demo
```

### ✅ **Custom Domains**
```
chat.company-a.com     → Tenant: chat
support.company-b.com  → Tenant: support
```

### ✅ **Localhost Development**
```
localhost:3000?tenant=fpteu    → Tenant: fpteu
localhost:3000?tenant=acme     → Tenant: acme
```

### ✅ **Authenticated Users**
```
Any URL with logged-in user → Tenant: user.tenantId
```

---

## Enhanced Logging

All tenant detection now includes detailed console logging:

```typescript
🌐 Current hostname: fpteu.fptchatbot.com
📍 Tenant ID from subdomain: fpteu
📝 Creating/updating session: { sessionId: "...", tenantId: "fpteu", ... }
✅ Session created/updated successfully: created
```

**Log Prefixes:**
- `🌐` = Hostname detection
- `📍` = Tenant ID source (user, subdomain, URL param, cache)
- `📝` = Session creation attempt
- `✅` = Success
- `❌` = Error
- `⚠️` = Warning

---

## Troubleshooting

### Issue: Still no sessions appearing

**Check 1: Browser Console**
```javascript
// Open console (F12)
// Look for tenant detection logs:
🌐 Current hostname: ...
📍 Tenant ID from ...: ...

// If you see:
❌ Unable to determine tenant ID from any source
// Then detection failed
```

**Check 2: Verify Hostname**
```javascript
// In browser console:
console.log(window.location.hostname);
// Should show: fpteu.fptchatbot.com
```

**Check 3: Manual Tenant Parameter**
```
Add ?tenant=fpteu to URL:
http://fpteu.fptchatbot.com?tenant=fpteu
```

**Check 4: Check localStorage**
```javascript
// In browser console:
localStorage.getItem('detectedTenantId');
// Should return: "fpteu"
```

**Check 5: Server Logs**
Look for API calls:
```
POST /api/lead/session?tenantId=fpteu
```

### Issue: Wrong tenant detected

**Solution:** Clear cache and reload
```javascript
// In browser console:
localStorage.removeItem('detectedTenantId');
localStorage.removeItem('currentTenant');
location.reload();
```

---

## Domain Mapping Examples

### Example 1: FPT EU
```
Domain: fpteu.fptchatbot.com
  ↓
Hostname: fpteu.fptchatbot.com
  ↓
Parts: ['fpteu', 'fptchatbot', 'com']
  ↓
Subdomain: fpteu
  ↓
Tenant ID: fpteu
```

### Example 2: Acme Corp
```
Domain: acme.fptchatbot.com
  ↓
Hostname: acme.fptchatbot.com
  ↓
Parts: ['acme', 'fptchatbot', 'com']
  ↓
Subdomain: acme
  ↓
Tenant ID: acme
```

### Example 3: Custom Domain
```
Domain: chat.mycompany.com
  ↓
Hostname: chat.mycompany.com
  ↓
Parts: ['chat', 'mycompany', 'com']
  ↓
Subdomain: chat
  ↓
Tenant ID: chat
```

---

## Files Modified

✅ `/src/services/leadService.ts`
- Enhanced `getTenantId()` with multi-source detection
- Added domain/subdomain parsing
- Added URL parameter support
- Added caching mechanism
- Added comprehensive logging

---

## Benefits

1. **✅ Works for Anonymous Users** - No login required
2. **✅ Multi-Domain Support** - Works with any domain structure
3. **✅ Development Friendly** - URL parameter for testing
4. **✅ Production Ready** - Automatic subdomain detection
5. **✅ Cached Detection** - Performance optimization
6. **✅ Detailed Logging** - Easy debugging

---

## Related Documentation

- [Lead Tracking Fix](./LEAD_TRACKING_FIX.md) - Original session tracking fix
- [Multi-Tenant Setup](./MULTI_TENANT_SETUP.md) - Tenant configuration
- [README](./README.md#multi-tenant-architecture) - Platform overview

---

**Status:** ✅ Fixed  
**Version:** 2.2.3  
**Date:** November 29, 2025

🎉 **Anonymous chatbot sessions now work with custom domains!**
