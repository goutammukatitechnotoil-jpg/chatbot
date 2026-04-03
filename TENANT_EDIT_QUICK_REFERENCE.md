# Tenant Edit UI - Quick Reference Guide

## 🚀 Quick Start

### For Developers

**Files Modified**:
1. `src/services/tenantService.ts` - Added `getTenantById()`
2. `src/components/SuperAdminDashboard.tsx` - Added edit UI and handlers
3. `pages/api/admin/tenants.ts` - Completed PUT/DELETE handlers

**Run the project**:
```bash
npm run dev
# Open http://localhost:3000
# Login as Super Admin
# Navigate to Tenants tab
```

### For Users

**How to Edit a Tenant**:
1. Go to Super Admin Dashboard → Tenants tab
2. Click the **pencil icon** (Edit) on any tenant row
3. Modify fields in the modal
4. Click **Update Tenant**
5. Done! ✅

**How to Delete a Tenant**:
1. Go to Super Admin Dashboard → Tenants tab
2. Click the **trash icon** (Delete) on any tenant row
3. Confirm the action
4. Done! (Tenant status = cancelled) ✅

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Edit Modal** | Beautiful UI for editing tenant details |
| **Editable Fields** | Name, Subdomain, Custom Domain, Plan, Status |
| **Validation** | Real-time validation with error messages |
| **Soft Delete** | Deletes mark tenant as "cancelled" (recoverable) |
| **Auto-Refresh** | Table and stats update after save |
| **Loading States** | Spinners and disabled buttons during operations |

---

## 📋 API Endpoints

### PUT /api/admin/tenants
**Update a tenant**

```javascript
// Request
PUT /api/admin/tenants
Headers: { Authorization: "Bearer TOKEN" }
Body: {
  "tenantId": "tenant_xxx",
  "name": "New Name",
  "plan": "professional",
  "status": "active"
}

// Response
{
  "success": true,
  "message": "Tenant updated successfully",
  "tenant": { ... }
}
```

### DELETE /api/admin/tenants
**Soft-delete a tenant**

```javascript
// Request
DELETE /api/admin/tenants?tenantId=tenant_xxx
Headers: { Authorization: "Bearer TOKEN" }

// Response
{
  "success": true,
  "message": "Tenant deleted successfully"
}
```

---

## 🎨 UI Components

### EditTenantModal
**Location**: `src/components/SuperAdminDashboard.tsx` (line ~1223)

**Props**:
```typescript
{
  tenant: Tenant;           // Tenant to edit
  onClose: () => void;      // Close modal callback
  onUpdate: (data: Partial<Tenant>) => void;  // Update callback
}
```

**Fields**:
- Company Name (required)
- Subdomain (required, validated)
- Custom Domain (optional)
- Plan (starter/professional/enterprise)
- Status (active/suspended/pending/cancelled)

**Features**:
- Pre-filled with current data
- Real-time validation
- Loading states
- Error messages
- Confirmation on save

---

## 🔧 Code Snippets

### Use in Component
```typescript
import { Tenant } from '../types/tenant';

// State
const [showEditTenantModal, setShowEditTenantModal] = useState(false);
const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

// Handler
const handleEditTenant = (tenant: Tenant) => {
  setSelectedTenant(tenant);
  setShowEditTenantModal(true);
};

// Render
{showEditTenantModal && selectedTenant && (
  <EditTenantModal
    tenant={selectedTenant}
    onClose={() => {
      setShowEditTenantModal(false);
      setSelectedTenant(null);
    }}
    onUpdate={handleUpdateTenant}
  />
)}
```

### API Call
```typescript
// Update tenant
const response = await fetch('/api/admin/tenants', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tenantId: tenant.id,
    name: "Updated Name",
    plan: "professional"
  })
});

const data = await response.json();
```

### Service Method
```typescript
import TenantService from '../services/tenantService';

// Get tenant by ID
const tenant = await TenantService.getTenantById(tenantId);

// Update tenant
const updated = await TenantService.updateTenant(tenantId, {
  name: "New Name",
  plan: "professional"
});

// Delete tenant (soft)
await TenantService.deleteTenant(tenantId);
```

---

## ✅ Validation Rules

### Subdomain
- **Format**: Lowercase alphanumeric and hyphens only
- **Length**: 3-63 characters
- **Pattern**: `/^[a-z0-9][a-z0-9-]*[a-z0-9]$/`
- **Unique**: Must not exist for another tenant

### Status
- **Allowed**: `active`, `suspended`, `pending`, `cancelled`

### Plan
- **Allowed**: `starter`, `professional`, `enterprise`

### Name
- **Required**: Yes
- **Min Length**: 1 character

---

## 🐛 Troubleshooting

### "Subdomain already exists"
- Try a different subdomain
- Check if another tenant uses it

### Modal doesn't open
- Check browser console for errors
- Refresh the page
- Clear cache

### Changes not saving
- Verify internet connection
- Check MongoDB connection
- Review error message

### API returns 401
- Token expired - log in again
- Not authorized - verify super admin role

---

## 📚 Documentation

- **Full Guide**: `TENANT_EDIT_UI_COMPLETE.md`
- **Testing**: `TENANT_EDIT_TESTING_QUICK.md`
- **Summary**: `IMPLEMENTATION_SUMMARY_COMPLETE.md`

---

## 🎓 Learning Resources

### TypeScript
- Tenant type: `src/types/tenant.ts`
- Partial types for updates

### React
- useState for modal state
- useEffect for data loading
- Event handlers

### API Design
- RESTful endpoints
- Error handling
- Validation

---

## 🔒 Security Notes

- ✅ Super admin authentication required
- ✅ Rate limiting (10 req/min)
- ✅ Input validation (frontend + backend)
- ✅ CSRF protection
- ✅ JWT token verification

---

## 📊 Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Operation completed |
| 400 | Bad Request | Check input data |
| 401 | Unauthorized | Login again |
| 404 | Not Found | Tenant doesn't exist |
| 409 | Conflict | Subdomain exists |
| 500 | Server Error | Check logs |

---

## 🎯 Common Tasks

### Task 1: Edit tenant name
```typescript
// Frontend
handleEditTenant(tenant);
// Change name in modal
// Click Update

// Backend
PUT /api/admin/tenants
{ tenantId: "xxx", name: "New Name" }
```

### Task 2: Change tenant plan
```typescript
// Frontend
handleEditTenant(tenant);
// Select new plan
// Click Update

// Backend
PUT /api/admin/tenants
{ tenantId: "xxx", plan: "professional" }
```

### Task 3: Suspend tenant
```typescript
// Frontend
handleEditTenant(tenant);
// Change status to "Suspended"
// Click Update

// Backend
PUT /api/admin/tenants
{ tenantId: "xxx", status: "suspended" }
```

### Task 4: Delete tenant
```typescript
// Frontend
handleDeleteTenant(tenant.id);
// Confirm dialog

// Backend
DELETE /api/admin/tenants?tenantId=xxx
```

---

## ⚡ Performance Tips

1. **Debounce Search**: Already implemented (500ms)
2. **Minimize API Calls**: Only on dependency change
3. **Connection Pooling**: Optimized for M0 tier
4. **Lazy Loading**: Load data on demand

---

## 📞 Support

- **Issues**: Check browser console and server logs
- **Questions**: See full documentation files
- **Bugs**: Review error messages and troubleshooting guide

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: ✅ Production Ready
