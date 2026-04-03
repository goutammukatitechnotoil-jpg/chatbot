# Tenant Edit UI - Quick Testing Guide

## Prerequisites
- Super Admin account created and logged in
- At least one test tenant exists
- MongoDB connection working
- Dev server running

## Quick Test Checklist

### 1. Visual Check
- [ ] Navigate to Super Admin Dashboard
- [ ] Click on **Tenants** tab
- [ ] Verify Edit (pencil) and Delete (trash) icons visible in Actions column
- [ ] All tenants displaying correctly

### 2. Edit Tenant - Success Path
```
1. Click Edit icon on any tenant
2. Modal should open with pre-filled data
3. Change Company Name to "Test Company Updated"
4. Change Plan to "Professional"
5. Click "Update Tenant"
6. Verify success message appears
7. Verify modal closes
8. Verify tenant name updated in table
9. Verify plan badge changed to "Professional"
```
**Expected**: ✅ All changes saved and visible

### 3. Edit Subdomain - Validation
```
1. Click Edit on tenant
2. Change subdomain to "new-test-subdomain"
3. Click "Update Tenant"
4. Verify success
5. Edit SAME tenant again
6. Try changing subdomain to an EXISTING subdomain
7. Click "Update Tenant"
```
**Expected**: ❌ Error message "Subdomain already exists"

### 4. Change Status
```
1. Edit any active tenant
2. Change Status to "Suspended"
3. Click "Update Tenant"
4. Verify status badge shows "Suspended" (red badge)
5. Use status filter dropdown
6. Select "Suspended"
```
**Expected**: ✅ Only suspended tenants shown

### 5. Delete Tenant
```
1. Click Delete (trash) icon on a test tenant
2. Confirm the dialog
3. Verify success message
4. Verify status changed to "Cancelled" (gray badge)
5. Filter by "Cancelled" status
```
**Expected**: ✅ Tenant soft-deleted (status = cancelled)

### 6. Custom Domain (Optional)
```
1. Edit tenant
2. Add Custom Domain: "example.com"
3. Click "Update Tenant"
```
**Expected**: ✅ Custom domain saved

### 7. Cancel Edit
```
1. Click Edit on tenant
2. Make some changes
3. Click "Cancel" button
```
**Expected**: ✅ Modal closes, no changes saved

### 8. Error Handling
```
1. Stop MongoDB or disconnect
2. Try to edit a tenant
3. Try to save changes
```
**Expected**: ❌ Error message displayed

### 9. API Direct Test (Optional)
```bash
# Test PUT endpoint
curl -X PUT http://localhost:3000/api/admin/tenants \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "YOUR_TENANT_ID",
    "name": "API Updated Name"
  }'

# Expected: {"success": true, "message": "Tenant updated successfully", ...}

# Test DELETE endpoint
curl -X DELETE "http://localhost:3000/api/admin/tenants?tenantId=YOUR_TENANT_ID" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"

# Expected: {"success": true, "message": "Tenant deleted successfully"}
```

### 10. Stats Update
```
1. Note current "Total Tenants" and "Active Tenants" numbers
2. Change a tenant from Active to Suspended
3. Refresh page or navigate away and back
```
**Expected**: ✅ Active tenants count decreased by 1

## Common Issues & Solutions

### Modal doesn't open
- **Check**: Browser console for errors
- **Fix**: Refresh page, clear cache

### Changes not saving
- **Check**: Network tab in DevTools
- **Fix**: Verify MongoDB connection, check server logs

### "Tenant not found" error
- **Check**: Tenant exists in database
- **Fix**: Use valid tenant ID

### Subdomain validation error
- **Check**: Subdomain format (lowercase, alphanumeric, hyphens)
- **Fix**: Use format like "my-company-name"

## Performance Check

- [ ] Edit modal opens in < 500ms
- [ ] Save operation completes in < 2s
- [ ] Table updates immediately after save
- [ ] No console errors
- [ ] No memory leaks (check DevTools)

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Success Criteria

✅ **All tests pass** = Ready for production  
⚠️ **Some tests fail** = Review errors and fix  
❌ **Many tests fail** = Check implementation

---

**Estimated Testing Time**: 15-20 minutes  
**Difficulty**: Easy  
**Required Role**: Super Admin
