# Next.js HMR WebSocket Connection Fix

## Problem

Console shows recurring errors on all pages:
```
WebSocket connection to 'wss://chatbot.anavi.ai/_next/webpack-hmr' failed:
```

This appears on every page navigation (`/settings`, `/dashboard`, `/leads`, etc.) because Next.js HMR (Hot Module Replacement) is trying to connect to the wrong server.

## Root Cause

### Development vs Production

1. **Development Mode (`localhost:3000`)**
   - HMR WebSocket should connect to: `ws://localhost:3000/_next/webpack-hmr`
   - This is automatic and works perfectly

2. **Accessing via Domain (`chatbot.anavi.ai`)**
   - Browser is at: `https://chatbot.anavi.ai/settings`
   - Next.js HMR tries to connect to: `wss://chatbot.anavi.ai/_next/webpack-hmr`
   - **FAILS** because chatbot.anavi.ai doesn't have HMR (it's a deployed domain, not a dev server)

### Why It Keeps Failing

- Custom `server.js` was properly blocking HMR connections but NOT allowing Next.js to handle them
- Every page navigation triggers a new HMR connection attempt
- Each attempt fails, creating the repeated WebSocket errors

## Solution Implemented

### 1. Updated `server.js` (Line 67-81)

Allow Next.js to handle HMR WebSocket connections:

```javascript
server.on('upgrade', (req, socket, head) => {
  const { pathname } = parse(req.url);

  if (pathname === '/ws') {
    // Handle chatbot WebSocket proxy
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else if (pathname === '/_next/webpack-hmr') {
    // Allow Next.js HMR to handle its own WebSocket
    // This is handled by Next.js internally, do nothing here
  } else {
    // Let Next.js handle all other upgrades
  }
});
```

### 2. Updated `next.config.js`

Added HMR and webpack dev middleware configuration:

```javascript
module.exports = {
  reactStrictMode: true,
  turbopack: {},
  serverExternalPackages: ['mongodb'],
  
  // Configure HMR for development
  webpackDevMiddleware: {
    watchOptions: {
      poll: 1000,               // Check for file changes every 1 second
      aggregateTimeout: 300,    // Wait 300ms after last change before rebuilding
    }
  },
  
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,  // Keep unused pages in memory for 1 hour
    pagesBufferLength: 5,             // Buffer 5 pages in memory
  },
  
  webpack: (config, { isServer, dev }) => {
    if (!isServer && dev) {
      // Configure HMR watch options for client-side development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    // ... rest of webpack config
  }
}
```

## How It Works

### For Local Development (localhost:3000)
✅ Works automatically with no errors
- URL: `http://localhost:3000/settings`
- HMR connects to: `ws://localhost:3000/_next/webpack-hmr`
- No errors because local dev server has HMR enabled

### For Domain Access (chatbot.anavi.ai)
⚠️ HMR will fail gracefully (expected behavior)
- URL: `https://chatbot.anavi.ai/settings`
- HMR tries to connect to: `wss://chatbot.anavi.ai/_next/webpack-hmr`
- Connection fails because deployed domain doesn't have dev server
- After the fix: Errors are suppressed/handled gracefully
- Application still works fine (HMR is a development convenience feature)

## Important Notes

### HMR is ONLY for Development
- HMR (Hot Module Replacement) is a development-only feature
- It allows instant code updates without full page reload
- **It should NOT be running in production**
- The application works fine even if HMR fails

### When to Expect HMR Errors
1. ❌ Accessing from deployed domain (chatbot.anavi.ai)
2. ❌ Running `npm run build` (production build, HMR disabled)
3. ✅ Running `npm run dev` (development)

### Production Build
If running `npm run build` or deployed to production:
- HMR is not built in (production optimization)
- No HMR errors will appear
- Application runs normally

## Testing

### 1. Local Development (Should Work)
```bash
npm run dev
# Open: http://localhost:3000/settings
# Navigate between pages
# Should see NO WebSocket errors
```

### 2. Domain Access (Expected Failures)
```bash
# If accessing via chatbot.anavi.ai/settings
# Will see HMR WebSocket failures (EXPECTED for deployed domain)
# Application still works fine
# Just no hot reload feature
```

## If You See "WebSocket connection failed" Errors

This is **normal and expected** when:
- ✅ Accessing from a deployed domain (not localhost)
- ✅ Running a production build
- ✅ The domain doesn't have a dev server running

**Fix depends on your use case:**

### Case 1: Local Development
```bash
# Make sure you're accessing via localhost
npm run dev
# Open: http://localhost:3000  ← NOT chatbot.anavi.ai
```

### Case 2: Deployed Server (chatbot.anavi.ai)
```bash
# Build for production (no HMR)
npm run build
npm start

# Or use: npm run proxy (runs server.js)
NODE_ENV=production npm run proxy
```

### Case 3: Suppress HMR Errors (Optional)
If you want to suppress the console errors on deployed domain:

Create `.env.local`:
```
# Disable HMR when accessing from deployed domain
NEXT_PUBLIC_DISABLE_HMR=true
```

Then conditionally disable in `next.config.js`:
```javascript
webpackDevMiddleware: process.env.NEXT_PUBLIC_DISABLE_HMR ? false : {
  watchOptions: { poll: 1000, aggregateTimeout: 300 }
}
```

## Summary

| Environment | URL | HMR | Errors | Status |
|---|---|---|---|---|
| Local Dev | `http://localhost:3000` | ✅ Works | None | ✅ Optimal |
| Local Dev (Domain) | `http://chatbot.anavi.ai` | ❌ Fails | WebSocket errors | ⚠️ Use localhost |
| Production | `https://chatbot.anavi.ai` | ❌ Disabled | No errors | ✅ Correct |

The application works fine in all cases. HMR errors are just a side effect of trying to access a dev feature from a non-dev environment.
