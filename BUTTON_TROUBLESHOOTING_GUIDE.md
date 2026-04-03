# Button Troubleshooting Quick Reference 🔍

## Quick Diagnosis Guide

### Problem: Button Click Does Nothing

#### Step 1: Check Button Configuration
```
Admin Panel → Button Actions (http://localhost:3000/buttons)
```

Verify:
- ✅ Button exists with correct label
- ✅ Type is set correctly (CTA, Quick Reply, Menu)
- ✅ Location matches where you expect it (welcome_screen, etc.)
- ✅ Action is configured (Open Form, Send Message, Open URL)

#### Step 2: Check Form Connection
If action is "Open Form":
- ✅ A form is selected in the dropdown
- ✅ Form shows as "Connected" with green checkmark
- ✅ Form is active (not disabled)

#### Step 3: Check Browser Console
Press F12 → Console tab

**Look for**:
```
❌ 404 error on /api/button/connection
❌ 401 Unauthorized
❌ 500 Internal Server Error
❌ Error: formId is null
```

#### Step 4: Check Network Tab
Press F12 → Network tab → Click button

**Check request to**: `/api/button/connection?buttonId=...`

| Status | Response | Meaning | Fix |
|--------|----------|---------|-----|
| 200 | `{ formId: null }` | No connection found | Reconnect button to form in admin |
| 200 | `{ formId: "form_xxx" }` | ✅ Working | Check form configuration |
| 401 | Unauthorized | Not logged in | Log in again |
| 404 | Not Found | API issue | Check server logs |
| 500 | Internal Error | Database issue | Check MongoDB connection |

---

## Common Issues & Solutions

### Issue 1: Form Popup Doesn't Open

**Symptoms**:
- Button clicks but nothing happens
- No errors in console
- API returns `{ formId: null }`

**Cause**: Button not connected to form

**Fix**:
1. Go to Button Actions page
2. Click Edit on your button
3. Select "Open Form" action
4. Choose form from dropdown
5. Click Save
6. Test again

---

### Issue 2: Wrong Database Connection

**Symptoms**:
- API returns `{ formId: null }` even though connection exists
- Works for super admin but not tenant users
- Console error: "Tenant database connection failed"

**Cause**: API endpoint using wrong database

**Fix**: ✅ Already fixed in v2.3.1
- File: `/pages/api/button/connection.ts`
- Now uses `withTenant` middleware

**Verify Fix**:
```bash
# Check the file contains this:
grep "withTenant" pages/api/button/connection.ts

# Should output:
export default compose(withErrorHandling, withTenant)(buttonConnectionHandler);
```

---

### Issue 3: Form is Inactive

**Symptoms**:
- API returns valid formId
- Form still doesn't open
- Console: "Form is not active"

**Cause**: Form is_active flag is false

**Fix**:
1. Go to Custom Forms page
2. Find your form
3. Check if it's marked as inactive
4. Edit form and activate it
5. Save and test

---

### Issue 4: Button ID Not Found

**Symptoms**:
- Console error: "Button not found"
- API returns 404
- Welcome screen shows default buttons

**Cause**: Button was deleted or ID mismatch

**Fix**:
1. Check Button Actions page
2. Verify button exists
3. Note down the exact button ID
4. Check if button label matches exactly "Speak to Expert"
5. If missing, create new button

---

### Issue 5: Multi-Tenant Isolation Issue

**Symptoms**:
- Works for one tenant, not for another
- Console: "Tenant database connection failed"
- Button appears but connection is missing

**Cause**: Button/connection exists in one tenant DB but not another

**Fix**:
1. **For NEW tenants**: Automatic (default buttons seeded)
2. **For EXISTING tenants**: Run migration script
   ```bash
   node scripts/seedDefaultButtons.js
   ```

---

## Testing Checklist

### Before Opening Support Ticket

Run through this checklist:

- [ ] **Server is running**: `npm run dev` is active
- [ ] **Logged in as tenant user**: Not super admin
- [ ] **Button exists**: Visible in Button Actions page
- [ ] **Form exists**: Visible in Custom Forms page
- [ ] **Connection exists**: Button shows "Connected to: [Form Name]"
- [ ] **Form is active**: Green "Active" badge on form
- [ ] **No console errors**: Check browser DevTools
- [ ] **API responds**: Check Network tab for 200 OK
- [ ] **Correct formId returned**: Not null in response
- [ ] **Browser cache cleared**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

---

## Quick Commands

### Check Database Connection
```javascript
// Run in browser console (while logged in)
fetch('/api/button/connection?buttonId=YOUR_BUTTON_ID')
  .then(r => r.json())
  .then(console.log)

// Expected output:
// { formId: "form_1234567890123_abc" }
```

### Check All Buttons
```javascript
// Run in browser console (while logged in)
fetch('/api/button?type=cta')
  .then(r => r.json())
  .then(console.log)

// Look for your button in the data array
```

### Check All Forms
```javascript
// Run in browser console (while logged in)
fetch('/api/form')
  .then(r => r.json())
  .then(console.log)

// Look for your form in the data array
```

---

## Advanced Debugging

### MongoDB Direct Query

Connect to MongoDB and run:

```javascript
// Replace {tenantId} with your actual tenant ID
use fpt_chatbot_tenant_{tenantId}

// Check button exists
db.chatbot_buttons.find({ label: "Speak to Expert" }).pretty()

// Check form exists  
db.forms.find({ form_name: "Contact Us" }).pretty()

// Check connection exists
db.button_form_connections.find({}).pretty()

// Expected output:
{
  "_id": ObjectId("..."),
  "button_id": "btn_xxxxx",
  "form_id": "form_xxxxx"
}
```

### Server Logs

Check terminal where `npm run dev` is running:

**Look for**:
```
✅ Connected to tenant database: fpt_chatbot_tenant_xxx
✅ Button connection found: form_xxx
❌ Error: Tenant database connection failed
❌ Error fetching form ID for button
```

---

## File Locations

### Key Files to Check

| File | Purpose | What to Check |
|------|---------|---------------|
| `/pages/api/button/connection.ts` | Get form ID for button | Uses `withTenant` middleware |
| `/pages/api/button/connect.ts` | Create/delete connections | Works correctly |
| `/src/components/ChatWindow.tsx` | Button click handler | `handleButtonClick` function |
| `/src/services/buttonService.ts` | Client-side button service | `getFormIdForButton` method |

### Verify Multi-Tenant Fix

```bash
# This should show the multi-tenant middleware
grep -A 5 "export default" pages/api/button/connection.ts

# Expected output:
export default compose(withErrorHandling, withTenant)(buttonConnectionHandler);
```

---

## Emergency Reset

### If All Else Fails

1. **Clear browser storage**:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

3. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Re-login**: Log out and log back in

5. **Recreate connection**:
   - Delete button-form connection
   - Create it again
   - Test immediately

---

## Support Resources

### Documentation
- [BUTTON_FORM_CONNECTION_FIX.md](./BUTTON_FORM_CONNECTION_FIX.md) - Detailed fix guide
- [DEFAULT_BUTTONS_IMPLEMENTATION.md](./DEFAULT_BUTTONS_IMPLEMENTATION.md) - Default buttons
- [TENANT_FACING_PAGES.md](./TENANT_FACING_PAGES.md) - Button Actions page guide

### Test Tools
- **Test Script**: `bash scripts/testButtonFormConnection.sh`
- **Test Page**: http://localhost:3000/test-chatbot

### Quick Tests
```bash
# 1. Test button exists
curl http://localhost:3000/api/button?type=cta

# 2. Test connection (replace YOUR_ID)
curl http://localhost:3000/api/button/connection?buttonId=YOUR_ID

# 3. Run automated test
bash scripts/testButtonFormConnection.sh
```

---

## Status Indicators

### ✅ Working Correctly
- Button click → Form opens immediately
- Network: 200 OK with valid formId
- Console: No errors
- Form displays and submits

### ⚠️ Partial Issue
- Button click → Delayed response
- Network: 200 OK but formId is null
- Console: Warnings but no errors
- Need to check connection

### ❌ Not Working
- Button click → Nothing happens
- Network: 404, 401, or 500 error
- Console: Multiple errors
- Need to check configuration and server

---

**Quick Reference Version**: 1.0  
**Last Updated**: November 29, 2025  
**For Version**: 2.3.1+
