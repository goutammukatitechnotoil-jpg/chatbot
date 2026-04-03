# 🧪 Default "Contact Us" Form - Testing Checklist

## Pre-Testing Setup

### Environment Check
- [ ] MongoDB connection is working
- [ ] Master database is accessible
- [ ] Tenant databases are accessible
- [ ] Application is running (dev server or production)

### Database State
- [ ] Check if form already exists: `db.forms.findOne({ id: 'form_default_contact_us' })`
- [ ] Check if fields exist: `db.form_fields.find({ form_id: 'form_default_contact_us' }).count()`
- [ ] Check button connection: `db.button_form_connections.findOne({ button_id: 'btn_talk_to_human' })`

---

## Test Suite 1: New Tenant Creation

### 1.1 Create New Tenant via Super Admin
- [ ] Log in as super admin
- [ ] Navigate to Super Admin Dashboard
- [ ] Click "Create New Tenant"
- [ ] Fill in tenant details (company name, domain, etc.)
- [ ] Submit form

### 1.2 Verify Auto-Seeding
- [ ] Connect to new tenant's database
- [ ] Run: `db.forms.findOne({ id: 'form_default_contact_us' })`
- [ ] **Expected**: Form document exists with:
  - [ ] `form_title: "Contact Us"`
  - [ ] `form_description: "Please fill out the form below..."`
  - [ ] `cta_button_text: "Submit"`
  - [ ] `is_active: true`
  - [ ] `is_system_form: true`

### 1.3 Verify Form Fields
- [ ] Run: `db.form_fields.find({ form_id: 'form_default_contact_us' }).sort({ order_index: 1 })`
- [ ] **Expected**: 8 fields in order:
  1. [ ] Name (text, required)
  2. [ ] Company Name (text, required)
  3. [ ] Job Title (text, required)
  4. [ ] Country (select, required, has options)
  5. [ ] Email (email, required)
  6. [ ] Phone (text, optional)
  7. [ ] Purpose (select, required, has options)
  8. [ ] Details (textarea, required)

### 1.4 Verify Button Connection
- [ ] Run: `db.button_form_connections.findOne({ button_id: 'btn_talk_to_human' })`
- [ ] **Expected**: Connection exists pointing to `form_default_contact_us`

---

## Test Suite 2: Existing Tenant Migration

### 2.1 Pre-Migration State
- [ ] Select an existing tenant
- [ ] Check current form count: `db.forms.find().count()`
- [ ] Check if "Contact Us" exists: `db.forms.findOne({ id: 'form_default_contact_us' })`
- [ ] Document current state

### 2.2 Run Migration Script
- [ ] Open terminal
- [ ] Navigate to project root: `cd /Users/mithun/Downloads/FPT\ Chatbot\ 10`
- [ ] Run: `node scripts/seedDefaultContactForm.js`
- [ ] **Expected output**:
  ```
  ✅ Created "Contact Us" form
  ✅ Added 8 form field(s)
  ✅ Connected "Speak to Expert" button to "Contact Us" form
  ```

### 2.3 Post-Migration Verification
- [ ] Form exists: `db.forms.findOne({ id: 'form_default_contact_us' })`
- [ ] 8 fields exist: `db.form_fields.find({ form_id: 'form_default_contact_us' }).count()` = 8
- [ ] Button connected: `db.button_form_connections.findOne({ button_id: 'btn_talk_to_human' })`

### 2.4 Re-run Migration (Idempotency Test)
- [ ] Run migration script again: `node scripts/seedDefaultContactForm.js`
- [ ] **Expected output**:
  ```
  ⏭️  "Contact Us" form already exists
  ⏭️  Skipped 8 existing field(s)
  ⏭️  Button already connected to "Contact Us" form
  ```
- [ ] No duplicate forms created
- [ ] No duplicate fields created
- [ ] No errors in console

---

## Test Suite 3: Admin Panel UI

### 3.1 Access Custom Forms
- [ ] Log in as tenant admin
- [ ] Navigate to **Custom Forms** section
- [ ] **Expected**: "Contact Us" form is listed

### 3.2 View Form Details
- [ ] Click on "Contact Us" form
- [ ] **Expected display fields are visible**:
  - [ ] Form Title: "Contact Us"
  - [ ] Form Description: "Please fill out the form below and we will get back to you as soon as possible."
  - [ ] CTA Button Text: "Submit"
  - [ ] CTA Button Color: Orange (#f37021)

### 3.3 View Form Fields
- [ ] Scroll to form fields section
- [ ] **Expected**: All 8 fields are listed in order:
  1. [ ] Name - Type: Text - Required: Yes
  2. [ ] Company Name - Type: Text - Required: Yes
  3. [ ] Job Title - Type: Text - Required: Yes
  4. [ ] Country - Type: Select - Required: Yes
  5. [ ] Email - Type: Email - Required: Yes
  6. [ ] Phone - Type: Text - Required: No
  7. [ ] Purpose - Type: Select - Required: Yes
  8. [ ] Details - Type: Textarea - Required: Yes

### 3.4 Check Dropdown Options
- [ ] Click "Edit" on Country field
- [ ] **Expected options**:
  - United States, United Kingdom, Canada, Australia, Germany, France, Japan, Singapore, Vietnam, Other
- [ ] Click "Edit" on Purpose field
- [ ] **Expected options**:
  - General Inquiry, Product Demo, Pricing Information, Technical Support, Partnership, Other

### 3.5 Form Settings
- [ ] Check "Active" toggle - should be ON
- [ ] Check "System Form" indicator - should show this is a system form
- [ ] Try to delete form - should show warning or prevent deletion

---

## Test Suite 4: Chatbot UI

### 4.1 Open Chatbot
- [ ] Navigate to test page or embedded chatbot
- [ ] Open chatbot widget
- [ ] **Expected**: Chatbot opens successfully

### 4.2 Trigger Form Display
- [ ] Look for "Speak to Expert" button
- [ ] Click "Speak to Expert" button
- [ ] **Expected**: "Contact Us" form appears

### 4.3 Verify Form Header
- [ ] **Expected**: Form title "Contact Us" is displayed at top
- [ ] **Expected**: Description text appears below title:
  - "Please fill out the form below and we will get back to you as soon as possible."

### 4.4 Verify All Fields Render
Check each field is visible in the form:
1. [ ] Name field with placeholder "Enter your full name"
2. [ ] Company Name field with placeholder "Enter your company name"
3. [ ] Job Title field with placeholder "Enter your job title"
4. [ ] Country dropdown with placeholder "Select your country"
5. [ ] Email field with placeholder "Enter your email address"
6. [ ] Phone field with placeholder "Enter your phone number"
7. [ ] Purpose dropdown with placeholder "Select purpose of inquiry"
8. [ ] Details textarea with placeholder "Please provide additional details about your inquiry"

### 4.5 Verify Required Markers
- [ ] Required fields show asterisk (*) or visual indicator
- [ ] Phone field does NOT show required indicator

### 4.6 Verify Submit Button
- [ ] Submit button displays "Submit" text
- [ ] Submit button is orange color (#f37021)
- [ ] Button is at bottom of form

---

## Test Suite 5: Form Submission

### 5.1 Validation - Leave All Fields Empty
- [ ] Click "Submit" without filling anything
- [ ] **Expected**: Validation errors for required fields
- [ ] **Expected**: Phone field does not show error (it's optional)

### 5.2 Validation - Invalid Email
- [ ] Fill all required fields
- [ ] Enter invalid email (e.g., "notanemail")
- [ ] Click "Submit"
- [ ] **Expected**: Email validation error

### 5.3 Successful Submission - Minimal Data
- [ ] Fill only required fields:
  - Name: "John Doe"
  - Company: "Acme Corp"
  - Job Title: "Developer"
  - Country: "United States"
  - Email: "john@acme.com"
  - Purpose: "General Inquiry"
  - Details: "Test submission"
- [ ] Leave Phone empty
- [ ] Click "Submit"
- [ ] **Expected**: Success message
- [ ] **Expected**: Form closes or shows confirmation

### 5.4 Successful Submission - Full Data
- [ ] Fill all fields including Phone
- [ ] Click "Submit"
- [ ] **Expected**: Success message
- [ ] **Expected**: Form closes

### 5.5 Verify Lead Capture
- [ ] Go to Admin Panel > Lead List
- [ ] **Expected**: New lead appears with:
  - [ ] Name: "John Doe"
  - [ ] Company: "Acme Corp"
  - [ ] Job Title: "Developer"
  - [ ] Country: "United States"
  - [ ] Email: "john@acme.com"
  - [ ] Phone: (if provided)
  - [ ] Purpose: "General Inquiry"
  - [ ] Details: "Test submission"
  - [ ] Source: "Contact Us" form
  - [ ] Timestamp: Current time

---

## Test Suite 6: Dropdown Options

### 6.1 Country Dropdown
- [ ] Click Country dropdown
- [ ] **Expected options appear**:
  - [ ] United States
  - [ ] United Kingdom
  - [ ] Canada
  - [ ] Australia
  - [ ] Germany
  - [ ] France
  - [ ] Japan
  - [ ] Singapore
  - [ ] Vietnam
  - [ ] Other
- [ ] Select each option - verify it populates field

### 6.2 Purpose Dropdown
- [ ] Click Purpose dropdown
- [ ] **Expected options appear**:
  - [ ] General Inquiry
  - [ ] Product Demo
  - [ ] Pricing Information
  - [ ] Technical Support
  - [ ] Partnership
  - [ ] Other
- [ ] Select each option - verify it populates field

---

## Test Suite 7: Button Connection

### 7.1 Verify Connection in Admin
- [ ] Go to Admin Panel > Buttons
- [ ] Find "Speak to Expert" button
- [ ] Check "Connected Form" field
- [ ] **Expected**: Shows "Contact Us" form

### 7.2 Test Other Buttons
- [ ] Click other chatbot buttons (if any)
- [ ] **Expected**: They should NOT trigger the Contact Us form
- [ ] Only "Speak to Expert" should show the form

### 7.3 Disconnect and Reconnect
- [ ] In Admin Panel, disconnect form from button
- [ ] Test in chatbot - button should not show form
- [ ] Reconnect "Contact Us" form to button
- [ ] Test in chatbot - form should appear again

---

## Test Suite 8: Multi-Tenant Isolation

### 8.1 Create Two Tenants
- [ ] Create Tenant A
- [ ] Create Tenant B
- [ ] Both should have "Contact Us" form auto-created

### 8.2 Modify Tenant A Form
- [ ] Log in as Tenant A admin
- [ ] Edit "Contact Us" form title to "Get in Touch"
- [ ] Add a custom field
- [ ] Save changes

### 8.3 Verify Tenant B Unchanged
- [ ] Log in as Tenant B admin
- [ ] Check "Contact Us" form
- [ ] **Expected**: Still shows "Contact Us" (not "Get in Touch")
- [ ] **Expected**: Does NOT have Tenant A's custom field
- [ ] Confirms tenant isolation is working

---

## Test Suite 9: Field Types & Validation

### 9.1 Text Fields
- [ ] Name, Company, Job Title, Phone
- [ ] Test with various inputs:
  - [ ] Normal text: "John Doe"
  - [ ] Special characters: "O'Brien"
  - [ ] Numbers: "123 Main St"
  - [ ] Empty (should fail for required, pass for Phone)

### 9.2 Email Field
- [ ] Test valid emails:
  - [ ] "user@example.com" ✓
  - [ ] "user+tag@example.co.uk" ✓
- [ ] Test invalid emails:
  - [ ] "notanemail" ✗
  - [ ] "@example.com" ✗
  - [ ] "user@" ✗

### 9.3 Select Fields (Country, Purpose)
- [ ] Cannot type freely
- [ ] Must select from dropdown
- [ ] Placeholder shows before selection
- [ ] Selected value displays correctly

### 9.4 Textarea (Details)
- [ ] Can enter multiple lines
- [ ] Line breaks preserved
- [ ] Test with long text (500+ characters)
- [ ] Scrollbar appears if needed

---

## Test Suite 10: Responsive Design

### 10.1 Desktop View (1920px)
- [ ] Form displays in chatbot window
- [ ] All fields visible without scrolling
- [ ] Submit button is accessible
- [ ] Text is readable

### 10.2 Tablet View (768px)
- [ ] Form adapts to narrower width
- [ ] Fields stack properly
- [ ] No horizontal scrolling
- [ ] Submit button remains accessible

### 10.3 Mobile View (375px)
- [ ] Form fits in mobile chatbot
- [ ] Fields are full width
- [ ] Dropdowns are mobile-friendly
- [ ] Virtual keyboard doesn't obscure fields
- [ ] Submit button remains visible

---

## Test Suite 11: Performance

### 11.1 Form Load Time
- [ ] Click "Speak to Expert"
- [ ] Measure time to form display
- [ ] **Expected**: < 1 second

### 11.2 Submission Speed
- [ ] Fill form completely
- [ ] Click "Submit"
- [ ] Measure time to confirmation
- [ ] **Expected**: < 2 seconds

### 11.3 Large Tenant Load
- [ ] Tenant with 100+ leads
- [ ] Form still loads quickly
- [ ] Submission still fast
- [ ] Lead List pagination works

---

## Test Suite 12: Error Handling

### 12.1 Network Error
- [ ] Disconnect network
- [ ] Try to submit form
- [ ] **Expected**: Error message displayed
- [ ] **Expected**: Form data not lost

### 12.2 Database Error
- [ ] Stop MongoDB temporarily
- [ ] Try to submit form
- [ ] **Expected**: Graceful error handling
- [ ] **Expected**: No app crash

### 12.3 Invalid Field Data
- [ ] Inject script tags in text fields
- [ ] **Expected**: Sanitized/escaped
- [ ] **Expected**: No XSS vulnerability

---

## Test Suite 13: Accessibility

### 13.1 Keyboard Navigation
- [ ] Tab through all form fields
- [ ] **Expected**: Logical tab order (1→2→3→...→8→Submit)
- [ ] Enter/Space on dropdowns opens them
- [ ] Escape closes dropdowns

### 13.2 Screen Reader
- [ ] Test with screen reader (VoiceOver, NVDA, JAWS)
- [ ] **Expected**: Field labels announced
- [ ] **Expected**: Required status announced
- [ ] **Expected**: Error messages announced

### 13.3 Visual Indicators
- [ ] Required fields marked clearly
- [ ] Focus indicators visible
- [ ] Error states clear
- [ ] Success states clear

---

## Test Suite 14: Browser Compatibility

### 14.1 Chrome
- [ ] Form displays correctly
- [ ] All features work
- [ ] No console errors

### 14.2 Firefox
- [ ] Form displays correctly
- [ ] All features work
- [ ] No console errors

### 14.3 Safari
- [ ] Form displays correctly
- [ ] All features work
- [ ] No console errors

### 14.4 Edge
- [ ] Form displays correctly
- [ ] All features work
- [ ] No console errors

---

## Test Suite 15: Documentation Verification

### 15.1 README Accuracy
- [ ] README mentions default Contact Us form
- [ ] Migration script is documented
- [ ] Instructions are clear and accurate

### 15.2 Code Comments
- [ ] `multiTenantDatabaseService.ts` has clear comments
- [ ] Migration script has usage instructions
- [ ] Purpose of each field is documented

### 15.3 Documentation Files
- [ ] `DEFAULT_CONTACT_FORM_COMPLETE.md` exists
- [ ] All 8 fields are documented
- [ ] Verification steps are included
- [ ] Troubleshooting section is helpful

---

## 🎯 Final Checklist

### Critical Acceptance Criteria
- [ ] ✅ All 8 fields present and correct
- [ ] ✅ Form Title displayed in UI
- [ ] ✅ Form Description displayed in UI
- [ ] ✅ CTA Button Text displayed correctly
- [ ] ✅ Auto-seeding works for new tenants
- [ ] ✅ Migration script works for existing tenants
- [ ] ✅ "Speak to Expert" button connected
- [ ] ✅ Lead capture works end-to-end
- [ ] ✅ No errors in browser console
- [ ] ✅ No errors in server logs
- [ ] ✅ Documentation complete and accurate

### Sign-Off
- [ ] Development team verified
- [ ] QA team tested
- [ ] Product owner approved
- [ ] Ready for production deployment

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________
Environment: _______________

Test Suite 1 (New Tenant): ☐ Pass ☐ Fail
Test Suite 2 (Migration): ☐ Pass ☐ Fail
Test Suite 3 (Admin Panel): ☐ Pass ☐ Fail
Test Suite 4 (Chatbot UI): ☐ Pass ☐ Fail
Test Suite 5 (Submission): ☐ Pass ☐ Fail
Test Suite 6 (Dropdowns): ☐ Pass ☐ Fail
Test Suite 7 (Button Connection): ☐ Pass ☐ Fail
Test Suite 8 (Multi-Tenant): ☐ Pass ☐ Fail
Test Suite 9 (Validation): ☐ Pass ☐ Fail
Test Suite 10 (Responsive): ☐ Pass ☐ Fail
Test Suite 11 (Performance): ☐ Pass ☐ Fail
Test Suite 12 (Error Handling): ☐ Pass ☐ Fail
Test Suite 13 (Accessibility): ☐ Pass ☐ Fail
Test Suite 14 (Browsers): ☐ Pass ☐ Fail
Test Suite 15 (Documentation): ☐ Pass ☐ Fail

Overall Status: ☐ PASS ☐ FAIL

Issues Found:
_____________________________________________
_____________________________________________
_____________________________________________

Notes:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

**Version**: 2.4.1  
**Last Updated**: 2024-01-15  
**Status**: Ready for Testing
