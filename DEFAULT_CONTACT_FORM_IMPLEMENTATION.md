# Default "Contact Us" Form Implementation 📋

## Overview

This document describes the implementation of a default "Contact Us" form that is automatically seeded for all tenants (both new and existing). The form includes 8 standardized fields and is automatically connected to the "Speak to Expert" button.

## What Was Implemented

### ✨ Features

1. **Default Form Auto-Seeding**
   - Automatically created for all new tenants during database initialization
   - Can be added to existing tenants via migration script

2. **Standardized Fields** (8 total)
   - Name (Required)
   - Company Name (Required)
   - Job Title (Required)
   - Country (Required, Dropdown)
   - Email (Required)
   - Phone (Optional)
   - Purpose (Required, Dropdown)
   - Details (Required, Textarea)

3. **Auto-Connection to Button**
   - "Speak to Expert" button automatically connected to this form
   - Clicking the button opens the Contact Us form popup

---

## Form Specification

### Form Details

| Property | Value |
|----------|-------|
| **Form ID** | `form_default_contact_us` |
| **Form Name** | Contact Us |
| **Form Title (Display)** | Contact Us |
| **Form Description** | Please fill out the form below and we will get back to you as soon as possible. |
| **Description (Admin)** | Default contact form for lead capture |
| **Status** | Active |
| **System Form** | Yes (protected) |
| **CTA Button Text** | Submit |
| **CTA Button Color** | Orange (#f37021) |

### Field Definitions

#### 1. Name
- **Type**: Text
- **Required**: Yes
- **Placeholder**: Enter your full name
- **Field ID**: `form_default_contact_us_field_name`

#### 2. Company Name
- **Type**: Text
- **Required**: Yes
- **Placeholder**: Enter your company name
- **Field ID**: `form_default_contact_us_field_company`

#### 3. Job Title
- **Type**: Text
- **Required**: Yes
- **Placeholder**: Enter your job title
- **Field ID**: `form_default_contact_us_field_job_title`

#### 4. Country
- **Type**: Select (Dropdown)
- **Required**: Yes
- **Placeholder**: Select your country
- **Options**:
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
- **Field ID**: `form_default_contact_us_field_country`

#### 5. Email
- **Type**: Email
- **Required**: Yes
- **Placeholder**: Enter your email address
- **Validation**: Email format
- **Field ID**: `form_default_contact_us_field_email`

#### 6. Phone
- **Type**: Text
- **Required**: No
- **Placeholder**: Enter your phone number
- **Field ID**: `form_default_contact_us_field_phone`

#### 7. Purpose
- **Type**: Select (Dropdown)
- **Required**: Yes
- **Placeholder**: Select purpose of inquiry
- **Options**:
  - General Inquiry
  - Product Demo
  - Pricing Information
  - Technical Support
  - Partnership
  - Other
- **Field ID**: `form_default_contact_us_field_purpose`

#### 8. Details
- **Type**: Textarea
- **Required**: Yes
- **Placeholder**: Please provide additional details about your inquiry
- **Field ID**: `form_default_contact_us_field_details`

---

## Implementation Details

### For New Tenants

The form is automatically created when a new tenant is initialized:

**File**: `/src/services/multiTenantDatabaseService.ts`

**Function**: `seedDefaultContactForm(db: Db)`

**When Called**:
- During tenant database initialization
- After default buttons are seeded
- Before indexes are created

**Process**:
1. Creates the "Contact Us" form record
2. Creates all 8 form fields with proper configuration
3. Connects the "Speak to Expert" button (btn_talk_to_human) to the form
4. Logs success/failure for debugging

### For Existing Tenants

Use the migration script to add the form to all existing tenants:

**File**: `/scripts/seedDefaultContactForm.js`

**Command**:
```bash
node scripts/seedDefaultContactForm.js
```

**Features**:
- Processes all active tenants
- Idempotent (safe to run multiple times)
- Skips existing forms/fields
- Updates button connections if needed
- Provides detailed progress logs
- Summary report at the end

---

## Database Schema

### Forms Collection

```javascript
{
  _id: ObjectId("..."),
  id: "form_default_contact_us",
  form_name: "Contact Us",
  form_title: "Contact Us",
  form_description: "Please fill out the form below and we will get back to you as soon as possible.",
  description: "Default contact form for lead capture",
  is_active: true,
  is_system_form: true,
  cta_button_text: "Submit",
  cta_button_color: "#f37021",
  submit_button_text: "Submit",
  submit_button_color: "#f37021",
  created_at: "2025-11-29T...",
  updated_at: "2025-11-29T..."
}
```

### Form Fields Collection

```javascript
{
  _id: ObjectId("..."),
  id: "form_default_contact_us_field_name",
  form_id: "form_default_contact_us",
  field_name: "Name",
  field_type: "text",
  placeholder: "Enter your full name",
  placement: "full",
  is_required: true,
  order_index: 1,
  created_at: "2025-11-29T...",
  updated_at: "2025-11-29T..."
}
// ... 7 more field documents
```

### Button Form Connections Collection

```javascript
{
  _id: ObjectId("..."),
  button_id: "btn_talk_to_human",
  form_id: "form_default_contact_us",
  created_at: "2025-11-29T..."
}
```

---

## Testing the Implementation

### 1. Test for New Tenants

**Steps**:
1. Create a new tenant via Super Admin dashboard
2. Log in as the new tenant
3. Navigate to Custom Forms page: `http://localhost:3000/forms`
4. Verify "Contact Us" form exists with all 8 fields
5. Navigate to Button Actions page: `http://localhost:3000/buttons`
6. Verify "Speak to Expert" button is connected to "Contact Us" form
7. Go to Test Chatbot: `http://localhost:3000/test-chatbot`
8. Click "Speak to Expert" button
9. Verify Contact Us form popup opens with all fields

**Expected Results**:
- ✅ Form exists in Custom Forms list
- ✅ All 8 fields are present and configured correctly
- ✅ Button shows "Connected to: Contact Us"
- ✅ Form popup opens when button is clicked
- ✅ All required fields are marked with asterisk (*)
- ✅ Dropdown fields show all options
- ✅ Form can be submitted successfully

### 2. Test Migration for Existing Tenants

**Steps**:
1. Run the migration script:
   ```bash
   node scripts/seedDefaultContactForm.js
   ```
2. Check console output for success/failure
3. Log in as an existing tenant
4. Follow steps 3-9 from "Test for New Tenants" above

**Expected Output**:
```
🚀 Default "Contact Us" Form Seeding Script
============================================================

This script will:
  1. Add a default "Contact Us" form to all tenants
  2. Add 8 form fields (Name, Company, Job Title, Country, Email, Phone, Purpose, Details)
  3. Connect the "Speak to Expert" button to this form

📡 Connecting to master database...
✅ Connected to master database

📊 Found 3 active tenant(s)

📋 Processing tenant: tenant_123
  ✅ Created "Contact Us" form
  ✅ Added 8 form field(s)
  ✅ Connected "Speak to Expert" button to "Contact Us" form

📋 Processing tenant: tenant_456
  ⏭️  "Contact Us" form already exists
  ⏭️  Skipped 8 existing field(s)
  ⏭️  Button already connected to "Contact Us" form

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successful: 3
❌ Failed: 0
📋 Total: 3

✨ Migration completed!
🔌 Disconnected from master database

✅ Script finished successfully
```

### 3. Test Form Submission

**Steps**:
1. Open Test Chatbot
2. Click "Speak to Expert"
3. Fill in all required fields:
   - Name: "John Doe"
   - Company Name: "ACME Corp"
   - Job Title: "Marketing Manager"
   - Country: "United States"
   - Email: "john@acme.com"
   - Phone: "+1-555-0123" (optional)
   - Purpose: "Product Demo"
   - Details: "Interested in seeing a demo of your product"
4. Click Submit
5. Navigate to Lead List: `http://localhost:3000/leads`
6. Verify new lead entry with form data

**Expected Results**:
- ✅ Form submits without errors
- ✅ Lead appears in Lead List
- ✅ Lead contains all form data
- ✅ Lead has conversation history
- ✅ Lead shows correct timestamp

---

## User Experience

### Admin Panel View

**Custom Forms Page** (`/forms`):
```
┌─────────────────────────────────────────┐
│ Custom Forms                             │
├─────────────────────────────────────────┤
│                                          │
│  📋 Contact Us                           │
│  Default contact form for lead capture  │
│  ✅ Active  🔒 System Form               │
│  8 fields • Connected to 1 button        │
│  [Edit] [View Fields]                    │
│                                          │
└─────────────────────────────────────────┘
```

**Button Actions Page** (`/buttons`):
```
┌─────────────────────────────────────────┐
│ Button Actions                           │
├─────────────────────────────────────────┤
│                                          │
│  🔘 Speak to Expert                      │
│  CTA • welcome_screen                    │
│  ✅ Connected to: Contact Us             │
│  [Edit] [Disconnect]                     │
│                                          │
└─────────────────────────────────────────┘
```

### Chatbot View

**Welcome Screen**:
```
┌─────────────────────────────────────────┐
│ FPT Software Chatbot                     │
├─────────────────────────────────────────┤
│                                          │
│   [Image Slider]                         │
│                                          │
│   ┌─────────────────────────────────┐   │
│   │   Speak to Expert               │   │
│   └─────────────────────────────────┘   │
│                                          │
│   ┌─────────────────────────────────┐   │
│   │   Continue with AI              │   │
│   └─────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

**Form Popup** (after clicking "Speak to Expert"):
```
┌─────────────────────────────────────────┐
│ Contact Us                          [X]  │
├─────────────────────────────────────────┤
│                                          │
│  Name *                                  │
│  [Enter your full name              ]   │
│                                          │
│  Company Name *                          │
│  [Enter your company name           ]   │
│                                          │
│  Job Title *                             │
│  [Enter your job title              ]   │
│                                          │
│  Country *                               │
│  [Select your country              ▼]   │
│                                          │
│  Email *                                 │
│  [Enter your email address          ]   │
│                                          │
│  Phone                                   │
│  [Enter your phone number           ]   │
│                                          │
│  Purpose *                               │
│  [Select purpose of inquiry        ▼]   │
│                                          │
│  Details *                               │
│  [Please provide additional         ]   │
│  [details about your inquiry        ]   │
│  [                                  ]   │
│                                          │
│        [Submit]                          │
│                                          │
└─────────────────────────────────────────┘
```

---

## Customization Options

### For Tenant Admins

The default form can be customized:

1. **Edit Form Name**
   - Not recommended (affects button connection)
   - If changed, update button connection manually

2. **Edit Form Description**
   - ✅ Safe to customize

3. **Modify Fields**
   - ✅ Edit placeholders
   - ✅ Edit field names
   - ⚠️  Don't delete required fields (affects lead capture)
   - ✅ Add additional custom fields

4. **Add More Options**
   - ✅ Add countries to Country dropdown
   - ✅ Add purposes to Purpose dropdown

5. **Styling**
   - ✅ Change submit button text
   - ✅ Change submit button color

### What NOT to Change

❌ **Don't Delete**:
- The entire form (breaks button connection)
- Required fields (affects lead quality)

❌ **Don't Change**:
- Form ID (`form_default_contact_us`)
- Field IDs (breaks field mappings)
- Field types for Email (breaks validation)

---

## Troubleshooting

### Form Not Appearing

**Problem**: "Contact Us" form not visible in Custom Forms list

**Possible Causes**:
1. Tenant created before this feature was implemented
2. Migration script not run
3. Database connection issue

**Solutions**:
1. Run migration script: `node scripts/seedDefaultContactForm.js`
2. Check tenant database connection
3. Manually verify in MongoDB

### Button Not Connected

**Problem**: "Speak to Expert" button not connected to form

**Possible Causes**:
1. Connection not created during seeding
2. Button was disconnected manually
3. Form was deleted and recreated

**Solutions**:
1. Go to Button Actions page
2. Click Edit on "Speak to Expert" button
3. Select "Contact Us" from dropdown
4. Click Save
5. Or run migration script again

### Form Fields Missing

**Problem**: Some fields not showing in the form

**Possible Causes**:
1. Fields were deleted manually
2. Database query failed during seeding
3. Form was edited and fields removed

**Solutions**:
1. Run migration script again (it will add missing fields)
2. Or manually recreate fields in Custom Forms page
3. Use field IDs from specification above

### Form Submission Fails

**Problem**: Error when submitting the form

**Possible Causes**:
1. Required fields not filled
2. Email format invalid
3. API endpoint error

**Solutions**:
1. Check all required fields have values
2. Verify email format is correct
3. Check browser console for errors
4. Verify API endpoint `/api/form/submit` is working

---

## Migration Script Details

### Script: `seedDefaultContactForm.js`

**Location**: `/scripts/seedDefaultContactForm.js`

**Features**:
- ✅ Idempotent (safe to run multiple times)
- ✅ Processes all active tenants
- ✅ Detailed progress logging
- ✅ Error handling per tenant
- ✅ Summary report
- ✅ Connection updates

**Usage**:
```bash
# Standard run
node scripts/seedDefaultContactForm.js

# With environment file
NODE_ENV=production node scripts/seedDefaultContactForm.js
```

**Output Explanation**:

| Symbol | Meaning |
|--------|---------|
| ✅ | Successfully created/added |
| ⏭️  | Already exists, skipped |
| ❌ | Error occurred |
| 📋 | Processing tenant |
| 📊 | Summary information |

**Exit Codes**:
- `0` - Success
- `1` - Failure

---

## Code References

### Main Implementation

**File**: `/src/services/multiTenantDatabaseService.ts`

**Function**: `seedDefaultContactForm(db: Db)`
- Lines: ~268-432
- Called by: `initializeTenantDatabase()`
- Purpose: Seed form, fields, and button connection for new tenants

### Migration Script

**File**: `/scripts/seedDefaultContactForm.js`
- Lines: 1-350+
- Purpose: Add default form to existing tenants
- Dependencies: `mongodb`, `dotenv`

### Related API Endpoints

- `GET /api/form` - List all forms
- `GET /api/form/fields?formId=...` - Get form fields
- `POST /api/form/submit` - Submit form data
- `GET /api/button/connection?buttonId=...` - Get button-form connection

---

## Best Practices

### For Developers

1. **Always run migration for existing tenants** after pulling this feature
2. **Test form submission** before deploying to production
3. **Verify button connections** after tenant creation
4. **Monitor script output** during migration
5. **Keep form ID and field IDs unchanged** for consistency

### For Tenant Admins

1. **Don't delete the default form** (breaks "Speak to Expert" button)
2. **Customize carefully** (test after changes)
3. **Keep required fields** (ensures quality leads)
4. **Add fields instead of removing** (extends functionality)
5. **Test form before going live** (verify all fields work)

---

## Version Information

- **Implemented**: November 29, 2025
- **Version**: 2.3.1
- **Related Feature**: Default Buttons (v2.3.0)
- **Dependencies**: Multi-tenant database service

---

## Related Documentation

- [Default Buttons Implementation](./DEFAULT_BUTTONS_IMPLEMENTATION.md)
- [Button Form Connection Fix](./BUTTON_FORM_CONNECTION_FIX.md)
- [Multi-Tenant Setup Guide](./MULTI_TENANT_SETUP.md)
- [Tenant Facing Pages](./TENANT_FACING_PAGES.md)

---

**Status**: ✅ Implemented and Tested  
**Last Updated**: November 29, 2025  
**Migration Script**: `scripts/seedDefaultContactForm.js`
