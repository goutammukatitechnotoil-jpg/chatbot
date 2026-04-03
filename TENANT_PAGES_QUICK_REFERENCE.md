# 📋 Tenant Pages Summary - Quick Reference

## Quick Access Guide

| # | Page Name | Tab ID | Icon | Purpose |
|---|-----------|--------|------|---------|
| 1 | **Dashboard** | `dashboard` | 📊 | Analytics & metrics overview |
| 2 | **Slider Images** | `sliders` | 🖼️ | Manage promotional image sliders |
| 3 | **Quick Replies** | `sentences` | 💬 | Predefined response buttons |
| 4 | **Custom Forms** | `forms` | 📝 | Lead capture form builder |
| 5 | **Button Actions** | `buttons` | 🎯 | Interactive action buttons |
| 6 | **Lead List** | `leads` | 📇 | Lead management & export |
| 7 | **Team Management** | `team` | 👥 | User roles & collaboration |
| 8 | **Integrations** | `integrations` | ⚡ | Webhooks & external services |
| 9 | **Test Chatbot** | `test` | 🧪 | Live preview & testing |
| 10 | **Appearance** | `appearance` | 🎨 | Visual customization |
| 11 | **Settings** | `settings` | ⚙️ | Configuration & embed code |

---

## Page Categories

### 📊 Analytics & Monitoring
- **Dashboard** - Real-time metrics, word cloud, funnel chart

### 🎨 Content & Design
- **Slider Images** - Promotional visuals
- **Quick Replies** - Predefined sentences
- **Appearance** - Colors, logos, themes

### 📝 Forms & Interactions
- **Custom Forms** - Form builder
- **Button Actions** - Call-to-action buttons

### 📇 Data Management
- **Lead List** - Lead tracking & export
- **Team Management** - User collaboration

### 🔧 Configuration
- **Integrations** - Webhooks & APIs
- **Settings** - System configuration
- **Test Chatbot** - Live testing

---

## Key Features by Page

### 1️⃣ Dashboard
```
✓ Statistics Cards (Sessions, Messages, Leads, Engagement)
✓ Word Cloud Visualization
✓ Conversion Funnel Chart
✓ Date Range Filtering
✓ Quick Content Overview
```

### 2️⃣ Slider Images
```
✓ Add/Edit/Delete Sliders
✓ Image URL Configuration
✓ Link URL Configuration
✓ Display Order Management
```

### 3️⃣ Quick Replies
```
✓ Add/Edit/Delete Sentences
✓ Display Order Management
✓ Instant Save to Database
```

### 4️⃣ Custom Forms
```
✓ Visual Form Builder
✓ Multiple Field Types (Text, Email, Phone, etc.)
✓ Required Field Validation
✓ Form Preview
✓ Field Ordering
```

### 5️⃣ Button Actions
```
✓ Create Action Buttons
✓ URL Actions
✓ Form Triggers
✓ Message Actions
✓ Real-time Preview
```

### 6️⃣ Lead List
```
✓ Lead Table Display
✓ Search & Filter
✓ CSV/Excel Export
✓ Lead Details View
✓ Conversation History
```

### 7️⃣ Team Management
```
✓ Invite Team Members
✓ Role Assignment (Admin/Editor/Viewer)
✓ Edit Permissions
✓ Remove Members
✓ Access Control
```

### 8️⃣ Integrations
```
✓ Webhook Configuration
✓ Event Triggers
✓ API Key Management
✓ Test Connections
✓ Third-Party Services
```

### 9️⃣ Test Chatbot
```
✓ Live Chatbot Instance
✓ Interactive Testing
✓ Sources Window Testing (Desktop)
✓ Feature Validation
✓ Response Testing
```

### 🔟 Appearance
```
✓ Primary Color Theme
✓ Header Color Theme
✓ Chatbot Icon Selection
✓ Display Name Configuration
✓ Message Customization
✓ Logo Upload
✓ Live Preview
```

### 1️⃣1️⃣ Settings
```
✓ Embed Code Generation
✓ Configuration Key Display
✓ AI Settings
✓ Analytics Toggle
✓ Privacy Settings
```

---

## User Role Access Matrix

| Page | Admin | Editor | Viewer |
|------|:-----:|:------:|:------:|
| Dashboard | ✅ | ✅ | ✅ |
| Slider Images | ✅ | ✅ | ❌ |
| Quick Replies | ✅ | ✅ | ❌ |
| Custom Forms | ✅ | ✅ | ❌ |
| Button Actions | ✅ | ✅ | ❌ |
| Lead List | ✅ | ✅ | ✅* |
| Team Management | ✅ | ❌ | ❌ |
| Integrations | ✅ | ❌ | ❌ |
| Test Chatbot | ✅ | ✅ | ✅ |
| Appearance | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ |

*Viewers have read-only access to Lead List

---

## Common Workflows

### 🚀 Initial Setup
```
1. Dashboard (Review initial state)
2. Appearance (Customize branding)
3. Slider Images (Add promotional content)
4. Quick Replies (Set up common questions)
5. Settings (Generate embed code)
6. Test Chatbot (Validate configuration)
```

### 📝 Content Updates
```
1. Slider Images (Update promotions)
2. Quick Replies (Modify responses)
3. Custom Forms (Create/edit forms)
4. Button Actions (Configure CTAs)
5. Test Chatbot (Verify changes)
```

### 👥 Team Collaboration
```
1. Team Management (Invite members)
2. Assign roles (Admin/Editor/Viewer)
3. Team members access relevant tabs
4. Collaborate on content & analytics
```

### 📊 Analytics Review
```
1. Dashboard (View metrics)
2. Lead List (Review captures)
3. Export data (CSV/Excel)
4. Analyze conversion funnel
```

### 🔌 Integration Setup
```
1. Integrations (Configure webhooks)
2. Settings (API configuration)
3. Test Chatbot (Verify integration)
4. Dashboard (Monitor results)
```

---

## Navigation Tips

### Sidebar Menu
- Click any menu item to switch tabs
- Active tab highlighted in orange
- Collapsible sidebar (toggle with ☰ button)
- Responsive on all devices

### Header
- Displays current tab name
- User profile with name & role
- Logout button (with confirmation)

### Mobile Usage
- Sidebar collapses on mobile (< 768px)
- Toggle menu button in header
- Touch-optimized interface
- Scrollable content areas

---

## Desktop vs Mobile Features

### Desktop Only (≥1024px)
- Sources window in Test Chatbot
- Multi-column layouts
- Extended sidebar always visible

### All Devices
- All 11 tabs accessible
- Full functionality
- Responsive tables
- Touch-friendly buttons

---

## Quick Tips

### For Admins
- Use **Settings** to get embed code
- Manage team via **Team Management**
- Monitor performance on **Dashboard**
- Configure webhooks in **Integrations**

### For Editors
- Update content in **Slider Images** & **Quick Replies**
- Build forms in **Custom Forms**
- Test changes in **Test Chatbot**
- Customize look in **Appearance**

### For Viewers
- Review metrics in **Dashboard**
- Browse leads in **Lead List**
- Test chatbot in **Test Chatbot**

---

## API Endpoints Reference

| Page | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| Dashboard | `/api/analytics` | GET | Fetch analytics data |
| Slider Images | `/api/content` | GET/PUT | Manage sliders |
| Quick Replies | `/api/content` | GET/PUT | Manage sentences |
| Custom Forms | `/api/form` | GET/POST/PUT/DELETE | CRUD forms |
| Button Actions | `/api/button` | GET/POST/PUT/DELETE | CRUD buttons |
| Lead List | `/api/lead` | GET | Fetch leads |
| Lead List | `/api/lead/export` | GET | Export CSV |
| Team Management | `/api/team` | GET/POST/PUT/DELETE | Manage team |
| Integrations | `/api/integrations` | GET/PUT | Configure webhooks |
| Settings | `/api/config` | GET/PUT | Chatbot config |
| Settings | `/api/settings` | GET/PUT | General settings |

---

## Component Architecture

```
AdminPanel (Main Container)
├── Sidebar (Navigation)
│   ├── Logo
│   └── Menu Items (11 tabs)
├── Header
│   ├── Tab Title
│   ├── User Profile
│   └── Logout Button
└── Main Content Area
    ├── DashboardView
    ├── SlidersView
    ├── SentencesView
    ├── FormsView
    ├── ButtonList
    ├── LeadList
    ├── TeamManagement
    ├── IntegrationSettings
    ├── TestChatbotView
    ├── AppearanceView
    └── SettingsView
```

---

## Data Models

### Slider Image
```typescript
{
  image_url: string;
  link_url: string;
  order_index: number;
}
```

### Quick Reply
```typescript
{
  sentence: string;
  order_index: number;
}
```

### Custom Form
```typescript
{
  name: string;
  description?: string;
  fields: FormField[];
  tenant_id: string;
}
```

### Button Action
```typescript
{
  label: string;
  type: 'url' | 'form' | 'message';
  action: string;
  tenant_id: string;
}
```

### Lead
```typescript
{
  name?: string;
  email?: string;
  phone?: string;
  form_data: Record<string, any>;
  conversation_history: Message[];
  created_at: Date;
  tenant_id: string;
}
```

---

## Performance Optimization

### Best Practices
- **Pagination**: Lead List uses pagination for large datasets
- **Lazy Loading**: Components load on-demand
- **Caching**: API responses cached where appropriate
- **Optimized Queries**: Database queries use indexes

### Recommended Limits
- **Sliders**: 5-10 maximum for best UX
- **Quick Replies**: 10-15 buttons
- **Form Fields**: 10-20 fields per form
- **Team Members**: Unlimited (pagination enabled)

---

## Troubleshooting

### Common Issues

**Can't see Sources Window in Test Chatbot**
- Ensure screen width ≥1024px (desktop)
- Send AI messages to populate sources

**Changes not appearing in Test Chatbot**
- Click "Save Changes" before testing
- Refresh the Test Chatbot tab

**Export not working**
- Check browser pop-up blocker
- Verify lead data exists

**Webhook not triggering**
- Test webhook connection in Integrations
- Verify webhook URL is accessible

---

## Security Considerations

### Data Protection
- All API calls authenticated with JWT
- Tenant isolation enforced server-side
- Password hashing with bcrypt
- HTTPS required for production

### Access Control
- Role-based permissions
- Session timeout after inactivity
- Secure logout with cleanup

---

## For Full Details

See the comprehensive guide:  
📖 [TENANT_FACING_PAGES.md](./TENANT_FACING_PAGES.md)

---

**Quick Reference Version 1.0**  
**Last Updated:** January 2025  
**For:** FPT Chatbot Platform Tenants
