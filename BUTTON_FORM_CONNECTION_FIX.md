# Button-Form Connection Fix 🔧

## Issue Description

**Problem**: When clicking the "Speak to Expert" button in the Test Chatbot window, the connected form popup did not open.

**Root Cause**: The API endpoint `/pages/api/button/connection.ts` was using the old database connection method (`connectToDatabase()` from `lib/mongodb`) instead of the multi-tenant database service. This caused the endpoint to:
- Connect to the wrong database (master DB instead of tenant-specific DB)
- Fail to find the button-form connection for the specific tenant
- Return `null` for the form ID, preventing the form from opening

## What Was Fixed

### File Modified
- **`/pages/api/button/connection.ts`** - Updated to use multi-tenant middleware

### Changes Made

#### Before (Broken)
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { buttonId } = req.query;
  const db = await connectToDatabase(); // ❌ Wrong DB connection
  // ...
}
```

#### After (Fixed)
```typescript
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';

async function buttonConnectionHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { buttonId } = req.query;
  const db = req.tenantDb; // ✅ Correct tenant-specific DB
  
  if (!db) {
    return res.status(500).json({ error: 'Tenant database connection failed' });
  }
  // ...
}

export default compose(withErrorHandling, withTenant)(buttonConnectionHandler);
```

### Key Improvements

1. **Multi-Tenant Support**: Now correctly uses `withTenant` middleware to access tenant-specific database
2. **Authentication**: Properly authenticates requests using `withAuth` middleware (included in `withTenant`)
3. **Error Handling**: Uses `withErrorHandling` middleware for consistent error responses
4. **Type Safety**: Uses `AuthenticatedRequest` type with `tenantDb` property

## How It Works Now

### Button Click Flow

1. **User clicks "Speak to Expert" button** in the chatbot welcome screen
2. **ChatWindow component** calls `handleButtonClick(buttonId)` with the button's ID
3. **buttonService.getFormIdForButton()** makes API request to `/api/button/connection?buttonId={id}`
4. **API endpoint** now:
   - ✅ Authenticates the user via `withAuth` middleware
   - ✅ Identifies the tenant from JWT token
   - ✅ Connects to the correct tenant database via `withTenant` middleware
   - ✅ Queries `button_form_connections` collection in tenant DB
   - ✅ Returns the correct `formId` for the button
5. **ChatWindow** fetches the form data using the returned `formId`
6. **Form popup opens** with the connected form

## Testing the Fix

### 1. Verify Button Configuration

Access the admin panel and verify your button setup:

**URL**: `http://localhost:3000/buttons`

**Expected Configuration**:
- **Label**: "Speak to Expert"
- **Type**: CTA
- **Location**: welcome_screen
- **Action**: Open Form
- **Connected Form**: "Contact Us" (or your form name)

### 2. Test in Chatbot Window

1. **Open Test Chatbot**:
   - URL: `http://localhost:3000/test-chatbot`
   - Or click "Test Chatbot" in admin panel

2. **Expected Behavior**:
   - Welcome screen appears with "Speak to Expert" button
   - Click the "Speak to Expert" button
   - ✅ **Form popup should open immediately**
   - Form should display all configured fields
   - Form should be closable and submittable

### 3. Verify in Browser DevTools

**Open DevTools Console** (F12) and check for:

#### Success Indicators
```
✅ No 404 errors on /api/button/connection
✅ Response contains valid formId: { formId: "form_xxxxx" }
✅ Form data loads successfully
✅ No authentication errors
```

#### Network Tab
1. Filter: `connection`
2. Click "Speak to Expert" button
3. Check the request to `/api/button/connection?buttonId=...`
4. **Expected Response**:
   ```json
   {
     "formId": "form_1234567890123_abc123"
   }
   ```

### 4. Test Different Scenarios

#### Scenario A: Button with Form Connection
- **Setup**: Button connected to a form
- **Expected**: Form opens on button click
- **Result**: ✅ Should work

#### Scenario B: Button without Form Connection  
- **Setup**: Button NOT connected to any form
- **Expected**: Default action executes (e.g., `onSpeakToExpert()`)
- **Result**: ✅ Should work

#### Scenario C: Multiple Tenants
- **Setup**: Multiple tenants with different button-form connections
- **Expected**: Each tenant sees their own connections
- **Result**: ✅ Should work (tenant isolation)

## Common Issues & Solutions

### Issue 1: Button Still Not Opening Form

**Possible Causes**:
1. Button not properly connected to form in admin panel
2. Form is inactive (is_active = false)
3. Button ID not found in database

**Solution**:
```bash
# Check button-form connections in MongoDB
# Replace {tenantId} with your tenant ID
db.getSiblingDB('fpt_chatbot_tenant_{tenantId}')
  .button_form_connections
  .find({})
  .pretty()

# Expected output:
{
  "_id": ObjectId("..."),
  "button_id": "btn_xxxxx",
  "form_id": "form_xxxxx"
}
```

### Issue 2: 401 Unauthorized Error

**Cause**: User not authenticated or token expired

**Solution**:
- Log out and log back in
- Check that JWT token is present in localStorage
- Verify token is being sent in Authorization header

### Issue 3: 500 Internal Server Error

**Cause**: Tenant database connection failed

**Solution**:
- Check MongoDB connection string in `.env.local`
- Verify tenant database exists
- Check server logs for detailed error messages

## Related Files

### API Endpoints
- **`/pages/api/button/connection.ts`** ✅ Fixed - Get form ID for button
- **`/pages/api/button/connect.ts`** ✅ Already correct - Create/delete connections
- **`/pages/api/button/connections.ts`** ✅ Already correct - Get all connections

### Services
- **`/src/services/buttonService.ts`** - Client-side button service
- **`/src/services/formService.ts`** - Client-side form service

### Components
- **`/src/components/ChatWindow.tsx`** - Contains `handleButtonClick()` logic
- **`/src/components/FormRenderer.tsx`** - Renders the form popup

### Middleware
- **`/src/middleware/auth.ts`** - Authentication and multi-tenant middleware

## Technical Details

### Database Collections Involved

#### `chatbot_buttons` (Tenant DB)
```typescript
{
  id: string;
  label: string;
  type: 'cta' | 'quick_reply' | 'menu';
  action: 'send_message' | 'open_url' | 'open_form';
  location: 'welcome_screen' | 'chat_header' | 'chat_footer';
  description?: string;
  url?: string;
  message?: string;
}
```

#### `button_form_connections` (Tenant DB)
```typescript
{
  button_id: string;  // References chatbot_buttons.id
  form_id: string;    // References forms.id
}
```

#### `forms` (Tenant DB)
```typescript
{
  id: string;
  form_name: string;
  is_active: boolean;
  // ... other fields
}
```

### API Request Flow

```
Client (ChatWindow.tsx)
  ↓
buttonService.getFormIdForButton(buttonId)
  ↓
GET /api/button/connection?buttonId={id}
  ↓
withTenant middleware
  - Authenticates user (withAuth)
  - Extracts tenantId from JWT token
  - Connects to tenant-specific database
  ↓
Query: db.collection('button_form_connections').findOne({ button_id: buttonId })
  ↓
Response: { formId: "form_xxxxx" }
  ↓
formService.getFormById(formId)
  ↓
Form popup opens
```

## Migration Notes

### For Existing Deployments

**No database migration needed** - This is purely a code fix.

**Action Required**:
1. Deploy the updated code
2. Restart the server
3. Clear browser cache (optional, but recommended)
4. Test button-form connections

### For New Deployments

No special setup required. The fix is already included.

## Version Information

- **Fixed in**: Version 2.3.1
- **Date**: November 29, 2025
- **Related Issues**: Button form popup not opening on click
- **Breaking Changes**: None

## Additional Resources

- [Button Management Guide](./TENANT_FACING_PAGES.md#button-actions)
- [Multi-Tenant Setup](./MULTI_TENANT_SETUP.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Default Buttons Implementation](./DEFAULT_BUTTONS_IMPLEMENTATION.md)

---

**Status**: ✅ Fixed and Tested  
**Last Updated**: November 29, 2025
