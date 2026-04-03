# FPT Software Chatbot Platform

A comprehensive multi-tenant AI-powered chatbot solution built with Next.js, TypeScript, and MongoDB, featuring an advanced admin panel for complete customization and management with Super Admin capabilities.

## 🌐 Quick Start

### Access URLs

**Tenant Login:** `http://localhost:3000/`  
**Super Admin Login:** `http://localhost:3000/super-admin`  
**Embedded Chatbot:** `http://localhost:3000/?embedded=true`

### Tenant Page URLs (Dedicated Routes) ✨ NEW

Each tenant feature now has its own dedicated URL:

- **Dashboard:** `http://localhost:3000/dashboard`
- **Slider Images:** `http://localhost:3000/sliders`
- **Quick Replies:** `http://localhost:3000/quick-replies`
- **Custom Forms:** `http://localhost:3000/forms`
- **Button Actions:** `http://localhost:3000/buttons`
- **Lead List:** `http://localhost:3000/leads`
- **Team Management:** `http://localhost:3000/team`
- **Integrations:** `http://localhost:3000/integrations`
- **Test Chatbot:** `http://localhost:3000/test-chatbot`
- **Appearance:** `http://localhost:3000/appearance`
- **Settings:** `http://localhost:3000/settings`

> 📖 See [Dedicated Page URLs Guide](./DEDICATED_PAGE_URLS.md) for complete documentation

### Default Credentials

#### Super Admin
- **Email:** `admin@fptchatbot.com`
- **Password:** `SuperAdmin123!`
- **Access:** Full platform management, tenant creation, analytics across all tenants

#### Demo Tenant User (if seeded)
- **Email:** `demo@company.com`
- **Password:** `Demo123!`
- **Tenant:** demo.localhost:3000

## 🚀 Features

### Multi-Tenant Architecture
- **Isolated Tenant Databases**: Each tenant has their own secure database
- **Super Admin Dashboard**: Centralized management for all tenants
- **Tenant Management**: Create, edit, activate/deactivate tenants
- **User Isolation**: Complete data separation between tenants
- **Custom Branding**: Per-tenant customization and white-labeling

### Core Chatbot Functionality
- **AI-Powered Conversations**: Integration with Microsoft Bot Framework
- **Interactive UI**: Modern, responsive chat interface with customizable themes
- **Sources Window**: Reference panel showing source links for bot responses
- **Form Integration**: Custom forms triggered by chatbot interactions
- **Form Submission Confirmation**: Beautiful success screen after form submission ✨ NEW
- **Session Management**: Persistent conversation tracking
- **Mobile Responsive**: Optimized for all screen sizes

### Advanced Admin Panel (Tenant)
- **11 Dedicated Page Routes**: Each feature has its own URL (bookmarkable, shareable) ✨ NEW
- **Appearance Customization**: Colors, logos, themes, and branding
- **Content Management**: Predefined sentences, welcome messages, and bot responses
- **Form Builder**: Create and manage custom forms with drag-and-drop interface
- **Button Management**: Configure action buttons and their behaviors
- **Default System Buttons**: Pre-configured "Speak to Expert" and "Continue with AI" buttons ✨ NEW
- **Lead Management**: Comprehensive lead tracking with conversation history
- **Team Management**: User roles and permissions
- **Analytics Dashboard**: Detailed insights and reporting
- **Integration Settings**: Webhook configurations and external integrations
- **Settings Control**: System-wide configuration options

### Super Admin Features
- **Tenant Dashboard**: View and manage all tenants from one interface
- **Tenant Details Page**: Comprehensive tenant analytics and management
- **Tenant Creation**: Onboard new tenants with custom configurations
- **Multiple Super Admins**: Add and manage multiple Super Admin users ✨ NEW
- **User Management**: Manage Super Admin accounts with role assignment
- **Global Analytics**: Cross-tenant analytics and reporting
- **System Monitoring**: Platform-wide health and performance metrics
- **Status Management**: Activate, suspend, or cancel tenant accounts
- **Billing & Plans**: (Future) Subscription and plan management

### Lead Management System
- **Conversation Tracking**: Complete chat history for each interaction
- **Form Data Integration**: Merge chat and form submissions into unified records
- **CSV Export**: Export leads with conversation history
- **Pagination**: Efficient browsing of large lead datasets
- **Search & Filter**: Advanced lead filtering capabilities
- **Duplicate Prevention**: Automatic session-based lead consolidation

## 🛠 Technology Stack

- **Frontend**: Next.js 16+ with TypeScript and React 18
- **Styling**: Tailwind CSS with custom components
- **Backend**: Next.js API routes with middleware
- **Database**: MongoDB Atlas with multi-tenant architecture
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Icons**: Lucide React icons
- **State Management**: React Context API (Auth, Tenant, ChatbotConfig)
- **Bot Framework**: Microsoft Bot Framework Direct Line API
- **Build Tool**: Vite for fast development

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB instance
- Microsoft Bot Framework credentials (Direct Line Secret)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "FPT Chatbot 10"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fpt_chatbot_master
   
   # Super Admin (Optional - defaults shown below)
   SUPER_ADMIN_EMAIL=admin@fptchatbot.com
   SUPER_ADMIN_PASSWORD=SuperAdmin123!
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Bot Framework (if using)
   BOT_DIRECT_LINE_SECRET=your-direct-line-secret
   ```

4. **Database Setup**
   The database will be automatically initialized on first run with:
   - Super admin account creation
   - Default collections and indexes
   - Sample data (if in development mode)

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - **Tenant Login**: http://localhost:3000
   - **Super Admin**: http://localhost:3000/super-admin
   - **API Documentation**: Check `/pages/api/*` for available endpoints

### First Time Setup

1. Access Super Admin portal at `http://localhost:3000/super-admin`
2. Login with default credentials:
   - Email: `admin@fptchatbot.com`
   - Password: `SuperAdmin123!`
3. Create your first tenant from the Super Admin dashboard
4. Configure tenant settings and branding
5. Invite team members to the tenant
6. Configure chatbot settings and deploy

## 🎯 Project Structure

```
FPT Chatbot 10/
├── pages/                      # Next.js pages and API routes
│   ├── index.tsx              # Tenant login page (/)
│   ├── super-admin.tsx        # Super admin login page (/super-admin)
│   ├── _app.tsx               # App wrapper
│   └── api/                   # API endpoints
│       ├── auth/              # Authentication endpoints
│       ├── admin/             # Super admin endpoints
│       ├── tenant/            # Tenant management
│       ├── lead/              # Lead management
│       ├── analytics/         # Analytics endpoints
│       ├── config/            # Configuration APIs
│       ├── content/           # Content management
│       ├── form/              # Form builder APIs
│       ├── button/            # Button management
│       ├── team/              # Team management
│       ├── webhook/           # Webhook integrations
│       └── settings/          # Settings APIs
├── src/
│   ├── components/            # React components
│   │   ├── Chatbot.tsx       # Main chatbot interface
│   │   ├── AdminPanel.tsx    # Tenant admin dashboard
│   │   ├── SuperAdminDashboard.tsx  # Super admin dashboard
│   │   ├── MultiTenantLogin.tsx     # Login component
│   │   ├── LeadList.tsx      # Lead management
│   │   ├── FormBuilder.tsx   # Form builder
│   │   └── ...               # Other components
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx   # Authentication state
│   │   ├── TenantContext.tsx # Tenant state
│   │   └── ChatbotConfigContext.tsx
│   ├── services/              # Business logic services
│   │   ├── authService.ts
│   │   ├── tenantService.ts
│   │   ├── leadService.ts
│   │   ├── analyticsService.ts
│   │   ├── multiTenantDatabaseService.ts
│   │   └── ...
│   ├── middleware/            # API middleware
│   │   └── auth.ts           # Auth middleware (withAuth, withTenant, withSuperAdmin)
│   ├── models/                # Database models
│   │   ├── Tenant.ts
│   │   ├── Lead.ts
│   │   └── ...
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── public/                    # Static assets
│   ├── chatbot-loader.js     # Embedded chatbot script
│   └── test-*.html           # Test pages
├── scripts/                   # Utility scripts
└── docs/                      # Documentation files
```

## 🎯 Key Components

### Authentication & Multi-Tenancy

#### TenantContext (`/src/contexts/TenantContext.tsx`)
- Central tenant and authentication state management
- Auto-login detection and token validation
- Super admin vs tenant user differentiation
- Tenant database connection management

#### MultiTenantLogin (`/src/components/MultiTenantLogin.tsx`)
- Unified login component for both tenant and super admin
- Mode detection based on URL path
- Forgot password integration
- Responsive design with branding

#### Auth Middleware (`/src/middleware/auth.ts`)
- `withAuth`: Basic JWT authentication
- `withTenant`: Tenant-specific authentication with database access
- `withSuperAdmin`: Super admin only endpoints
- `withTenantOwner`: Tenant owner permissions

### Super Admin Features

#### SuperAdminDashboard (`/src/components/SuperAdminDashboard.tsx`)
- Tenant overview and management
- Tenant creation wizard
- Analytics across all tenants
- System monitoring and health checks

#### Tenant Management Service (`/src/services/tenantService.ts`)
- Create, update, delete tenants
- Tenant activation/deactivation
- Database provisioning per tenant
- Tenant configuration management

### Tenant Admin Features

#### AdminPanel (`/src/components/AdminPanel.tsx`)
- Multi-tab interface for all settings
- Real-time configuration updates
- Lead management and analytics
- Team collaboration tools

### Chatbot Interface (`/src/components/Chatbot.tsx`)
- Main chatbot component with conversation handling
- Message deduplication and session tracking
- Integration with form triggers and actions
- Sources window for reference links
- Mobile-responsive design

### Lead Management (`/src/components/LeadList.tsx`)
- Paginated lead browsing with search
- Conversation history modal
- CSV export with complete chat logs
- Advanced filtering and sorting
- Real-time updates

### Form System (`/src/components/FormRenderer.tsx`)
- Dynamic form rendering from database configs
- Custom field types and validation
- Integration with lead capture system
- Multi-step form support

## 🔧 Configuration

### Chatbot Appearance
- **Colors & Themes**: Customize primary colors and header themes
- **Branding**: Upload custom logos and set chatbot names
- **Messages**: Configure welcome messages and auto-triggers
- **Locale**: Multi-language support with auto-detection

### Content Management
- **Predefined Sentences**: Quick response options
- **Auto-Triggers**: Automated message sequences
- **Bot Responses**: Customize AI behavior and responses

### Form Builder
- **Field Types**: Text, email, select, textarea, checkbox, radio
- **Validation**: Required fields and custom validation rules
- **Layout**: Flexible field positioning (left, right, full-width)
- **Styling**: Custom colors and button text

### Team & Permissions
- **User Roles**: Admin, Editor, Viewer permissions
- **Member Management**: Invite and manage team members
- **Access Control**: Feature-based permission system

## 🗄 Database Schema

### Master Database (Platform Level)
- **tenants**: Tenant organizations and configurations
- **super_admins**: Super administrator accounts
- **system_settings**: Platform-wide settings

### Tenant Databases (Per Tenant)
- **users**: Tenant team members and permissions
- **config**: Chatbot configuration and appearance
- **chatbot_content**: Messages, sentences, and content
- **leads**: Lead interactions with chat history and form data
- **forms**: Custom form definitions and fields
- **form_fields**: Individual form field configurations
- **chatbot_buttons**: Action button configurations
- **button_form_connections**: Button-to-form mappings
- **form_submissions**: Raw form submission data
- **webhooks**: Webhook configurations for integrations
- **analytics**: Analytics and tracking data

## 📊 Analytics & Reporting

### Metrics Tracked
- Total conversations and unique users
- Message counts (user vs AI responses)
- Lead conversion rates
- Form completion statistics
- Session duration and engagement

### Export Capabilities
- **CSV Export**: Complete lead data with conversation history
- **Date Filtering**: Time-range based reporting
- **Search Integration**: Export filtered results
- **Conversation Logs**: Full chat transcripts in exports

### Comprehensive KPIs
- Total sessions, unique customers, session duration, message counts
- Conversion Funnel: Track user journey from session to lead capture
- Date Range Filtering: Flexible time period analysis (today, last 7/30 days, custom ranges)
- Lead Management: Pagination, search, and CSV export with conversation history
- Real-time Metrics: 
  - Session analytics calculated from actual chat timestamps
  - Unique customer identification from form data (email/phone priority)
  - User vs AI message breakdown from conversation history
  - Lead conversion rates and form submission tracking

## 🔒 Security Features

- **Input Validation**: Comprehensive form and API validation
- **Session Security**: Secure session management
- **Database Security**: MongoDB connection encryption
- **Error Handling**: Graceful error management with logging
- **Rate Limiting**: API protection against abuse

## 🚦 API Endpoints

### Authentication APIs
- `POST /api/auth` - Login (tenant or super admin based on credentials)
- `POST /api/auth/register` - Register new tenant user
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/reset-password` - Complete password reset
- `POST /api/auth/verify-otp` - Verify OTP for password reset

### Super Admin APIs
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create new tenant
- `PUT /api/admin/tenants` - Update tenant
- `DELETE /api/admin/tenants` - Delete tenant
- `GET /api/admin/analytics` - Cross-tenant analytics

### Tenant Management APIs
- `GET /api/tenant` - Get current tenant info
- `POST /api/tenant/settings` - Update tenant settings

### Configuration APIs
- `GET/POST /api/config` - Chatbot configuration management
- `GET/POST /api/content` - Content and messaging settings
- `GET/POST /api/settings` - System-wide settings
- `GET/POST /api/defaults` - Default configurations

### Lead Management APIs
- `GET /api/lead` - List leads with filtering and pagination
- `POST /api/lead` - Create new lead
- `PUT /api/lead/[id]` - Update specific lead
- `DELETE /api/lead/[id]` - Delete lead
- `GET /api/lead/export` - CSV export functionality

### Analytics APIs
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/kpis` - Key performance indicators
- `POST /api/analytics/track` - Track events

### Form APIs
- `GET /api/form` - List all forms
- `POST /api/form` - Create new form
- `PUT /api/form` - Update form
- `DELETE /api/form` - Delete form
- `GET/POST/PUT/DELETE /api/form/fields` - Form field management
- `POST /api/form/submit` - Form submission handling

### Button & Action APIs
- `GET /api/button` - List buttons
- `POST /api/button` - Create button
- `PUT /api/button` - Update button
- `DELETE /api/button` - Delete button
- `POST /api/button/connect` - Create button-form connection
- `DELETE /api/button/connect` - Remove connection
- `GET /api/button/connection` - Get connection info

### Team Management APIs
- `GET /api/team` - List team members
- `POST /api/team/invite` - Invite new member
- `PUT /api/team/[id]` - Update member
- `DELETE /api/team/[id]` - Remove member

### Webhook & Integration APIs
- `GET /api/webhook` - List webhooks
- `POST /api/webhook` - Create webhook
- `PUT /api/webhook` - Update webhook
- `DELETE /api/webhook` - Delete webhook
- `POST /api/webhook/test` - Test webhook
- `GET /api/integrations` - List integrations
- `POST /api/integrations/configure` - Configure integration

## 🎨 Customization

### Theming
The application supports extensive theming through the admin panel:
- Primary color schemes
- Header color customization  
- Logo and branding uploads
- Custom CSS integration

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Flexible layouts

## 📈 Performance Optimizations

- **Lazy Loading**: Component-based code splitting
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Strategic caching of configuration data
- **Pagination**: Efficient large dataset handling
- **Memory Management**: Optimized state management

## 🧪 Testing & Scripts

### Available NPM Scripts
- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run preview` - Preview Vite build
- `npm run typecheck` - TypeScript type checking

### Utility Scripts (in /scripts)
- `seedDefaults.js` - Initialize default data for new tenants
- `seedDefaultButtons.js` - **NEW** ⭐ Add default "Speak to Expert" button to all tenants
- `seedDefaultContactForm.js` - **NEW** ⭐ Add default "Contact Us" form to all tenants
- `fixDuplicateLeads.js` - Merge duplicate lead records
- `verifyMigration.sh` - Verify database migrations
- `testAdminPanelIntegration.sh` - Test admin panel APIs
- `testChatbotUISources.sh` - Test sources window functionality
- `testLogoURLField.sh` - Verify logo URL requirements
- `testSourcesWindow.sh` - Integration tests for sources

### Running Tests
```bash
# Test admin panel integration
bash scripts/testAdminPanelIntegration.sh

# Verify database setup
bash scripts/verifyMigration.sh

# Fix duplicate leads
node scripts/fixDuplicateLeads.js

# Add default buttons to all existing tenants
node scripts/seedDefaultButtons.js

# Add default "Contact Us" form to all existing tenants
node scripts/seedDefaultContactForm.js
```

## 🔐 Security & Best Practices

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: Super admin, tenant owner, team member roles
- **Session Management**: Secure cookie handling
- **Token Expiration**: Configurable token lifetime

### Data Security
- **Tenant Isolation**: Complete database separation per tenant
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Token-based CSRF prevention

### API Security
- **Rate Limiting**: Prevent API abuse (configurable)
- **CORS Configuration**: Controlled cross-origin requests
- **Error Handling**: Secure error messages (no sensitive data)
- **Logging**: Comprehensive audit logs for sensitive operations

### Environment Variables
- Never commit `.env.local` to version control
- Use strong JWT secrets in production
- Rotate credentials regularly
- Use MongoDB Atlas IP whitelisting

## 🆘 Support & Troubleshooting

### Common Issues

#### "Unauthorized" Error on Content API
**Problem**: Chatbot tries to load content before authentication  
**Solution**: Ensure chatbot is only rendered for authenticated users (fixed in v2.0)

#### Cannot Login as Super Admin
**Problem**: Super admin account not created  
**Solution**: Check MongoDB for super_admins collection, or restart server to trigger initialization

#### Tenant Database Connection Failed
**Problem**: Tenant database not provisioned  
**Solution**: Ensure tenant was created through Super Admin dashboard with proper DB initialization

#### Form Not Triggering
**Problem**: Button-form connection missing  
**Solution**: Verify connection in admin panel under Button Management

#### Leads Not Showing
**Problem**: Database query timeout or permission issue  
**Solution**: Check tenant database connection and user permissions

### Debug Mode

Enable debug logging by setting in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

### Getting Help

1. Check the documentation files in `/docs`
2. Review error logs in browser console and server logs
3. Verify environment variables are set correctly
4. Check MongoDB Atlas connection and permissions
5. Review API endpoint responses in Network tab

### Development Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Microsoft Bot Framework](https://dev.botframework.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow TypeScript best practices
   - Add proper type definitions
   - Include comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Run type checking: `npm run typecheck`
   - Test locally with different scenarios
   - Verify no console errors

5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots if UI changes

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

### Commit Message Convention

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): add password reset functionality

Implemented forgot password flow with OTP verification
and email sending capability.

Closes #123
```

## 📄 License

This project is proprietary software developed for FPT Software.  
© 2025 FPT Software. All rights reserved.

## 👥 Team & Credits

**Developed by**: FPT Software Development Team  
**Architecture**: Multi-tenant SaaS Platform  
**Tech Stack**: Next.js, TypeScript, MongoDB, React

### Special Thanks
- Microsoft Bot Framework team for AI integration support
- MongoDB Atlas for reliable database infrastructure
- Vercel for Next.js framework and deployment platform
- Open source community for the amazing libraries used

## 📞 Contact & Support

For support, questions, or feature requests:

- **Email**: support@fptchatbot.com (example)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Admin Panel Help**: Built-in help sections in the admin interface

### Enterprise Support

For enterprise customers:
- Dedicated support team
- Custom SLA agreements  
- Priority bug fixes
- Custom feature development
- Training and onboarding assistance

## 🗺 Roadmap

### Upcoming Features (Q1 2025)
- [ ] Advanced analytics with custom dashboards
- [ ] Multi-language support for admin panel
- [ ] Mobile app for admin management
- [ ] Advanced AI training interface
- [ ] Custom webhook transformations
- [ ] API rate limiting per tenant
- [ ] Billing and subscription management
- [ ] Advanced team roles and permissions

### Future Enhancements
- [ ] Voice chat integration
- [ ] Video chat support
- [ ] Advanced chatbot personalization
- [ ] A/B testing for chatbot responses
- [ ] Integration marketplace
- [ ] White-label solutions
- [ ] Advanced security features (2FA, SSO)
- [ ] Chatbot performance optimization

## 📚 Additional Documentation

For more detailed information, see:

### 📋 Quick Reference
- [**Project Complete Summary**](./PROJECT_COMPLETE_SUMMARY.md) **NEW** - ⭐ Start here for complete overview
- [**Tenant Pages Quick Reference**](./TENANT_PAGES_QUICK_REFERENCE.md) **NEW** - Quick lookup table
- [**Dedicated Page URLs Guide**](./DEDICATED_PAGE_URLS.md) **NEW** - ⭐ URL routing documentation

### 👥 User Guides
- [**Tenant-Facing Pages & Features**](./TENANT_FACING_PAGES.md) **NEW** - Complete guide to all tenant pages
- [**Multiple Super Admin Users**](./MULTIPLE_SUPER_ADMINS.md) **NEW** ⭐ - Create and manage multiple Super Admins
- [Multi-Tenant Setup Guide](./MULTI_TENANT_SETUP.md)
- [Testing Guide](./TESTING_GUIDE.md)

### 🎯 Feature Documentation
- [**Default Contact Form - COMPLETE**](./DEFAULT_CONTACT_FORM_IMPLEMENTATION_COMPLETE.md) **NEW** 🎉 - ⭐⭐⭐ START HERE - Complete implementation summary
- [**Default Contact Form - Complete Specification**](./DEFAULT_CONTACT_FORM_COMPLETE.md) **NEW** ⭐⭐⭐ - All 8 fields detailed specification
- [**Default Contact Form - Visual Flow Diagrams**](./DEFAULT_CONTACT_FORM_VISUAL_FLOW.md) **NEW** 🎨 - System architecture and data flow
- [**Default Contact Form - Testing Checklist**](./DEFAULT_CONTACT_FORM_TESTING_CHECKLIST.md) **NEW** 🧪 - 15 comprehensive test suites
- [**Default Contact Form Implementation**](./DEFAULT_CONTACT_FORM_IMPLEMENTATION.md) **NEW** ⭐ - Technical implementation details
- [**Default Buttons Implementation**](./DEFAULT_BUTTONS_IMPLEMENTATION.md) **NEW** ⭐ - Automatic "Speak to Expert" button
- [**Form Submission Confirmation UX**](./FORM_SUBMISSION_CONFIRMATION_UX.md) **NEW** ✅ - Success screen after form submission
- [**Form Submission Visual Flow**](./FORM_SUBMISSION_CONFIRMATION_VISUAL.md) **NEW** 🎨 - Visual diagrams of success UX
- [Tenant Details Page Guide](./TENANT_DETAILS_PAGE.md) **NEW**
- [Tenant Details Implementation](./TENANT_DETAILS_IMPLEMENTATION.md) **NEW**
- [Super Admin Access Fix](./SUPER_ADMIN_ACCESS_FIX.md) **NEW**
- [**Webhook Field Mappings Update**](./WEBHOOK_FIELD_MAPPINGS_UPDATE.md) **NEW** 🔧 - Added Session ID, Country, Purpose, Details, Bot Conversation
- [**Webhook Job Title Fix**](./WEBHOOK_JOB_TITLE_FIX.md) **NEW** 🐛 - Fixed Job Title field missing in webhook payloads
- [**Webhook Integration Explained**](./WEBHOOK_EXPLANATION.md) **NEW** - Complete webhook guide
- [**Webhook Testing & Debugging**](./WEBHOOK_TESTING_GUIDE.md) **NEW** ⭐ - Step-by-step testing guide
- [**Webhook Fixes & Troubleshooting**](./WEBHOOK_FIXES.md) **NEW** - Fix for CORS and lead trigger issues
- [Analytics KPIs Documentation](./ANALYTICS_KPIs.md)
- [Webhook Integration Guide](./WEBHOOK_INTEGRATION.md)
- [Word Cloud Feature](./WORD_CLOUD_FEATURE.md)

### 🔧 Technical Documentation
- [**Token Endpoint URL Fix**](./TOKEN_ENDPOINT_URL_FIX.md) **NEW** 🔧 - Fixed hardcoded endpoint causing tenant isolation issues
- [**Critical Cache Fix Testing Guide**](./CRITICAL_CACHE_FIX_TESTING.md) **NEW** 🚨 - ⭐⭐⭐ MUST READ - Aggressive cache fix
- [**Lead List Complete Fix**](./LEAD_LIST_COMPLETE_FIX.md) **NEW** 🎯 - ⭐ Complete summary of all session visibility fixes
- [**Button Form Connection Fix**](./BUTTON_FORM_CONNECTION_FIX.md) **NEW** 🔧 - ⭐ Fixed form popup not opening on button click
- [**Browser Cache Fix**](./BROWSER_CACHE_FIX.md) **NEW** ⚡ - Fixed DevTools-only visibility issue
- [**Lead List Auto-Refresh Fix**](./LEAD_LIST_AUTO_REFRESH_FIX.md) **NEW** 🔄 - Auto-refresh every 30s + manual refresh button
- [**Session Visibility Fix**](./SESSION_VISIBILITY_FIX.md) **NEW** 🎯 - Sessions with only browser visits now visible
- [**Domain Tenant Detection**](./DOMAIN_TENANT_DETECTION_FIX.md) **NEW** ⭐ - Anonymous users & custom domains
- [Implementation Guide](./IMPLEMENTATION_COMPLETE.md)
- [Sources Window Fix](./SOURCES_WINDOW_FIX.md)
- [**Lead Tracking Fix**](./LEAD_TRACKING_FIX.md) **NEW** - Fixed chat sessions not appearing in leads

### 🐛 Troubleshooting & Debugging
- [**Button Troubleshooting Guide**](./BUTTON_TROUBLESHOOTING_GUIDE.md) **NEW** 🔍 - ⭐ Quick reference for button issues
- [**Anonymous Session Debugging Guide**](./ANONYMOUS_SESSION_DEBUGGING.md) **NEW** 🐛 - Debug session tracking issues
- [**FPTEU Session Troubleshooting**](./FPTEU_SESSION_TROUBLESHOOTING.md) **NEW** 🔧 - Specific guide for fpteu.fptchatbot.com
- [**Why Session Not Visible**](./WHY_SESSION_NOT_VISIBLE.md) **NEW** 🔍 - Troubleshoot missing sessions

### 🧪 Testing & Debugging Tools
- [Real-Time Cache Debug Tool](http://localhost:3000/test-realtime-cache.html) - **NEW** 🚨 Real-time cache monitoring
- [Cache Behavior Test](http://localhost:3000/test-cache-behavior.html) - **NEW** ⚡ Test if cache fix is working
- [Session Tracking Test Page](http://localhost:3000/test-session-tracking.html) - Interactive testing tool
- [Session Diagnostic Tool](http://localhost:3000/session-diagnostic.html) - **NEW** ⚡ Debug why specific sessions aren't visible
- [Embedded Chatbot Test](http://localhost:3000/test-embedded-chatbot.html)
- [Sources Window Test](http://localhost:3000/test-sources-window.html)

---

**Built with ❤️ by FPT Software Development Team**

**Last Updated**: November 29, 2025  
**Version**: 2.4.1  
**Status**: Production Ready 🚀
