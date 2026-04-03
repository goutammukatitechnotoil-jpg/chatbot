# 🚀 Quick Start: Default Contact Form

## TL;DR - What You Need to Know

✅ **Every tenant now gets a "Contact Us" form automatically**  
✅ **8 pre-configured fields ready to capture leads**  
✅ **"Speak to Expert" button opens the form automatically**  
✅ **Zero configuration needed for new tenants**  
✅ **One command to migrate existing tenants**

---

## For New Tenants

### Do Nothing! 🎉

When you create a new tenant:
1. Form is automatically created ✓
2. All 8 fields are automatically added ✓
3. "Speak to Expert" button is automatically connected ✓

**The form is ready to use immediately after tenant creation.**

---

## For Existing Tenants

### Run This Command Once:

```bash
node scripts/seedDefaultContactForm.js
```

**That's it!** The form will be added to all your existing tenants.

---

## What You Get

### The Form
- **Name**: Contact Us
- **Title**: "Contact Us"
- **Description**: "Please fill out the form below and we will get back to you as soon as possible."
- **Submit Button**: "Submit" (orange)

### The 8 Fields

1. **Name** - Required text field
2. **Company Name** - Required text field
3. **Job Title** - Required text field
4. **Country** - Required dropdown (10 countries)
5. **Email** - Required email field
6. **Phone** - Optional text field (only optional field!)
7. **Purpose** - Required dropdown (6 purposes)
8. **Details** - Required multi-line text area

---

## Where to Find It

### In Admin Panel
```
http://localhost:3000/forms
```
Look for "Contact Us" in your forms list.

### In Chatbot
User clicks **"Speak to Expert"** button → Form appears

---

## How Leads Are Captured

1. User fills out form
2. Clicks "Submit"
3. Lead appears in **Admin Panel → Lead List**
4. All 8 fields are saved
5. Timestamp recorded
6. Ready for follow-up!

---

## Quick Verification

### Check Database:
```javascript
// Connect to your tenant database
use fpt_tenant_yourcompany

// Should return 1 form
db.forms.findOne({ id: 'form_default_contact_us' })

// Should return 8 fields
db.form_fields.find({ form_id: 'form_default_contact_us' }).count()
```

### Check Admin Panel:
1. Log in
2. Go to "Custom Forms"
3. You should see "Contact Us"

### Check Chatbot:
1. Open chatbot
2. Click "Speak to Expert"
3. Form should appear with all 8 fields

---

## Troubleshooting

### Form Not Showing?
**Run**: `node scripts/seedDefaultContactForm.js`

### Button Not Working?
**Check**: Button-form connection in database
```javascript
db.button_form_connections.findOne({ button_id: 'btn_talk_to_human' })
```

### Missing Fields?
**Run**: Migration script again (it's safe!)

---

## Need More Details?

📚 **Complete Documentation**: `DEFAULT_CONTACT_FORM_IMPLEMENTATION_COMPLETE.md`  
🧪 **Testing Guide**: `DEFAULT_CONTACT_FORM_TESTING_CHECKLIST.md`  
🎨 **Visual Diagrams**: `DEFAULT_CONTACT_FORM_VISUAL_FLOW.md`  
📋 **Full Specification**: `DEFAULT_CONTACT_FORM_COMPLETE.md`

---

## The 8 Fields (Quick Reference)

| # | Field Name | Type | Required | Notes |
|---|------------|------|----------|-------|
| 1 | Name | Text | ✅ Yes | Full name |
| 2 | Company Name | Text | ✅ Yes | Company |
| 3 | Job Title | Text | ✅ Yes | Position |
| 4 | Country | Dropdown | ✅ Yes | 10 options |
| 5 | Email | Email | ✅ Yes | Validated |
| 6 | Phone | Text | ❌ No | Only optional! |
| 7 | Purpose | Dropdown | ✅ Yes | 6 options |
| 8 | Details | Textarea | ✅ Yes | Multi-line |

---

## Support

**Problem?** Check `DEFAULT_CONTACT_FORM_COMPLETE.md` → Troubleshooting section

**Questions?** Read the complete documentation files

**Still stuck?** Review the testing checklist for verification steps

---

**Version**: 2.4.1  
**Status**: ✅ Ready to Use  
**Updated**: 2024-01-15
