# Tenant-Facing Pages & Features

This document provides a comprehensive list of all pages and features available to tenants in the FPT Chatbot Admin Panel.

## Overview

The tenant admin panel is a single-page application (SPA) with a tabbed interface. All features are accessed through tabs in the sidebar navigation.

**Access URL:** `http://localhost:5173/` (root path)

**Login Required:** Yes - Tenants must authenticate using their tenant-specific credentials.

---

## Navigation Tabs

### 1. 📊 Dashboard
**Tab ID:** `dashboard`  
**Icon:** LayoutDashboard  
**Description:** Main analytics and overview page

**Features:**
- **Statistics Cards:** Real-time metrics including:
  - Total Sessions
  - Total Messages
  - Total Leads
  - Engagement Rate
- **Word Cloud:** Visual representation of frequently used words/phrases in chat interactions
- **Funnel Chart:** Conversion funnel visualization showing user journey stages:
  - Sessions Started
  - Messages Sent
  - Forms Submitted
  - Leads Captured
- **Date Range Filter:** Filter analytics by custom date ranges
- **Quick Content Overview:** Display of configured sliders and quick reply sentences

**Purpose:** Monitor chatbot performance, track user engagement, and analyze conversion metrics.

---

### 2. 🖼️ Slider Images
**Tab ID:** `sliders`  
**Icon:** ImageIcon  
**Description:** Manage promotional image sliders displayed in the chatbot

**Features:**
- Add new slider images
- Configure image URL and link URL for each slider
- Set display order
- Delete existing sliders
- Save changes to database

**Purpose:** Showcase promotional content, products, or announcements through visual sliders in the chatbot interface.

---

### 3. 💬 Quick Replies
**Tab ID:** `sentences`  
**Icon:** MessageSquare  
**Description:** Manage predefined quick reply buttons for users

**Features:**
- Add new quick reply sentences
- Edit existing quick replies
- Set display order
- Delete quick replies
- Save changes to database

**Purpose:** Provide users with common questions or prompts as clickable buttons for faster interaction.

---

### 4. 📝 Custom Forms
**Tab ID:** `forms`  
**Icon:** FileText  
**Description:** Create and manage custom forms for lead capture

**Features:**
- **Form Builder:** Visual form creation interface
- **Field Types:** Support for various input types:
  - Text fields
  - Email fields
  - Phone fields
  - Number fields
  - Dropdown/Select fields
  - Checkboxes
  - Radio buttons
  - Text areas
- **Form Management:**
  - Create new forms
  - Edit existing forms
  - Delete forms
  - Set form names and descriptions
- **Field Configuration:**
  - Set field labels
  - Mark fields as required
  - Add placeholder text
  - Configure validation rules

**Purpose:** Capture user information, conduct surveys, or collect feedback through customizable forms.

---

### 5. 🎯 Button Actions
**Tab ID:** `buttons`  
**Icon:** MousePointer  
**Description:** Configure interactive buttons with custom actions

**Features:**
- Create action buttons (e.g., "Book a Demo", "Contact Sales")
- Configure button labels and types
- Set button actions:
  - Open URLs
  - Trigger forms
  - Send predefined messages
- Edit and delete buttons
- Real-time preview

**Purpose:** Drive user engagement with call-to-action buttons that perform specific actions.

---

### 6. 📇 Lead List
**Tab ID:** `leads`  
**Icon:** Database  
**Description:** View and manage captured leads

**Features:**
- **Lead Table:** Display all captured leads with:
  - Contact information (name, email, phone)
  - Submission timestamp
  - Source form
  - Custom field data
- **Filtering & Search:** Find specific leads
- **Export:** Download leads as CSV/Excel
- **Lead Details:** View full lead information
- **Analytics:** Lead capture metrics

**Purpose:** Manage and analyze leads captured through chatbot interactions.

---

### 7. 👥 Team Management
**Tab ID:** `team`  
**Icon:** UserCog  
**Description:** Manage team members and access control

**Features:**
- **Team Member List:** View all team members
- **Invite New Members:**
  - Send email invitations
  - Set user roles (Admin, Editor, Viewer)
- **Edit Member Details:**
  - Update roles
  - Change permissions
- **Remove Team Members**
- **Role-Based Access Control:**
  - Admin: Full access
  - Editor: Can edit content, view analytics
  - Viewer: Read-only access

**Purpose:** Collaborate with team members and control access to the chatbot admin panel.

---

### 8. ⚡ Integrations
**Tab ID:** `integrations`  
**Icon:** Zap  
**Description:** Connect external services and webhooks

**Features:**
- **Webhook Configuration:**
  - Set webhook URLs for lead capture
  - Configure webhook events
  - Test webhook connections
- **Integration Settings:**
  - API key management
  - Third-party service connections
- **Event Triggers:**
  - Form submissions
  - Lead captures
  - Custom events

**Purpose:** Integrate chatbot with CRM systems, marketing automation tools, or custom applications.

---

### 9. 🧪 Test Chatbot
**Tab ID:** `test`  
**Icon:** MessageSquare  
**Description:** Live chatbot preview and testing environment

**Features:**
- **Live Preview:** Real-time chatbot instance with current configuration
- **Interactive Testing:**
  - Test quick replies
  - Test custom forms
  - Test button actions
  - Test AI responses
- **Visual Testing:**
  - Verify color themes
  - Check logo display
  - Test icon animations
  - Validate message styling
- **Sources Window Testing:**
  - View sources panel behavior
  - Check configured width (default: 300px)
  - Desktop-only feature (≥1024px screens)
- **Testing Tips:** Built-in guidance for comprehensive testing

**Purpose:** Test and validate all chatbot features before deploying to production.

---

### 10. 🎨 Appearance
**Tab ID:** `appearance`  
**Icon:** Palette  
**Description:** Customize chatbot visual appearance

**Features:**
- **Primary Color Theme:**
  - Preset colors (FPT Orange, Blue, Green, Purple, Red, Teal)
  - Custom color picker
  - HEX color input
  - Live preview
- **Header Color Theme:**
  - Independent header color selection
  - Preset and custom options
  - Header preview
- **Chatbot Icon:**
  - Icon type selection:
    - FPT Logo (static image)
    - Siri White (animated SVG)
    - Siri Transparent (animated with gradient)
  - Live icon preview
- **Chatbot Name:**
  - Set display name for chat header
  - Real-time preview
- **Messages Configuration:**
  - Tooltip trigger message
  - Bot greeting message
  - Temporary popup title
  - Popup message content
- **Logo Settings:**
  - Upload custom logo
  - Logo URL configuration
- **Save Changes:** Apply all appearance settings

**Purpose:** Brand the chatbot to match company identity and create engaging user experience.

---

### 11. ⚙️ Settings
**Tab ID:** `settings`  
**Icon:** Settings  
**Description:** General chatbot configuration and settings

**Features:**
- **Embed Configuration:**
  - Tenant-specific configuration key
  - Embed code snippet (HTML/JavaScript)
  - Copy-to-clipboard functionality
  - Implementation instructions
- **AI Configuration:**
  - AI model settings
  - Response behavior
  - Context management
- **General Settings:**
  - Session timeout
  - Language preferences
  - Privacy settings
- **Analytics Settings:**
  - Enable/disable analytics tracking
  - Data retention settings
- **Advanced Options:**
  - Custom CSS
  - Advanced integrations

**Purpose:** Configure core chatbot functionality and generate embed code for website integration.

---

## Page Access & Permissions

### User Roles
1. **Admin:** Full access to all tabs and features
2. **Editor:** Access to content tabs (Dashboard, Sliders, Quick Replies, Forms, Buttons, Leads, Test, Appearance)
3. **Viewer:** Read-only access to Dashboard and Leads

### Authentication
- All pages require tenant authentication
- Session-based authentication with JWT tokens
- Auto-logout on session expiration
- Secure API calls with tenant context

---

## Routing & Navigation

### URL Structure
- **Base URL:** `http://localhost:5173/`
- **Authentication:** Handled at root level, no separate login route
- **SPA Navigation:** Tab-based, no URL changes (client-side state management)

### Login Page
- **Component:** `MultiTenantLogin` (or `Login` component)
- **Location:** Root path when not authenticated
- **Features:**
  - Tenant-specific login
  - Email and password authentication
  - "Remember me" option
  - Password reset flow

---

## Key Components

| Tab | Primary Component | Secondary Components |
|-----|------------------|---------------------|
| Dashboard | `DashboardView` | `StatisticsCards`, `WordCloud`, `FunnelChart`, `DateRangeFilter` |
| Slider Images | `SlidersView` | - |
| Quick Replies | `SentencesView` | - |
| Custom Forms | `FormsView` | `FormBuilder`, `FormFieldEditor` |
| Button Actions | `ButtonList` | `ButtonEditor` |
| Lead List | `LeadList` | - |
| Team Management | `TeamManagement` | `TeamTable`, `InviteMemberModal`, `EditMemberModal` |
| Integrations | `IntegrationSettings` | - |
| Test Chatbot | `TestChatbotView` | `Chatbot`, `ChatWindow` |
| Appearance | `AppearanceView` | - |
| Settings | `SettingsView` | - |

---

## Data Flow

### API Endpoints (Tenant-Scoped)
- `/api/analytics` - Analytics data
- `/api/content` - Slider images and quick replies
- `/api/form` - Custom forms CRUD
- `/api/button` - Button actions CRUD
- `/api/lead` - Lead management
- `/api/team` - Team member management
- `/api/integrations` - Webhook and integration settings
- `/api/config` - Chatbot configuration
- `/api/settings` - General settings

### Authentication Headers
All API requests include:
- `x-tenant-id`: Tenant identifier
- `Authorization`: JWT token

---

## User Workflows

### Common User Journeys

1. **First-Time Setup:**
   - Dashboard → Appearance → Slider Images → Quick Replies → Settings → Test Chatbot

2. **Content Management:**
   - Slider Images → Quick Replies → Custom Forms → Button Actions → Test Chatbot

3. **Lead Management:**
   - Dashboard → Lead List → Export Leads

4. **Team Collaboration:**
   - Team Management → Invite Members → Set Roles

5. **Integration Setup:**
   - Integrations → Configure Webhook → Test → Settings

6. **Appearance Customization:**
   - Appearance → Color Theme → Logo → Messages → Test Chatbot

---

## Mobile & Responsive Considerations

### Desktop (≥1024px)
- Full sidebar navigation
- All features fully accessible
- Sources window visible in Test Chatbot
- Multi-column layouts

### Tablet (768px - 1023px)
- Collapsible sidebar
- Single-column forms
- Optimized tables
- Responsive charts

### Mobile (<768px)
- Hidden sidebar (toggle menu)
- Stacked layouts
- Touch-optimized buttons
- Simplified tables

---

## Feature Availability Matrix

| Feature | Admin | Editor | Viewer |
|---------|-------|--------|--------|
| Dashboard | ✅ | ✅ | ✅ |
| Slider Images | ✅ | ✅ | ❌ |
| Quick Replies | ✅ | ✅ | ❌ |
| Custom Forms | ✅ | ✅ | ❌ |
| Button Actions | ✅ | ✅ | ❌ |
| Lead List | ✅ | ✅ | ✅ (Read-only) |
| Team Management | ✅ | ❌ | ❌ |
| Integrations | ✅ | ❌ | ❌ |
| Test Chatbot | ✅ | ✅ | ✅ |
| Appearance | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ |

---

## Technical Implementation

### Framework & Libraries
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Context** - State management

### State Management
- `TenantContext` - Tenant authentication and data
- `ChatbotConfigContext` - Chatbot configuration
- `AuthContext` - User authentication

### Data Persistence
- MongoDB database
- API-driven CRUD operations
- Real-time updates

---

## Summary

The FPT Chatbot platform provides **11 comprehensive pages** (tabs) for tenant users:

1. **Dashboard** - Analytics and metrics
2. **Slider Images** - Promotional content
3. **Quick Replies** - Predefined responses
4. **Custom Forms** - Lead capture forms
5. **Button Actions** - Interactive buttons
6. **Lead List** - Lead management
7. **Team Management** - User collaboration
8. **Integrations** - External service connections
9. **Test Chatbot** - Live testing environment
10. **Appearance** - Visual customization
11. **Settings** - Configuration and embed code

All pages are accessible through a unified admin panel interface with role-based access control and real-time data synchronization.

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Maintained By:** FPT Chatbot Development Team
