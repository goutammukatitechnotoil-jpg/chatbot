# Tenant Edit UI - Visual Guide

## 📸 UI Screenshots (Text-based)

### 1. Tenants Table with Actions

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Tenant Management                              [+ Create Tenant]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Search: [______________]  Status: [All Status ▼]                       │
│                                                                         │
├──────────────┬─────────┬─────────┬──────────┬─────────┬──────────────┤
│ Company      │ Plan    │ Status  │ Created  │ Revenue │ Actions      │
├──────────────┼─────────┼─────────┼──────────┼─────────┼──────────────┤
│ Acme Corp    │ [PRO]   │ [Active]│ 1/15/24  │ $99/mo  │ 👁 ✏️ 🗑     │
│ acme.fpt...  │         │         │          │         │              │
├──────────────┼─────────┼─────────┼──────────┼─────────┼──────────────┤
│ Tech Inc     │ [START] │ [Active]│ 2/1/24   │ $29/mo  │ 👁 ✏️ 🗑     │
│ tech.fpt...  │         │         │          │         │              │
├──────────────┼─────────┼─────────┼──────────┼─────────┼──────────────┤
│ Innovate LLC │ [ENT]   │ [Susp]  │ 3/10/24  │ $299/mo │ 👁 ✏️ 🗑     │
│ innov.fpt... │         │         │          │         │              │
└──────────────┴─────────┴─────────┴──────────┴─────────┴──────────────┘

Legend:
👁 = View Details
✏️ = Edit Tenant (NEW!)
🗑 = Delete Tenant (NEW!)
```

---

### 2. Edit Tenant Modal (Opened)

```
                    ┌──────────────────────────────────────┐
                    │  🏢 Edit Tenant                      │
                    ├──────────────────────────────────────┤
                    │                                      │
                    │  Company Name                        │
                    │  [Acme Corporation            ]      │
                    │                                      │
                    │  Subdomain                           │
                    │  [acme-corp] .fptchatbot.com         │
                    │  ⚠️ Warning: Changing affects users  │
                    │                                      │
                    │  Custom Domain (Optional)            │
                    │  [acme.com                    ]      │
                    │                                      │
                    │  Plan                                │
                    │  [Professional ($99/month)  ▼]       │
                    │                                      │
                    │  Status                              │
                    │  [Active                     ▼]      │
                    │                                      │
                    │  ┌────────────────────────────────┐  │
                    │  │ ℹ️ Current Plan: professional  │  │
                    │  │    Created: 1/15/2024         │  │
                    │  │    ID: tenant_xxx...          │  │
                    │  └────────────────────────────────┘  │
                    │                                      │
                    │  [Cancel]    [Update Tenant]         │
                    └──────────────────────────────────────┘
```

---

### 3. Edit Modal - Success State

```
                    ┌──────────────────────────────────────┐
                    │  🏢 Edit Tenant                      │
                    ├──────────────────────────────────────┤
                    │                                      │
                    │  Company Name                        │
                    │  [Acme Corporation Updated    ]      │
                    │                                      │
                    │  Subdomain                           │
                    │  [acme-updated] .fptchatbot.com      │
                    │  ⚠️ Warning: Changing affects users  │
                    │                                      │
                    │  Plan                                │
                    │  [Enterprise ($299/month)   ▼]       │
                    │                                      │
                    │  Status                              │
                    │  [Active                     ▼]      │
                    │                                      │
                    │  [Cancel]    [⏳ Updating...]         │
                    └──────────────────────────────────────┘

After success:
┌─────────────────────────────────────────────────────────┐
│ ✅ Tenant updated successfully                          │
└─────────────────────────────────────────────────────────┘
(Modal closes, table refreshes)
```

---

### 4. Edit Modal - Error State

```
                    ┌──────────────────────────────────────┐
                    │  🏢 Edit Tenant                      │
                    ├──────────────────────────────────────┤
                    │  ┌────────────────────────────────┐  │
                    │  │ ⚠️ Subdomain already exists   │  │
                    │  └────────────────────────────────┘  │
                    │                                      │
                    │  Company Name                        │
                    │  [Acme Corporation            ]      │
                    │                                      │
                    │  Subdomain                           │
                    │  [existing-subdomain] ❌             │
                    │  .fptchatbot.com                     │
                    │                                      │
                    │  [Cancel]    [Update Tenant]         │
                    └──────────────────────────────────────┘
```

---

### 5. Delete Confirmation Dialog

```
                    ┌──────────────────────────────────────┐
                    │  ⚠️ Confirm Delete                   │
                    ├──────────────────────────────────────┤
                    │                                      │
                    │  Are you sure you want to delete     │
                    │  this tenant? This will mark it as   │
                    │  cancelled. This action cannot be    │
                    │  undone.                             │
                    │                                      │
                    │  [Cancel]         [Delete]           │
                    └──────────────────────────────────────┘
```

---

### 6. Status Badges (Color-coded)

```
┌─────────────────────────────────────────────┐
│ Status Badges:                              │
├─────────────────────────────────────────────┤
│                                             │
│  [Active]    ← Green background             │
│  [Suspended] ← Red background               │
│  [Pending]   ← Yellow background            │
│  [Cancelled] ← Gray background              │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 7. Plan Badges (Color-coded)

```
┌─────────────────────────────────────────────┐
│ Plan Badges:                                │
├─────────────────────────────────────────────┤
│                                             │
│  [Starter]       ← Blue background          │
│  [Professional]  ← Purple background        │
│  [Enterprise]    ← Gold background          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎨 UI Flow Diagram

### Edit Tenant Flow

```
┌───────────────┐
│ Tenant Table  │
│               │
│  [Edit] ←───────── User clicks edit button
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│ Edit Modal Opens  │
│ Pre-filled data   │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ User modifies     │
│ fields            │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ User clicks       │
│ "Update Tenant"   │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Loading state     │
│ [⏳ Updating...]   │
└───────┬───────────┘
        │
        ▼
┌───────────────────────┐
│ API PUT request       │
│ /api/admin/tenants    │
└───────┬───────────────┘
        │
        ▼
    Success? ────No──→ ┌─────────────┐
        │              │ Show error  │
       Yes             │ Stay open   │
        │              └─────────────┘
        ▼
┌───────────────────┐
│ ✅ Success message│
│ Modal closes      │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Table refreshes   │
│ Stats update      │
└───────────────────┘
```

---

### Delete Tenant Flow

```
┌───────────────┐
│ Tenant Table  │
│               │
│  [Delete] ←───────── User clicks delete button
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│ Confirmation      │
│ Dialog            │
│ "Are you sure?"   │
└───────┬───────────┘
        │
    Confirm? ────No──→ ┌─────────────┐
        │              │ Cancel      │
       Yes             │ No action   │
        │              └─────────────┘
        ▼
┌───────────────────────┐
│ API DELETE request    │
│ /api/admin/tenants    │
└───────┬───────────────┘
        │
        ▼
    Success? ────No──→ ┌─────────────┐
        │              │ Show error  │
       Yes             └─────────────┘
        │
        ▼
┌───────────────────┐
│ ✅ Success message│
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Table refreshes   │
│ Status=cancelled  │
└───────────────────┘
```

---

## 🎯 Interactive Elements

### Buttons State

```
Normal State:
[Update Tenant] ← Blue background, white text

Loading State:
[⏳ Updating...] ← Gray background, disabled

Disabled State:
[Update Tenant] ← Light gray, cursor not allowed

Hover State:
[Update Tenant] ← Darker blue background
```

### Input Fields State

```
Normal:
┌─────────────────────┐
│ Acme Corporation    │
└─────────────────────┘

Focused:
┌─────────────────────┐
│ Acme Corporation    │ ← Blue border
└─────────────────────┘

Error:
┌─────────────────────┐
│ acme                │ ← Red border
└─────────────────────┘
❌ Subdomain already exists
```

---

## 📱 Responsive Design

### Desktop View (> 768px)
- Modal: 500px width, centered
- Full table visible
- All columns displayed

### Tablet View (768px - 1024px)
- Modal: 90% width
- Table scrollable
- Condensed columns

### Mobile View (< 768px)
- Modal: 95% width
- Table cards instead of rows
- Stacked layout

---

## 🎨 Color Scheme

```
Primary Blue:    #2563eb (buttons, links)
Success Green:   #10b981 (success messages, active status)
Error Red:       #ef4444 (errors, suspended status)
Warning Yellow:  #f59e0b (pending status)
Gray:            #6b7280 (cancelled status, borders)
Purple:          #8b5cf6 (professional plan)
Gold:            #f59e0b (enterprise plan)
```

---

## 🔤 Typography

```
Headings:
- Modal Title: 18px, Semibold
- Section Title: 14px, Medium

Body Text:
- Labels: 14px, Medium
- Input Text: 14px, Regular
- Helper Text: 12px, Regular

Buttons:
- 14px, Medium
```

---

## 📐 Spacing

```
Modal:
- Padding: 24px
- Gap between fields: 16px
- Button gap: 12px

Table:
- Row padding: 16px 24px
- Cell gap: 16px

Icons:
- Size: 16px (actions)
- Margin: 8px
```

---

## ⚡ Animations

```
Modal Open:
- Fade in (200ms)
- Scale from 0.95 to 1.0

Button Hover:
- Background transition (150ms)

Loading Spinner:
- Rotate 360° (1s infinite)

Success Message:
- Slide in from top (300ms)
- Auto-hide after 3s
```

---

## 🎭 User Experience

### Positive Feedback
- ✅ Success message on save
- Smooth modal close
- Instant table update
- Green badges for active

### Negative Feedback
- ❌ Error message in modal
- Red borders on invalid fields
- Helpful error text
- Confirmation on delete

### Loading States
- Spinner on buttons
- Disabled state
- "Updating..." text
- Gray overlay

---

## 🧩 Component Hierarchy

```
SuperAdminDashboard
├── Header
├── Navigation Tabs
│   ├── Overview
│   ├── Tenants (ACTIVE)
│   ├── Users
│   └── Settings
└── Tenants Tab
    ├── Search Bar
    ├── Status Filter
    ├── Tenants Table
    │   ├── Table Header
    │   └── Table Rows
    │       ├── Tenant Info
    │       ├── Plan Badge
    │       ├── Status Badge
    │       └── Actions
    │           ├── View Button
    │           ├── Edit Button (NEW!)
    │           └── Delete Button (NEW!)
    └── Modals
        ├── CreateTenantModal
        └── EditTenantModal (NEW!)
            ├── Form Fields
            │   ├── Name Input
            │   ├── Subdomain Input
            │   ├── Domain Input
            │   ├── Plan Select
            │   └── Status Select
            ├── Info Panel
            └── Action Buttons
                ├── Cancel
                └── Update
```

---

## 📋 Keyboard Shortcuts

```
ESC           - Close modal
Enter         - Submit form (when in input)
Tab           - Navigate between fields
Shift + Tab   - Navigate backwards
```

---

## ♿ Accessibility

- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Color contrast (WCAG AA)
- ✅ Form validation messages

---

**Last Updated**: December 2024  
**Version**: 1.0  
**UI Framework**: TailwindCSS + React
