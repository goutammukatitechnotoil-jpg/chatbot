# 🗺️ URL Structure Visualization

## Complete Sitemap

```
FPT Chatbot Platform
│
├── PUBLIC ROUTES
│   ├── /                              (Tenant Login Page)
│   │   └── Redirects to /dashboard after authentication
│   │
│   ├── /super-admin                   (Super Admin Login)
│   │   └── Redirects to Super Admin Dashboard after authentication
│   │
│   └── /?embedded=true                (Embedded Chatbot View)
│       └── Chatbot-only interface for website embedding
│
├── AUTHENTICATED TENANT ROUTES (11 Pages)
│   │
│   ├── 📊 ANALYTICS & OVERVIEW
│   │   └── /dashboard
│   │       ├── Statistics Cards (Sessions, Messages, Leads, Engagement)
│   │       ├── Word Cloud Visualization
│   │       ├── Conversion Funnel Chart
│   │       └── Date Range Filters
│   │
│   ├── 🎨 CONTENT MANAGEMENT
│   │   ├── /sliders
│   │   │   ├── Add/Edit/Delete Slider Images
│   │   │   ├── Configure Image & Link URLs
│   │   │   └── Manage Display Order
│   │   │
│   │   └── /quick-replies
│   │       ├── Add/Edit/Delete Quick Responses
│   │       ├── Manage Sentence Order
│   │       └── Save to Database
│   │
│   ├── 📝 FORMS & INTERACTIONS
│   │   ├── /forms
│   │   │   ├── Visual Form Builder
│   │   │   ├── Multiple Field Types
│   │   │   ├── Field Validation
│   │   │   └── Form Management (CRUD)
│   │   │
│   │   └── /buttons
│   │       ├── Create Action Buttons
│   │       ├── Configure Button Actions
│   │       ├── Link to Forms
│   │       └── Manage Button List
│   │
│   ├── 📇 DATA & TEAM
│   │   ├── /leads
│   │   │   ├── Lead Table Display
│   │   │   ├── Search & Filter Leads
│   │   │   ├── Export to CSV/Excel
│   │   │   ├── View Lead Details
│   │   │   └── Conversation History
│   │   │
│   │   └── /team
│   │       ├── Team Member List
│   │       ├── Invite New Members
│   │       ├── Edit Member Roles
│   │       └── Remove Members
│   │
│   ├── 🔧 INTEGRATIONS & TESTING
│   │   ├── /integrations
│   │   │   ├── Webhook Configuration
│   │   │   ├── API Key Management
│   │   │   ├── Event Triggers
│   │   │   └── Test Connections
│   │   │
│   │   └── /test-chatbot
│   │       ├── Live Chatbot Instance
│   │       ├── Interactive Testing
│   │       ├── Sources Window Testing
│   │       └── Feature Validation
│   │
│   └── ⚙️ CUSTOMIZATION & SETTINGS
│       ├── /appearance
│       │   ├── Primary Color Theme
│       │   ├── Header Color Theme
│       │   ├── Chatbot Icon Selection
│       │   ├── Display Name Config
│       │   ├── Message Customization
│       │   └── Logo Upload
│       │
│       └── /settings
│           ├── Embed Code Generation
│           ├── Configuration Key
│           ├── AI Settings
│           ├── Analytics Toggle
│           └── Privacy Settings
│
└── SUPER ADMIN ROUTES
    └── /super-admin (after login)
        ├── Tenant Dashboard
        ├── Tenant Creation
        ├── Tenant Details View
        ├── Global Analytics
        └── System Monitoring
```

---

## URL Hierarchy by Category

### 📊 Analytics & Monitoring
```
/dashboard          → Main analytics dashboard
                     └─ KPIs, charts, metrics
```

### 🎨 Content & Design
```
/sliders            → Promotional content
/quick-replies      → Quick response buttons
/appearance         → Visual customization
                     └─ Colors, logos, themes
```

### 📝 Forms & Engagement
```
/forms              → Form builder
                     └─ Create, edit, manage forms
/buttons            → Action buttons
                     └─ Configure triggers and actions
```

### 📇 Data Management
```
/leads              → Lead tracking
                     └─ View, search, export leads
/team               → Team collaboration
                     └─ Manage users and roles
```

### 🔧 Configuration
```
/integrations       → External services
                     └─ Webhooks, APIs
/test-chatbot       → Live testing
                     └─ Preview chatbot
/settings           → System settings
                     └─ Embed code, config
```

---

## User Journey Maps

### New User Journey
```
1. Visit website
   ↓
2. https://app.com/
   (Login page)
   ↓
3. Enter credentials
   ↓
4. [Auto Redirect]
   ↓
5. https://app.com/dashboard
   (Landing page)
   ↓
6. Click "Appearance"
   ↓
7. https://app.com/appearance
   (Customize branding)
   ↓
8. Click "Test Chatbot"
   ↓
9. https://app.com/test-chatbot
   (Test configuration)
   ↓
10. Bookmark /test-chatbot for future use
```

### Daily User Journey
```
Morning Routine:
1. Click bookmark: /leads
   ↓
2. Review new leads
   ↓
3. Export CSV
   ↓
4. Navigate to /dashboard
   ↓
5. Check metrics

Content Update:
1. Navigate to /sliders
   ↓
2. Update promo images
   ↓
3. Go to /test-chatbot
   ↓
4. Verify changes

Team Collaboration:
1. Go to /team
   ↓
2. Invite new member
   ↓
3. Set permissions
   ↓
4. Share /forms link with team
```

---

## Navigation Patterns

### Sidebar Navigation
```
Click menu item → URL changes → Page loads → Content displays

Example:
[Dashboard] → /dashboard → Shows analytics
[Leads]     → /leads     → Shows lead list
[Settings]  → /settings  → Shows configuration
```

### Direct URL Access
```
Type URL → Check auth → Load page → Display content

Example:
/leads → Authenticated? → Yes → Show leads
                       → No  → Redirect to /
```

### Bookmark Access
```
Click bookmark → Check session → Navigate → Display

Example:
Bookmark: /test-chatbot
Click → Session valid? → Yes → Go to /test-chatbot
                      → No  → Go to / (login first)
```

---

## URL Naming Conventions

### Pattern: Descriptive & SEO-Friendly

| Feature | URL | Why This Name |
|---------|-----|---------------|
| Dashboard | `/dashboard` | Standard, clear, professional |
| Sliders | `/sliders` | Simple plural form |
| Quick Replies | `/quick-replies` | Hyphenated for readability |
| Forms | `/forms` | Short and clear |
| Buttons | `/buttons` | Direct plural |
| Leads | `/leads` | Industry standard term |
| Team | `/team` | Simple singular (team as unit) |
| Integrations | `/integrations` | Clear purpose |
| Test Chatbot | `/test-chatbot` | Hyphenated, descriptive |
| Appearance | `/appearance` | Professional term |
| Settings | `/settings` | Standard convention |

### Why Hyphens Over Underscores?

✅ **Better for SEO** - Search engines prefer hyphens  
✅ **More Readable** - `quick-replies` vs `quick_replies`  
✅ **Web Standard** - Common in URLs  
✅ **Accessibility** - Screen readers handle better  

---

## State Management Flow

### SessionStorage Usage
```
Page Load
   ↓
1. User navigates to /leads
   ↓
2. LeadsPage component mounts
   ↓
3. useEffect runs:
   sessionStorage.setItem('activeTab', 'leads')
   ↓
4. App component renders
   ↓
5. AdminPanel component mounts
   ↓
6. AdminPanel reads:
   activeTab = sessionStorage.getItem('activeTab')
   ↓
7. AdminPanel sets state:
   setActiveTab('leads')
   ↓
8. Lead content displays
```

---

## Authentication Flow

### Protected Route Access
```
User Request
   ↓
Is user authenticated?
   ├─ Yes → Load requested page
   │        ↓
   │        Display content
   │
   └─ No → Redirect to /
            ↓
            Show login form
            ↓
            User logs in
            ↓
            Redirect to /dashboard
```

---

## Browser Integration

### Back/Forward Buttons
```
Navigation History:
/dashboard → /sliders → /forms → /leads

Back Button:
/leads → /forms → /sliders → /dashboard

Forward Button:
/dashboard → /sliders → /forms → /leads
```

### Page Refresh
```
Before: User on /leads
         ↓
       Press F5
         ↓
      Page reloads
         ↓
     Still on /leads ✅

Vs Old System:
Before: User on leads tab
         ↓
       Press F5
         ↓
      Page reloads
         ↓
     Back to default tab ❌
```

---

## URL Breadcrumb Visualization

```
Home (Tenant Login)
│
├─ After Login → Dashboard
│  │
│  ├─ Content Management
│  │  ├─ /sliders
│  │  └─ /quick-replies
│  │
│  ├─ Forms & Actions
│  │  ├─ /forms
│  │  └─ /buttons
│  │
│  ├─ Data & Team
│  │  ├─ /leads
│  │  └─ /team
│  │
│  ├─ Configuration
│  │  ├─ /integrations
│  │  ├─ /test-chatbot
│  │  ├─ /appearance
│  │  └─ /settings
│  │
│  └─ Analytics
│     └─ /dashboard (circular - home)
│
└─ Super Admin → /super-admin
   └─ Super Admin Dashboard
```

---

## Mobile vs Desktop URLs

### Desktop View
```
Wide Screen (≥1024px)
├─ Sidebar always visible
├─ URL navigation prominent
├─ Sources window shows in /test-chatbot
└─ Multi-column layouts

Same URLs work on all devices!
```

### Mobile View
```
Narrow Screen (<768px)
├─ Collapsible sidebar
├─ URL navigation works same
├─ Touch-optimized
└─ Single-column layouts

URLs: /dashboard, /leads, etc. (identical)
```

---

## Quick Access Patterns

### Most Used URLs (Power Users)
```
Daily Access:
1. /dashboard    - Morning metrics check
2. /leads        - Lead review
3. /test-chatbot - Quick testing

Weekly Access:
1. /sliders      - Content updates
2. /quick-replies - Response updates
3. /team         - Team management

As Needed:
1. /settings     - Embed code
2. /integrations - Webhook setup
3. /appearance   - Branding updates
```

---

## Summary

### URL Count
- **11 Tenant Pages** - Dedicated feature URLs
- **1 Login Page** - Root URL
- **1 Super Admin** - Admin portal
- **1 Embedded** - Chatbot view
- **Total: 14 URLs**

### Benefits
✅ Professional URL structure  
✅ Bookmarkable pages  
✅ Shareable links  
✅ SEO friendly  
✅ Analytics ready  
✅ User-friendly navigation  

---

**Version:** 2.2.0  
**Created:** January 29, 2025  
**Status:** ✅ Complete
