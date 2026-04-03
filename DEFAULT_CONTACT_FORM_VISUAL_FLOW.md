# 🎨 Default "Contact Us" Form - Visual Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FPT CHATBOT MULTI-TENANT SYSTEM                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐          ┌──────────▼─────────┐
            │  NEW TENANT    │          │ EXISTING TENANT    │
            │   CREATION     │          │    MIGRATION       │
            └───────┬────────┘          └──────────┬─────────┘
                    │                               │
                    │                               │
    ┌───────────────▼────────────────┐  ┌──────────▼─────────────────┐
    │ Auto-Seeding on Creation       │  │ Manual Migration Script    │
    │ multiTenantDatabaseService.ts  │  │ seedDefaultContactForm.js  │
    │ - Triggered automatically      │  │ - Run once per tenant      │
    │ - No user action needed        │  │ - Idempotent (safe)        │
    └───────────────┬────────────────┘  └──────────┬─────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │   TENANT DATABASE CREATED      │
                    │   with Default Contact Form    │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
            ┌───────▼────────┐            ┌─────────▼──────────┐
            │   COLLECTIONS  │            │   DATA CREATED     │
            └───────┬────────┘            └─────────┬──────────┘
                    │                                │
        ┌───────────┼────────────┬──────────────────┼──────────┐
        │           │            │                  │          │
    ┌───▼───┐  ┌───▼────┐  ┌────▼─────┐      ┌────▼────┐ ┌──▼───┐
    │ forms │  │ form_  │  │ button_  │      │ 1 Form  │ │ 8    │
    │       │  │ fields │  │ form_    │      │ Record  │ │ Field│
    │       │  │        │  │ connect. │      │         │ │ Recs │
    └───────┘  └────────┘  └──────────┘      └─────────┘ └──────┘
```

---

## Data Flow: Auto-Seeding Process

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TENANT CREATION FLOW                               │
└──────────────────────────────────────────────────────────────────────┘

Step 1: Super Admin Creates Tenant
     │
     │  POST /api/tenant/create
     │  { company_name, domain, ... }
     │
     ▼
┌────────────────────────────────────┐
│ multiTenantDatabaseService.ts      │
│ createTenant()                     │
└────────┬───────────────────────────┘
         │
         ├─► Create tenant in master DB
         │
         ├─► Create tenant-specific database
         │
         ├─► Create indexes
         │
         ├─► seedDefaultContactForm() ◄─── YOU ARE HERE
         │   │
         │   ├─► Check if form exists
         │   │   └─► If not: Create form record
         │   │       {
         │   │         id: 'form_default_contact_us',
         │   │         form_name: 'Contact Us',
         │   │         form_title: 'Contact Us',           ✓
         │   │         form_description: 'Please fill...',  ✓
         │   │         cta_button_text: 'Submit',          ✓
         │   │         ...
         │   │       }
         │   │
         │   ├─► Create 8 field records
         │   │   ├─► Field 1: Name (text, required)
         │   │   ├─► Field 2: Company Name (text, required)
         │   │   ├─► Field 3: Job Title (text, required)
         │   │   ├─► Field 4: Country (select, required)
         │   │   ├─► Field 5: Email (email, required)
         │   │   ├─► Field 6: Phone (text, optional)
         │   │   ├─► Field 7: Purpose (select, required)
         │   │   └─► Field 8: Details (textarea, required)
         │   │
         │   └─► Connect to "Speak to Expert" button
         │       {
         │         button_id: 'btn_talk_to_human',
         │         form_id: 'form_default_contact_us'
         │       }
         │
         └─► Return success
              │
              ▼
     ✅ TENANT READY TO USE
        - Admin Panel shows form
        - Chatbot button triggers form
        - Leads captured automatically
```

---

## Data Flow: User Interaction

```
┌──────────────────────────────────────────────────────────────────────┐
│                 USER SUBMITS CONTACT FORM                             │
└──────────────────────────────────────────────────────────────────────┘

Step 1: User Opens Chatbot
     │
     │  Website visitor clicks chatbot icon
     │
     ▼
┌─────────────────────────────────┐
│  Chatbot UI Opens               │
│  Shows welcome message          │
│  Shows action buttons           │
└────────┬────────────────────────┘
         │
         │  User clicks "Speak to Expert"
         │
         ▼
┌─────────────────────────────────┐
│  Fetch Button Configuration     │
│  GET /api/button                │
└────────┬────────────────────────┘
         │
         │  Returns: { 
         │    button_id: 'btn_talk_to_human',
         │    connected_form: 'form_default_contact_us'
         │  }
         │
         ▼
┌─────────────────────────────────┐
│  Fetch Form Configuration       │
│  GET /api/form                  │
│  ?form_id=form_default_contact_ │
└────────┬────────────────────────┘
         │
         │  Returns form + 8 fields
         │
         ▼
┌───────────────────────────────────────────────────────────┐
│  Display Form in Chatbot                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Contact Us                               <-- Title │  │
│  │ Please fill out the form below...  <-- Description│  │
│  │                                                    │  │
│  │ Name * [...................................]      │  │
│  │ Company Name * [...........................]      │  │
│  │ Job Title * [...........................]         │  │
│  │ Country * [Select ▼]                              │  │
│  │ Email * [...................................]      │  │
│  │ Phone [...................................]        │  │
│  │ Purpose * [Select ▼]                              │  │
│  │ Details * [...................................]    │  │
│  │           [...................................]    │  │
│  │                                                    │  │
│  │                                 [Submit] ◄-- CTA  │  │
│  └────────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────────────────┘
         │
         │  User fills and clicks "Submit"
         │
         ▼
┌─────────────────────────────────┐
│  Client-Side Validation         │
│  - Check all required fields    │
│  - Validate email format        │
│  - Check field types            │
└────────┬────────────────────────┘
         │
         │  ✓ All validations pass
         │
         ▼
┌─────────────────────────────────┐
│  POST /api/lead                 │
│  {                              │
│    form_id: 'form_default_...', │
│    name: 'John Doe',            │
│    company: 'Acme Corp',        │
│    job_title: 'Developer',      │
│    country: 'United States',    │
│    email: 'john@acme.com',      │
│    phone: '555-1234',           │
│    purpose: 'General Inquiry',  │
│    details: 'Need info...'      │
│  }                              │
└────────┬────────────────────────┘
         │
         │  Server processes request
         │
         ▼
┌─────────────────────────────────┐
│  Server-Side Processing         │
│  - Authenticate tenant          │
│  - Validate data again          │
│  - Sanitize inputs              │
│  - Create lead record           │
└────────┬────────────────────────┘
         │
         │  Lead saved to database
         │
         ├─► Trigger webhooks (if configured)
         │
         ├─► Send email notifications (if configured)
         │
         └─► Return success
              │
              ▼
┌─────────────────────────────────┐
│  Show Success Message           │
│  "Thank you! We'll contact you  │
│   shortly."                     │
└────────┬────────────────────────┘
         │
         │  Form closes
         │
         ▼
┌─────────────────────────────────┐
│  Lead Appears in Admin Panel    │
│  - Lead List shows new entry    │
│  - All fields captured          │
│  - Timestamp recorded           │
│  - Source: "Contact Us" form    │
└─────────────────────────────────┘
```

---

## Database Relationships

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TENANT DATABASE SCHEMA                             │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│  forms                              │
├─────────────────────────────────────┤
│ id: "form_default_contact_us"  ◄────┼──┐
│ form_name: "Contact Us"             │  │
│ form_title: "Contact Us"            │  │
│ form_description: "Please fill..."  │  │
│ cta_button_text: "Submit"           │  │
│ is_active: true                     │  │
│ is_system_form: true                │  │
└─────────────────────────────────────┘  │
                                         │
                                         │ Foreign Key
┌─────────────────────────────────────┐  │
│  form_fields                        │  │
├─────────────────────────────────────┤  │
│ id: "..._field_name"                │  │
│ form_id: "form_default_contact_us" ◄┼──┘
│ field_name: "Name"                  │
│ field_type: "text"                  │
│ is_required: true                   │
│ order_index: 1                      │
├─────────────────────────────────────┤
│ (7 more field records...)           │
└─────────────────────────────────────┘
                                         │
                                         │ Referenced in
┌─────────────────────────────────────┐  │
│  button_form_connections            │  │
├─────────────────────────────────────┤  │
│ button_id: "btn_talk_to_human"      │  │
│ form_id: "form_default_contact_us" ◄┼──┘
└─────────────────────────────────────┘
         │
         │ Referenced in
         │
┌─────────────────────────────────────┐
│  chatbot_buttons                    │
├─────────────────────────────────────┤
│ id: "btn_talk_to_human"  ◄──────────┘
│ label: "Speak to Expert"            │
│ type: "form"                        │
└─────────────────────────────────────┘
                                         │
                                         │ Submissions captured in
┌─────────────────────────────────────┐  │
│  leads                              │  │
├─────────────────────────────────────┤  │
│ form_id: "form_default_contact_us" ◄┼──┘
│ name: "John Doe"                    │
│ company: "Acme Corp"                │
│ email: "john@acme.com"              │
│ ... (all form fields)               │
│ submitted_at: "2024-01-15..."       │
└─────────────────────────────────────┘
```

---

## Component Interaction Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                                │
└──────────────────────────────────────────────────────────────────────┘

Admin Panel Side:
┌─────────────────────┐
│  AdminPanel.tsx     │
│  └─► Forms Section  │
│      │              │
│      ├─► FormBuilder.tsx ◄───┐
│      │   - Edit form title   │ Displays form
│      │   - Edit description  │ configuration
│      │   - Edit CTA text     │ with all 8 fields
│      │                       │
│      └─► FormFieldEditor.tsx │
│          - Add/edit fields   │
│          - Set required      │
│          - Reorder fields    │
└─────────────────────┘        │
                               │
Chatbot Side:                  │
┌─────────────────────┐        │
│  Chatbot.tsx        │        │
│  └─► ChatWindow     │        │
│      └─► Buttons    │        │
│          │          │        │
│          └─► Click "Speak to │
│              Expert" │       │
│              │      │        │
│              ▼      │        │
│      FormRenderer.tsx ◄──────┘
│      - Renders form title
│      - Renders description
│      - Renders all 8 fields
│      - Renders CTA button
│      - Handles validation
│      - Submits data
└─────────────────────┘

API Layer:
┌─────────────────────┐
│  /api/form.ts       │ ◄─── Fetch form config
└─────────────────────┘

┌─────────────────────┐
│  /api/lead.ts       │ ◄─── Submit form data
└─────────────────────┘

┌─────────────────────┐
│  /api/button.ts     │ ◄─── Check button-form connection
└─────────────────────┘
```

---

## Multi-Tenant Isolation

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TENANT ISOLATION                                   │
└──────────────────────────────────────────────────────────────────────┘

Master Database:
┌─────────────────────────────────────┐
│  tenants (Master Collection)        │
├─────────────────────────────────────┤
│ id: "tenant_abc123"                 │
│ database_uri: "mongodb://..."       │
│ database_name: "fpt_tenant_abc123"  │
├─────────────────────────────────────┤
│ id: "tenant_xyz789"                 │
│ database_uri: "mongodb://..."       │
│ database_name: "fpt_tenant_xyz789"  │
└─────────────────────────────────────┘
         │                │
         │                │
         ▼                ▼
┌─────────────────┐  ┌─────────────────┐
│ Tenant ABC123   │  │ Tenant XYZ789   │
│ Database        │  │ Database        │
├─────────────────┤  ├─────────────────┤
│ ✓ Contact Form  │  │ ✓ Contact Form  │
│ ✓ 8 Fields      │  │ ✓ 8 Fields      │
│ ✓ Button Link   │  │ ✓ Button Link   │
│                 │  │                 │
│ Leads:          │  │ Leads:          │
│ - Lead A1       │  │ - Lead Z1       │
│ - Lead A2       │  │ - Lead Z2       │
└─────────────────┘  └─────────────────┘
     ISOLATED            ISOLATED
   (No cross-access)  (No cross-access)

Each tenant has:
✓ Own Contact Form (same structure)
✓ Own form submissions
✓ Own customizations (can modify)
✓ Complete data isolation
```

---

## Form Field Rendering Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│              FORM RENDERING IN CHATBOT                                │
└──────────────────────────────────────────────────────────────────────┘

FormRenderer Component receives:
{
  form: {
    form_title: "Contact Us",
    form_description: "Please fill out...",
    cta_button_text: "Submit"
  },
  fields: [
    { order_index: 1, field_name: "Name", ... },
    { order_index: 2, field_name: "Company Name", ... },
    ...
  ]
}

Rendering Steps:
┌─────────────────────────────────────┐
│ 1. Display Form Header              │
│    <h2>{form.form_title}</h2>       │
│    <p>{form.form_description}</p>   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 2. Sort Fields by order_index       │
│    fields.sort((a, b) =>            │
│      a.order_index - b.order_index) │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 3. Loop Through Fields              │
│    fields.map(field => {            │
│      switch(field.field_type) {     │
│        case 'text':                 │
│          return <input type="text"/>│
│        case 'email':                │
│          return <input type="email"/>│
│        case 'select':               │
│          return <select>...</select>│
│        case 'textarea':             │
│          return <textarea></...>    │
│      }                              │
│    })                               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 4. Add Required Markers             │
│    {field.is_required && <span>*</span>}│
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 5. Display CTA Button               │
│    <button style={{                 │
│      backgroundColor:               │
│        form.cta_button_color        │
│    }}>                              │
│      {form.cta_button_text}         │
│    </button>                        │
└─────────────────────────────────────┘

Result:
┌─────────────────────────────────────┐
│ Contact Us                          │
│ Please fill out the form below...   │
│                                     │
│ Name * [...................]        │
│ Company Name * [............]       │
│ Job Title * [...............]       │
│ Country * [Select ▼]               │
│ Email * [...................]        │
│ Phone [...................]          │
│ Purpose * [Select ▼]               │
│ Details * [.................]        │
│           [.................]        │
│                                     │
│                    [Submit] ← CTA   │
└─────────────────────────────────────┘
```

---

## Migration vs Auto-Seeding

```
┌──────────────────────────────────────────────────────────────────────┐
│                  WHEN TO USE WHICH METHOD                             │
└──────────────────────────────────────────────────────────────────────┘

Scenario 1: Brand New Tenant
┌─────────────────────────────────────┐
│  Super Admin Creates New Tenant     │
└────────┬────────────────────────────┘
         │
         ▼
  ✅ AUTO-SEEDING TRIGGERED
     (No action needed)
         │
         ▼
┌─────────────────────────────────────┐
│  Tenant has Contact Form            │
│  immediately upon creation          │
└─────────────────────────────────────┘

Scenario 2: Existing Tenant (Before v2.4.1)
┌─────────────────────────────────────┐
│  Tenant created before this feature │
└────────┬────────────────────────────┘
         │
         ▼
  ❌ NO AUTO-SEEDING (already created)
         │
         ▼
  ✅ RUN MIGRATION SCRIPT
     node scripts/seedDefaultContactForm.js
         │
         ▼
┌─────────────────────────────────────┐
│  Tenant now has Contact Form        │
└─────────────────────────────────────┘

Scenario 3: Form Accidentally Deleted
┌─────────────────────────────────────┐
│  Admin deleted Contact Form         │
└────────┬────────────────────────────┘
         │
         ▼
  ✅ RE-RUN MIGRATION SCRIPT
     (Safe to run multiple times)
         │
         ▼
┌─────────────────────────────────────┐
│  Contact Form restored              │
└─────────────────────────────────────┘
```

---

## Version History

```
v2.4.0 - Default Buttons Added
  ├─► Added "Speak to Expert" button auto-seeding
  └─► Basic form connection

v2.4.1 - Default Contact Form (Current) ⭐
  ├─► Added "Contact Us" form auto-seeding
  ├─► 8 pre-configured fields
  ├─► Display fields (title, description, CTA)
  ├─► Auto-connection to "Speak to Expert"
  ├─► Migration script for existing tenants
  └─► Comprehensive documentation
```

---

**Visual Flow Diagram Version**: 2.4.1  
**Last Updated**: 2024-01-15  
**Status**: ✅ COMPLETE
