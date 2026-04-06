# WebSocket Proxy Multiple Connection Fix

## Problem
The WebSocket proxy was attempting to connect **multiple times** instead of just once:
```
chatbot-widget-v2.js:2315 Connecting to Chatbot Proxy: wss://chatbot.anavi.ai/ws?...
chatbot-widget-v2.js:2320 Connected to Chatbot Proxy
chatbot-widget-v2.js:2315 Connecting to Chatbot Proxy: wss://chatbot.anavi.ai/ws?...
chatbot-widget-v2.js:2320 Connected to Chatbot Proxy
chatbot-widget-v2.js:2315 Connecting to Chatbot Proxy: wss://chatbot.anavi.ai/ws?...
chatbot-widget-v2.js:2320 Connected to Chatbot Proxy
```

## Root Cause
The `initializeProxy()` method was being called from **multiple locations** without any locking mechanism:

1. **When continuing with AI** (line 2043) - User clicks "Continue with AI"
2. **When sending messages** (line 2412) - `sendMessage()` checks if socket is not open
3. **Other places** (line 2440) - Additional calls

**Race Condition**: A concurrent attempt to connect from different methods would trigger multiple WebSocket creation attempts because there was no flag to prevent concurrent connection attempts.

### Previous Check (Insufficient)
```javascript
// OLD: Only checks if socket exists and is OPEN/CONNECTING
if (this.proxySocket && (this.proxySocket.readyState === WebSocket.OPEN || this.proxySocket.readyState === WebSocket.CONNECTING)) return;
```

**Problem**: If socket is `undefined` or `null` (after initialization or disconnect), this check passes and a new connection attempt starts.

## Solution Implemented

### 1. Added Connection Lock Flag
```javascript
// In constructor (line 206)
this.proxyConnecting = false;  // Prevent concurrent connection attempts
```

### 2. Updated Connection Check
```javascript
// NEW: Check lock flag first
if (this.proxyConnecting || (this.proxySocket && (this.proxySocket.readyState === WebSocket.OPEN || this.proxySocket.readyState === WebSocket.CONNECTING))) {
  console.log('[Proxy] Connection already in progress or established');
  return;
}

// Set lock before attempting connection
this.proxyConnecting = true;
console.log('[Proxy] Starting connection...');
```

### 3. Release Lock on Connection Success
```javascript
// In onopen handler (line 2328)
this.proxySocket.onopen = () => {
  console.log('Connected to Chatbot Proxy');
  this.proxyConnecting = false;  // Release lock
  this.flushPendingProxyMessages();
};
```

### 4. Release Lock on Disconnection
```javascript
// In onclose handler (line 2361-2369)
this.proxySocket.onclose = () => {
  console.log('[Proxy] Connection closed, cleaning up');
  this.proxySocket = null;
  this.proxyReady = false;
  this.proxyConnecting = false;  // Release lock
  if (this.isOpen) {
    console.log('[Proxy] Widget still open, reconnecting in 3 seconds...');
    setTimeout(() => this.initializeProxy(), 3000);
  }
};
```

### 5. Release Lock on Error
```javascript
// In catch block (line 2380)
catch (error) {
  console.error('Failed to initialize proxy connection:', error);
  this.proxyConnecting = false;  // Release lock
}
```

## Changes Summary

| File | Change | Line(s) |
|------|--------|---------|
| `chatbot-widget-v2.js` | Added `this.proxyConnecting = false` initialization | 206 |
| `chatbot-widget-v2.js` | Added lock check in `initializeProxy()` | 2303-2309 |
| `chatbot-widget-v2.js` | Set `this.proxyConnecting = true` before connection | 2309-2310 |
| `chatbot-widget-v2.js` | Release lock in `onopen` handler | 2328 |
| `chatbot-widget-v2.js` | Release lock in `onclose` handler | 2364 |
| `chatbot-widget-v2.js` | Release lock in catch block | 2380 |

## Result

✅ **Before**: Multiple concurrent connections
```
Connecting to Chatbot Proxy: ...
Connecting to Chatbot Proxy: ...
Connecting to Chatbot Proxy: ...
Connected to Chatbot Proxy (appears 3 times)
```

✅ **After**: Single connection attempt
```
[Proxy] Starting connection...
Connected to Chatbot Proxy
[Proxy] Connection already in progress or established (rejection messages for subsequent attempts)
```

## Testing

1. **Open embed page** with the script:
   ```html
   <script src="http://localhost:3000/chatbot-widget-v2.js"></script>
   <script>
     FPTChatbot.init({
       configKey: 'cbk_ff9da9df45c141b5b4c375e6',
       url: 'http://localhost:3000',
       position: 'bottom-right'
     });
   </script>
   ```

2. **Open browser DevTools → Console**

3. **Expected behavior**:
   - Exactly **ONE** connection attempt ("Starting connection...")
   - Exactly **ONE** success message ("Connected to Chatbot Proxy")
   - No duplicate connection messages
   - No repetitive "Connecting to..." log messages

## Additional Notes

- Lock is automatically released on all paths: success, failure, or disconnection
- Lock prevents new connection attempts while one is in progress
- If connection fails, new attempts can start after 3 seconds (when `proxyConnecting` is released)
- Reconnection logic (3-second retry) still works as expected
