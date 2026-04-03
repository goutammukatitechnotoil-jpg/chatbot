# Default "Contact Us" Form - Quick Start Guide 🚀

## What This Feature Does

Automatically creates a complete "Contact Us" form with 8 standardized fields for all tenants (new and existing). The form is pre-connected to the "Speak to Expert" button.

## 📋 Form Fields

1. **Name** (Required) - Text input
2. **Company Name** (Required) - Text input
3. **Job Title** (Required) - Text input
4. **Country** (Required) - Dropdown with 10 countries
5. **Email** (Required) - Email input with validation
6. **Phone** (Optional) - Text input
7. **Purpose** (Required) - Dropdown with 6 options
8. **Details** (Required) - Large text area

## 🎯 Benefits

- ✅ **Zero Configuration** - Works out of the box for new tenants
- ✅ **Standardized** - Consistent lead capture across all tenants
- ✅ **Pre-Connected** - "Speak to Expert" button ready to use
- ✅ **Customizable** - Tenants can modify as needed
- ✅ **Professional** - Clean, modern form design

---

## For NEW Tenants

### Automatic Setup

When you create a new tenant:

1. **Form is auto-created** - "Contact Us" with all 8 fields
2. **Button is auto-connected** - "Speak to Expert" → "Contact Us"
3. **Ready to use** - No configuration needed

### Test It

1. Navigate to: `http://localhost:3000/test-chatbot`
2. Click "Speak to Expert" button
3. ✅ Form popup should appear with all 8 fields

---

## For EXISTING Tenants

### One-Time Migration

Run this command once:

```bash
node scripts/seedDefaultContactForm.js
```

### What It Does

- ✅ Creates "Contact Us" form
- ✅ Adds all 8 fields
- ✅ Connects "Speak to Expert" button to form
- ✅ Safe to run multiple times (idempotent)
- ✅ Works for all active tenants

### Expected Output

```
🚀 Default "Contact Us" Form Seeding Script
============================================================

📡 Connecting to master database...
✅ Connected to master database

📊 Found 5 active tenant(s)

📋 Processing tenant: tenant_001
  ✅ Created "Contact Us" form
  ✅ Added 8 form field(s)
  ✅ Connected "Speak to Expert" button to "Contact Us" form

... (more tenants)

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successful: 5
❌ Failed: 0
📋 Total: 5

✨ Migration completed!
```

---

## Quick Verification

### Check in Admin Panel

1. **Go to Custom Forms** (`/forms`)
   - Look for "Contact Us" form
   - Should show "8 fields"
   - Should show "🔒 System Form"

2. **Go to Button Actions** (`/buttons`)
   - Find "Speak to Expert" button
   - Should show "✅ Connected to: Contact Us"

3. **Test in Chatbot** (`/test-chatbot`)
   - Click "Speak to Expert"
   - Form popup should open
   - All 8 fields should be visible

---

## Customization

### What You CAN Change

✅ **Field Labels**: Rename fields (e.g., "Name" → "Full Name")  
✅ **Placeholders**: Update placeholder text  
✅ **Dropdown Options**: Add/remove countries or purposes  
✅ **Submit Button**: Change color or text  
✅ **Add Fields**: Add additional custom fields  
✅ **Field Order**: Reorder fields  

### What You SHOULD NOT Change

❌ **Form ID**: Keep `form_default_contact_us`  
❌ **Delete Form**: Breaks "Speak to Expert" button  
❌ **Delete Required Fields**: Affects lead quality  
❌ **Change Email Type**: Breaks validation  

---

## Troubleshooting

### Form Not Showing

**Problem**: Can't see "Contact Us" form in admin panel

**Solution**:
```bash
# Run migration script
node scripts/seedDefaultContactForm.js
```

### Button Not Connected

**Problem**: "Speak to Expert" button doesn't open form

**Solution**:
1. Go to Button Actions page
2. Edit "Speak to Expert" button
3. Select "Contact Us" in dropdown
4. Save

### Form Fields Missing

**Problem**: Some fields not appearing in form

**Solution**:
```bash
# Re-run migration (safe, adds missing fields)
node scripts/seedDefaultContactForm.js
```

---

## Field Specifications

| Field | Type | Required | Options |
|-------|------|----------|---------|
| Name | Text | Yes | - |
| Company Name | Text | Yes | - |
| Job Title | Text | Yes | - |
| Country | Dropdown | Yes | 10 countries |
| Email | Email | Yes | Validates format |
| Phone | Text | No | - |
| Purpose | Dropdown | Yes | 6 purposes |
| Details | Textarea | Yes | Multi-line |

### Country Options
- United States
- United Kingdom
- Canada
- Australia
- Germany
- France
- Japan
- Singapore
- Vietnam
- Other

### Purpose Options
- General Inquiry
- Product Demo
- Pricing Information
- Technical Support
- Partnership
- Other

---

## Lead Capture

### How It Works

1. User clicks "Speak to Expert"
2. Form popup opens
3. User fills fields and submits
4. Form data saved to database
5. Lead entry created with:
   - Form data (name, email, etc.)
   - Chat history
   - Session information
   - Timestamp

### Viewing Leads

1. Navigate to Lead List (`/leads`)
2. Find lead by name or email
3. Click to view details
4. See form data + conversation history

---

## API Integration

### Form Submission Endpoint

```
POST /api/form/submit
```

**Request**:
```json
{
  "form_id": "form_default_contact_us",
  "session_id": "session_xxx",
  "custom_data": {
    "Name": "John Doe",
    "Company Name": "ACME Corp",
    "Job Title": "Manager",
    "Country": "United States",
    "Email": "john@acme.com",
    "Phone": "+1-555-0123",
    "Purpose": "Product Demo",
    "Details": "Interested in your product"
  }
}
```

**Response**:
```json
{
  "data": {
    "id": "submission_xxx",
    "form_id": "form_default_contact_us",
    "created_at": "2025-11-29T..."
  }
}
```

---

## File Locations

### Implementation
- `/src/services/multiTenantDatabaseService.ts`
  - Function: `seedDefaultContactForm()`
  - Auto-runs for new tenants

### Migration Script
- `/scripts/seedDefaultContactForm.js`
  - Run for existing tenants
  - Idempotent and safe

### Documentation
- `/DEFAULT_CONTACT_FORM_IMPLEMENTATION.md` - Full documentation
- `/QUICK_START_DEFAULT_CONTACT_FORM.md` - This guide

---

## Testing Checklist

Before deploying:

- [ ] Run migration for existing tenants
- [ ] Create test tenant and verify form exists
- [ ] Click "Speak to Expert" button
- [ ] Verify form popup opens
- [ ] Fill all fields and submit
- [ ] Check lead appears in Lead List
- [ ] Verify form data in lead details
- [ ] Test with different field combinations
- [ ] Verify required field validation
- [ ] Test email format validation

---

## Support

### Need Help?

1. **Check Documentation**: [DEFAULT_CONTACT_FORM_IMPLEMENTATION.md](./DEFAULT_CONTACT_FORM_IMPLEMENTATION.md)
2. **Run Migration**: `node scripts/seedDefaultContactForm.js`
3. **Check Logs**: Look for errors in terminal
4. **Verify Database**: Check MongoDB for form and fields
5. **Test Chatbot**: Use Test Chatbot page

### Common Commands

```bash
# Add form to existing tenants
node scripts/seedDefaultContactForm.js

# Check for TypeScript errors
npm run typecheck

# Start dev server
npm run dev

# View test chatbot
# http://localhost:3000/test-chatbot
```

---

## Version Info

- **Version**: 2.4.0
- **Released**: November 29, 2025
- **Status**: Production Ready ✅
- **Migration**: Required for existing tenants

---

## What's Next?

After implementing this feature:

1. ✅ All new tenants get the form automatically
2. ✅ Run migration for existing tenants
3. ✅ Test form submission flow
4. ✅ Customize as needed per tenant
5. ✅ Monitor lead capture in Lead List

**That's it! Your default Contact Us form is ready to use. 🎉**

---

**Quick Links**:
- [Full Documentation](./DEFAULT_CONTACT_FORM_IMPLEMENTATION.md)
- [Button Implementation](./DEFAULT_BUTTONS_IMPLEMENTATION.md)
- [Multi-Tenant Setup](./MULTI_TENANT_SETUP.md)
- [README](./README.md)
