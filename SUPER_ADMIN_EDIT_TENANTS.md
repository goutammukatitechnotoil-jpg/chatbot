# Super Admin: Editing Tenant Details - Complete Guide

## 📋 Overview

As a Super Admin, you can edit various aspects of a tenant's configuration, settings, and billing information. This guide explains what can be edited and how to do it.

---

## 🎯 What Can Be Edited?

### 1. **Basic Information** ✅

| Field | Editable | Description | Validation |
|-------|----------|-------------|------------|
| **Name** | ✅ Yes | Company/Organization name | 3-100 characters |
| **Subdomain** | ⚠️ Caution | URL subdomain (e.g., `company.fptchatbot.com`) | Must be unique, 3-63 chars |
| **Custom Domain** | ✅ Yes | Custom domain (e.g., `chat.company.com`) | Valid domain format |
| **Status** | ✅ Yes | Account status | active, suspended, pending, cancelled |

**Recommendation**: 
- ✅ Edit: Name, Custom Domain, Status
- ⚠️ Avoid editing: Subdomain (can break URLs and integrations)

### 2. **Plan & Billing** ✅

| Field | Editable | Description | Options |
|-------|----------|-------------|---------|
| **Plan** | ✅ Yes | Subscription tier | starter, professional, enterprise |
| **Plan Price** | ✅ Yes | Monthly/yearly cost | Number (e.g., 29, 99, 299) |
| **Billing Cycle** | ✅ Yes | Payment frequency | monthly, yearly |
| **Trial Status** | ✅ Yes | Is account in trial | true, false |
| **Trial End Date** | ✅ Yes | When trial expires | ISO date string |
| **Next Billing Date** | ✅ Yes | Next payment date | ISO date string |

### 3. **Settings & Limits** ✅

| Setting | Editable | Description | Default |
|---------|----------|-------------|---------|
| **Max Users** | ✅ Yes | Maximum team members | 5 (starter), 20 (pro), unlimited (enterprise) |
| **Max Chatbots** | ✅ Yes | Maximum chatbot instances | 1 (starter), 5 (pro), unlimited (enterprise) |
| **Max Sessions/Month** | ✅ Yes | Monthly conversation limit | 1000 (starter), 10000 (pro), unlimited (enterprise) |
| **Custom Branding** | ✅ Yes | Allow custom logos/colors | false (starter), true (pro/enterprise) |
| **API Access** | ✅ Yes | Enable API endpoints | false (starter), true (pro/enterprise) |
| **Analytics Retention** | ✅ Yes | Days to keep analytics data | 30 (starter), 90 (pro), 365 (enterprise) |
| **Storage Limit** | ✅ Yes | Storage space in GB | 1 (starter), 10 (pro), 100 (enterprise) |
| **Allowed Domains** | ✅ Yes | Whitelist for embeds | Array of domains |

### 4. **NOT Editable** ❌

| Field | Editable | Reason |
|-------|----------|--------|
| **ID** | ❌ No | System-generated, immutable |
| **Database Name** | ❌ No | Critical infrastructure setting |
| **Database URI** | ❌ No | Critical infrastructure setting |
| **Created At** | ❌ No | Historical timestamp |
| **Created By** | ❌ No | Audit trail |
| **Updated At** | ✅ Auto | Automatically updated on save |

---

## 🚀 How to Edit Tenants (Current Status)

### Current Implementation Status

**❌ NOT YET IMPLEMENTED** - The tenant edit functionality is planned but not yet built.

However, I can show you:
1. What the implementation will look like
2. How to manually edit tenants via database (temporary workaround)
3. The planned UI/API design

---

## 💡 Planned Implementation

### UI Flow (Coming Soon)

```
Super Admin Dashboard
      ↓
Click "Tenants" Tab
      ↓
View Tenants Table
      ↓
Click "Edit" Icon (✏️) next to tenant
      ↓
Edit Tenant Modal Opens
      ↓
Make Changes
      ↓
Click "Save Changes"
      ↓
API: PUT /api/admin/tenants
      ↓
Tenant Updated ✅
```

### Edit Tenant Modal (Planned UI)

```
┌─────────────────────────────────────────┐
│  ✏️ Edit Tenant: Company Name           │
├─────────────────────────────────────────┤
│                                          │
│  Basic Information                       │
│  ─────────────────                       │
│  Company Name:  [________________]       │
│  Subdomain:     [company] (read-only)    │
│  Custom Domain: [________________]       │
│  Status:        [Active ▼]               │
│                                          │
│  Plan & Billing                          │
│  ─────────────────                       │
│  Plan:          [Professional ▼]         │
│  Price:         [$___] per [month ▼]     │
│  Trial:         [□ Is Trial]             │
│                                          │
│  Settings                                │
│  ─────────────────                       │
│  Max Users:     [____]                   │
│  Max Chatbots:  [____]                   │
│  Custom Branding: [✓] Enabled            │
│  API Access:      [✓] Enabled            │
│                                          │
│  [Cancel]  [Save Changes]                │
└─────────────────────────────────────────┘
```

---

## 🔧 Temporary Workaround: Edit via Database

Until the UI is implemented, you can edit tenants directly in MongoDB:

### Method 1: MongoDB Atlas Dashboard

1. **Login to MongoDB Atlas**
   - Go to https://cloud.mongodb.com
   - Select your cluster

2. **Browse Collections**
   - Click "Collections"
   - Database: `fpt_chatbot_master` (or your master DB name)
   - Collection: `tenants`

3. **Find Tenant**
   - Search by subdomain or name
   - Click the document

4. **Edit Fields**
   - Click "Edit Document"
   - Modify fields (see editable fields above)
   - Click "Update"

**Example Edit:**
```json
{
  "_id": ObjectId("..."),
  "id": "t_1234567890_abc",
  "name": "Updated Company Name",    ← Edit this
  "subdomain": "company",             ← Don't edit
  "domain": "chat.company.com",       ← Edit this
  "plan": "professional",             ← Edit this
  "status": "active",                 ← Edit this
  "settings": {
    "max_users": 20,                  ← Edit this
    "max_chatbots": 5,                ← Edit this
    "custom_branding": true,          ← Edit this
    ...
  },
  "billing": {
    "plan_price": 99,                 ← Edit this
    "billing_cycle": "monthly",       ← Edit this
    ...
  }
}
```

### Method 2: MongoDB Shell/Compass

```javascript
// Connect to master database
use fpt_chatbot_master

// Update tenant by subdomain
db.tenants.updateOne(
  { subdomain: "company" },
  {
    $set: {
      "name": "Updated Company Name",
      "status": "active",
      "plan": "professional",
      "settings.max_users": 20,
      "settings.custom_branding": true,
      "billing.plan_price": 99,
      "updated_at": new Date().toISOString()
    }
  }
)

// Verify update
db.tenants.findOne({ subdomain: "company" })
```

---

## 📝 Common Edit Scenarios

### Scenario 1: Upgrade Tenant Plan

**What to Change:**
```json
{
  "plan": "professional",           // Was: "starter"
  "billing.plan_price": 99,         // Was: 29
  "settings.max_users": 20,         // Was: 5
  "settings.max_chatbots": 5,       // Was: 1
  "settings.custom_branding": true, // Was: false
  "settings.api_access": true,      // Was: false
  "updated_at": "2025-11-29T..."
}
```

**MongoDB Command:**
```javascript
db.tenants.updateOne(
  { subdomain: "company" },
  {
    $set: {
      "plan": "professional",
      "billing.plan_price": 99,
      "settings.max_users": 20,
      "settings.max_chatbots": 5,
      "settings.custom_branding": true,
      "settings.api_access": true,
      "updated_at": new Date().toISOString()
    }
  }
)
```

### Scenario 2: Suspend Tenant

**What to Change:**
```json
{
  "status": "suspended",  // Was: "active"
  "updated_at": "2025-11-29T..."
}
```

**MongoDB Command:**
```javascript
db.tenants.updateOne(
  { subdomain: "company" },
  {
    $set: {
      "status": "suspended",
      "updated_at": new Date().toISOString()
    }
  }
)
```

**Effect:**
- ✅ Tenant users can no longer login
- ✅ API requests will fail with "Tenant not active" error
- ✅ Data preserved, can be reactivated

### Scenario 3: Add Custom Domain

**What to Change:**
```json
{
  "domain": "chat.company.com",
  "updated_at": "2025-11-29T..."
}
```

**MongoDB Command:**
```javascript
db.tenants.updateOne(
  { subdomain: "company" },
  {
    $set: {
      "domain": "chat.company.com",
      "updated_at": new Date().toISOString()
    }
  }
)
```

### Scenario 4: Extend Trial

**What to Change:**
```json
{
  "billing.is_trial": true,
  "billing.trial_ends_at": "2025-12-31T23:59:59Z",  // Extended
  "updated_at": "2025-11-29T..."
}
```

**MongoDB Command:**
```javascript
db.tenants.updateOne(
  { subdomain: "company" },
  {
    $set: {
      "billing.is_trial": true,
      "billing.trial_ends_at": "2025-12-31T23:59:59Z",
      "updated_at": new Date().toISOString()
    }
  }
)
```

---

## 🚨 Important Warnings

### ⚠️ Fields to NEVER Edit Manually

1. **`id`** - Breaks all relationships
2. **`database_name`** - Will cause data loss
3. **`database_uri`** - Will cause connection failures
4. **`created_at`** - Breaks audit trail
5. **`created_by`** - Breaks audit trail

### ⚠️ Fields to Edit with Caution

1. **`subdomain`** 
   - Changes URLs: `subdomain.fptchatbot.com`
   - Breaks existing integrations
   - Users won't find their login page
   - Only change if absolutely necessary

2. **`status`**
   - Immediately affects tenant access
   - `suspended` = No login, no API access
   - `cancelled` = Scheduled for deletion
   - `pending` = Not yet activated

3. **Database-related settings**
   - Ensure consistency
   - Test after changes

---

## ✅ Validation Rules

### When Editing, Ensure:

**Name:**
- ✅ Length: 3-100 characters
- ✅ Can contain letters, numbers, spaces, hyphens

**Subdomain:**
- ✅ Length: 3-63 characters
- ✅ Lowercase letters and numbers only
- ✅ Must be unique across all tenants
- ✅ Start and end with alphanumeric

**Custom Domain:**
- ✅ Valid domain format (e.g., `chat.company.com`)
- ✅ DNS must be configured separately

**Status:**
- ✅ One of: `active`, `suspended`, `pending`, `cancelled`

**Plan:**
- ✅ One of: `starter`, `professional`, `enterprise`

**Billing Cycle:**
- ✅ One of: `monthly`, `yearly`

**Settings (Numeric):**
- ✅ `max_users`: 1 to 999999 (or -1 for unlimited)
- ✅ `max_chatbots`: 1 to 999999 (or -1 for unlimited)
- ✅ `max_sessions_per_month`: 100 to 999999999
- ✅ `storage_limit_gb`: 1 to 10000

---

## 🎯 Future Features (Roadmap)

### Coming Soon
- [ ] Edit Tenant UI in Super Admin Dashboard
- [ ] Audit log for all tenant changes
- [ ] Bulk edit multiple tenants
- [ ] Clone tenant configuration
- [ ] Tenant templates
- [ ] Change history view

### Planned API Endpoints

**PUT /api/admin/tenants** - Update tenant
```typescript
Request Body:
{
  "tenantId": "t_xxx",
  "name": "New Company Name",
  "status": "active",
  "plan": "professional",
  "settings": {
    "max_users": 20,
    ...
  },
  "billing": {
    "plan_price": 99,
    ...
  }
}

Response:
{
  "success": true,
  "tenant": { ...updated tenant... },
  "message": "Tenant updated successfully"
}
```

---

## 📊 Quick Reference Table

| Field | Edit via UI | Edit via DB | Impact | Reversible |
|-------|------------|-------------|--------|------------|
| Name | Coming soon | ✅ Yes | None | ✅ Yes |
| Subdomain | Coming soon | ⚠️ Caution | URLs change | ⚠️ Partial |
| Domain | Coming soon | ✅ Yes | None | ✅ Yes |
| Status | Coming soon | ✅ Yes | Access control | ✅ Yes |
| Plan | Coming soon | ✅ Yes | Features/limits | ✅ Yes |
| Settings | Coming soon | ✅ Yes | Feature availability | ✅ Yes |
| Billing | Coming soon | ✅ Yes | Pricing | ✅ Yes |

---

## 🆘 Troubleshooting

### After Editing Tenant...

**Tenant can't login?**
- Check `status` is `active`
- Verify subdomain wasn't changed
- Check database connection is valid

**Features not working?**
- Verify `settings` were updated correctly
- Check plan includes the feature
- Restart application if needed

**Billing issues?**
- Check `billing.plan_price` matches plan
- Verify `billing.next_billing_date` is future date
- Ensure `billing.billing_cycle` is valid

---

## 📞 Summary

### What You Can Edit Now (via Database)

✅ **Safe to Edit:**
- Name
- Custom domain
- Status (active/suspended)
- Plan tier
- All settings limits
- Billing information

⚠️ **Edit with Caution:**
- Subdomain

❌ **Never Edit:**
- ID
- Database name/URI
- Created at/by timestamps

### What's Coming Soon

UI features in Super Admin Dashboard:
- Edit button in tenant list
- Edit modal with form validation
- API endpoint for updates
- Audit logging
- Change history

---

**Last Updated**: November 29, 2025  
**Edit UI**: ⏳ Coming Soon  
**Edit via DB**: ✅ Available Now  
**Documentation**: Complete
