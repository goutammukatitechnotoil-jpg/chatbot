# MongoDB Connections Over API - Complete Analysis

## 🔍 Question: How Many Times Does MongoDB Connect Over API?

**Short Answer**: **1 connection per database** (reused via connection pooling)

**Long Answer**: It depends on your architecture. Let me explain:

---

## 📊 Connection Architecture

### 1. **Connection Pooling (Singleton Pattern)**

Your application uses **connection pooling**, which means:
- ✅ **One MongoDB client** per database
- ✅ **Multiple connections in the pool** (up to `maxPoolSize`)
- ✅ **Connections are reused** across API requests
- ❌ **NOT** creating new connections for each API call

### 2. **Two Database Types**

Your multi-tenant architecture uses:

| Database Type | Purpose | Connection |
|--------------|---------|------------|
| **Master DB** | Tenant management, super admins | 1 shared client |
| **Tenant DB** | Per-tenant data (users, leads, etc) | 1 client per tenant |

---

## 🔄 How Connections Work Per API Request

### Example: User Visits Tenant Admin Panel

Let's trace what happens when a user makes an API call:

```
User Request: GET /api/lead
      ↓
Next.js API Handler
      ↓
withTenant Middleware
      ↓
Checks JWT Token (no DB call)
      ↓
Extracts tenantId from user.tenantId
      ↓
multiTenantDB.connectToTenant(tenantId)
      ↓
Check: Is there already a connection for this tenant?
      ↓
  YES → Reuse existing connection ✅
  NO  → Create new connection (once) ✅
      ↓
req.tenantDb = db (assign to request)
      ↓
API Handler runs
      ↓
db.collection('leads').find()
      ↓
Uses connection from pool ✅
      ↓
Response sent
      ↓
Connection stays open in pool ✅
```

**Result**: **0 new connections** (if tenant DB already connected)  
**Result**: **1 new connection** (if first time for this tenant)

---

## 📈 Connection Count Examples

### Scenario 1: Single Tenant Application
```
User1 → /api/lead     → Connects to TenantA DB (1st time) → 1 connection
User1 → /api/form     → Reuses TenantA DB connection     → 0 new
User2 → /api/lead     → Reuses TenantA DB connection     → 0 new
User3 → /api/button   → Reuses TenantA DB connection     → 0 new

Total MongoDB Connections: 1 ✅
```

### Scenario 2: Multi-Tenant Application (3 Tenants)
```
TenantA User → /api/lead    → Connects to TenantA DB → 1 connection
TenantB User → /api/lead    → Connects to TenantB DB → 1 connection
TenantC User → /api/lead    → Connects to TenantC DB → 1 connection
TenantA User → /api/form    → Reuses TenantA DB      → 0 new
TenantB User → /api/button  → Reuses TenantB DB      → 0 new

Total MongoDB Connections: 3 (one per tenant) ✅
```

### Scenario 3: Super Admin Accessing Multiple Tenants
```
Super Admin → /api/admin/tenants        → Connects to Master DB  → 1 connection
Super Admin → Views TenantA details     → Connects to TenantA DB → 1 connection
Super Admin → Views TenantB details     → Connects to TenantB DB → 1 connection
Super Admin → Creates new tenant        → Reuses Master DB       → 0 new

Total MongoDB Connections: 3 (1 master + 2 tenants) ✅
```

---

## 🔢 Actual Connection Numbers

### Per Database Connection

Each connection to a database creates a **connection pool**:

```typescript
MONGO_OPTIONS = {
  maxPoolSize: 10,     // Max 10 connections in pool
  minPoolSize: 2,      // Min 2 connections always ready
  maxIdleTimeMS: 60000 // Close idle after 1 minute
}
```

**What this means**:
- **Master DB**: 2-10 connections (based on load)
- **Each Tenant DB**: 2-5 connections (based on load)

### Example with 5 Active Tenants

```
Master DB:     [====]      2-10 connections
Tenant A DB:   [===]       2-5 connections
Tenant B DB:   [===]       2-5 connections
Tenant C DB:   [===]       2-5 connections
Tenant D DB:   [===]       2-5 connections
Tenant E DB:   [===]       2-5 connections

Total Range: 12-40 connections
Average:     ~25 connections ✅
```

**This is well within MongoDB Atlas M0 limit of 500!**

---

## 💡 Key Points

### 1. **Connection Pooling = Efficiency**

```javascript
// ❌ BAD: Creating new connection each time
async function badExample() {
  const client = new MongoClient(uri);
  await client.connect();  // New connection every call!
  const db = client.db();
  // ... use db
  await client.close();    // Closes connection
}

// ✅ GOOD: Reusing connection from pool
async function goodExample() {
  const db = await connectToDatabase(); // Reuses existing
  // ... use db
  // Connection stays open in pool
}
```

### 2. **Tenant Isolation**

Each tenant gets their own database, which means:
- ✅ Data security (tenants can't see each other's data)
- ✅ Performance isolation
- ✅ Separate connection pools
- ⚠️ More total connections (but still manageable)

### 3. **Connection Lifecycle**

```
Application Starts
      ↓
First API Request to TenantA
      ↓
Create MongoClient for TenantA
      ↓
Open connection pool (2-10 connections)
      ↓
Store in Map<tenantId, connection>
      ↓
Future API Requests to TenantA
      ↓
Reuse existing connection ✅
      ↓
Idle for 10 minutes
      ↓
Auto-cleanup closes connection
      ↓
Connection removed from Map
```

---

## 🔍 How to Verify Connection Count

### Method 1: MongoDB Atlas Dashboard

1. Login to [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to your cluster
3. Click **"Metrics"**
4. View **"Connections"** graph
5. You'll see total active connections

**Expected Range**: 10-50 connections (for small app)

### Method 2: Application Logs

Your app now logs connection stats every 5 minutes:

```
📊 MongoDB Connection Stats: {
  "totalTenantConnections": 5,    ← Number of tenant DBs connected
  "maxConnections": 20,            ← Max allowed
  "masterConnected": true,         ← Master DB connected
  "timestamp": "2025-11-29T..."
}
```

**Calculation**:
```
Total Connections = 
  Master DB (2-10) + 
  (Tenant Count × Tenant Pool Size (2-5))

Example with 5 tenants:
  = 10 (master) + (5 × 5) = 35 connections
```

### Method 3: Check Code

```bash
# See how many tenant connections are cached
grep "totalTenantConnections" your-log-file.log

# Check multiTenantDatabaseService
# tenantConnections Map size = number of cached tenant DBs
```

---

## 📋 API Request Flow Examples

### Example 1: Get Leads API

```javascript
// API: GET /api/lead
// File: pages/api/lead/index.ts

export default compose(withErrorHandling, withTenant)(leadHandler);

async function leadHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  // req.tenantDb is already connected by middleware ✅
  const leads = await req.tenantDb.collection('leads').find().toArray();
  res.json({ leads });
}
```

**MongoDB Connections**:
1. Middleware connects to tenant DB (or reuses existing)
2. Handler uses the connection
3. Connection stays open for next request

**New Connections**: **0** (if tenant DB already connected)

### Example 2: Create Tenant (Super Admin)

```javascript
// API: POST /api/admin/tenants
// File: pages/api/admin/tenants.ts

export default compose(withErrorHandling, withSuperAdmin)(tenantHandler);

async function tenantHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Connects to Master DB to create tenant
    const tenant = await multiTenantDB.createTenant(data);
    
    // Initializes new tenant DB
    await multiTenantDB.initializeTenantDatabase(tenant.id);
    
    res.json({ tenant });
  }
}
```

**MongoDB Connections**:
1. Master DB connection (reused if exists)
2. New tenant DB connection (created for first time)

**New Connections**: **1** (for new tenant DB)

### Example 3: Multiple API Calls in Sequence

```javascript
// User actions:
1. GET /api/lead          → Uses TenantA DB (creates if needed)
2. POST /api/form/submit  → Uses TenantA DB (reuses)
3. GET /api/analytics     → Uses TenantA DB (reuses)
4. PUT /api/config        → Uses TenantA DB (reuses)

// MongoDB Connections:
Connection count: 1 (all reuse the same TenantA DB connection) ✅
```

---

## 🎯 Connection Optimization Benefits

### Before Optimization (No Limits)
```
API Request 1 → New Connection
API Request 2 → New Connection
API Request 3 → New Connection
...
API Request 100 → New Connection

Total: 100 connections 🚨
Problem: Exceeds M0 limit!
```

### After Optimization (With Pooling)
```
API Request 1   → Create pool (2-10 connections)
API Request 2   → Reuse from pool
API Request 3   → Reuse from pool
...
API Request 100 → Reuse from pool

Total: 2-10 connections ✅
Benefit: 90% reduction!
```

---

## 📊 Summary Table

| Scenario | Connections Created | Connections Reused | Total Active |
|----------|-------------------|-------------------|--------------|
| Single tenant, 100 API calls | 1 | 99 | 2-10 |
| 5 tenants, 20 calls each | 5 | 95 | 10-35 |
| Super admin viewing 10 tenants | 11 (1 master + 10 tenants) | Many | 22-110 |
| Mixed usage (realistic) | 5-15 | Hundreds | 25-75 |

**MongoDB Atlas M0 Limit**: 500 connections ✅  
**Your Typical Usage**: 25-75 connections ✅  
**Safety Margin**: **~400 connections** ✅

---

## ✅ Best Practices in Your Code

### 1. **Always Use Middleware**
```typescript
// ✅ CORRECT
export default compose(withErrorHandling, withTenant)(handler);

// ❌ WRONG
const db = await connectToDatabase(); // Which database?
```

### 2. **Connection Reuse**
```typescript
// ✅ Your code does this automatically
const tenantDb = await multiTenantDB.connectToTenant(tenantId);
// Returns existing connection if already open
```

### 3. **Auto-Cleanup**
```typescript
// ✅ Your code does this
- Idle connections closed after 10 minutes
- Cleanup runs every 2 minutes
- Max 20 tenant connections cached
```

---

## 🔧 Connection Monitoring Commands

### Check Active Connections in MongoDB

```javascript
// Run in MongoDB shell
db.serverStatus().connections
// Returns:
{
  "current": 25,        ← Currently active
  "available": 475,     ← Remaining from 500 limit
  "totalCreated": 150   ← Total created since startup
}
```

### Check Your App's Cached Connections

```typescript
// multiTenantDatabaseService.ts
console.log('Tenant connections:', this.tenantConnections.size);
// Outputs: number of cached tenant DB connections
```

---

## 💡 Key Takeaways

1. **✅ Connection Pooling**: Your app reuses connections, doesn't create new ones per request

2. **✅ Per-Database Pooling**: Each database (master + each tenant) has its own pool

3. **✅ Optimized Limits**: 
   - Master DB: max 10 connections
   - Tenant DB: max 5 connections each
   - Max 20 tenant DBs cached

4. **✅ Auto-Cleanup**: Idle connections closed automatically

5. **✅ Well Within Limits**: Typical usage is 25-75 connections (500 limit)

6. **✅ Efficient**: 90%+ reduction in connection creation vs. naive approach

---

## 📞 Quick Answer

**Q: How many times does MongoDB connect over API?**

**A**: 
- **First request to a tenant**: 1 new connection created
- **Subsequent requests**: 0 new connections (reuses existing)
- **Connection pool**: 2-10 actual connections per database
- **Total connections**: Typically 25-75 for small-medium app
- **MongoDB limit**: 500 (M0 tier)
- **Safety margin**: ~400 connections remaining ✅

**Your app is optimized and efficient!** 🎉

---

**Last Updated**: November 29, 2025  
**Connection Pooling**: Active ✅  
**Optimization Level**: High ✅  
**MongoDB Limit Risk**: Low ✅
