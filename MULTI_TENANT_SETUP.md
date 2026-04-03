# FPT Chatbot Platform - Multi-Tenant SaaS Setup Guide

## Overview
The FPT Chatbot Platform has been converted to a multi-tenant SaaS architecture with isolated databases for each business unit, role-based access control, and a Super Admin dashboard for system management.

## Architecture Features
- ✅ Multi-tenant architecture with isolated databases
- ✅ Role-based access control (RBAC)
- ✅ Super Admin dashboard for tenant management
- ✅ Self-service tenant registration
- ✅ JWT-based authentication
- ✅ Session tracking enhancements (preserved from previous work)
- ✅ Existing features preserved (forms, chatbots, analytics, etc.)

## Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Update the following variables in .env.local:
MONGODB_URI=mongodb://localhost:27017/fpt_chatbot
MASTER_MONGODB_URI=mongodb://localhost:27017/fpt_chatbot_master
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SUPER_ADMIN_EMAIL=admin@fptchatbot.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration (First Time Setup)
```bash
# Start the development server
npm run dev

# Run migration to set up multi-tenant structure
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "setup-dev", "key": "migrate-fpt-chatbot-2024"}'
```

### 4. Access the Platform

#### Super Admin Access
- URL: `http://localhost:3000?mode=super-admin`
- Email: `admin@fptchatbot.com`
- Password: `SuperAdmin123!`

#### Demo Tenant Access
- URL: `http://localhost:3000` (or `http://demo.localhost:3000` if using subdomains)
- Email: `demo@company.com`
- Password: `Demo123!`

## Multi-Tenancy Features

### Tenant Isolation
- Each tenant has its own isolated database
- Tenant data is completely separated
- Database connections are managed efficiently with connection pooling

### User Roles & Permissions

#### Tenant User Roles
- **Owner**: Full access to tenant settings, billing, and all features
- **Admin**: User management, chatbot configuration, analytics
- **Editor**: Chatbot creation/editing, form management, lead access
- **Viewer**: Read-only access to chatbots, forms, leads, and analytics

#### Super Admin Roles
- **Super Admin**: Full system access, tenant management
- **Support**: Limited access for customer support

### Authentication Flow
1. User visits tenant subdomain (e.g., `company.fptchatbot.com`)
2. System identifies tenant from subdomain
3. User logs in with tenant-specific credentials
4. JWT token includes tenant context
5. All API requests are scoped to the tenant

## API Endpoints

### Authentication
- `POST /api/auth` - Login (tenant users & super admins)
- `GET /api/auth` - Verify token
- `DELETE /api/auth` - Logout
- `POST /api/auth/register` - Self-service tenant registration

### Super Admin
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create new tenant
- `POST /api/admin/migrate` - Database migration

### Tenant Management
- `GET /api/tenant/users` - Get tenant users
- `POST /api/tenant/invite` - Invite user to tenant
- `PUT /api/tenant/users/:id` - Update user

## Database Structure

### Master Database Collections
- `tenants` - Tenant information and settings
- `super_admins` - Super administrator users
- `system_settings` - Global system configuration

### Tenant Database Collections (per tenant)
- `tenant_users` - Tenant-specific users
- `chatbot_buttons` - Chatbot configurations
- `chatbot_config` - Chatbot settings
- `custom_forms` - Form definitions
- `lead_interactions` - Lead data with session tracking
- `analytics_data` - Analytics information
- `invitations` - User invitations

## Migration from Single-Tenant

If you have an existing single-tenant installation:

1. Backup your current database
2. Run the migration API:
```bash
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "migrate", "key": "migrate-fpt-chatbot-2024"}'
```
3. The migration will:
   - Create a super admin user
   - Create a default tenant from existing data
   - Migrate team members to tenant users
   - Preserve all existing chatbots, forms, and leads

## Session Tracking (Preserved Feature)

The session tracking enhancements from your previous requirements have been preserved and integrated:

- **Device Type**: Desktop, Mobile, Tablet detection
- **Operating System**: Windows, macOS, iOS, Android, etc.
- **Browser Type & Version**: Chrome, Firefox, Safari, etc.
- **IP Address**: Client IP address
- **Network Type**: WiFi, Cellular detection
- **Timezone**: User's local timezone
- **Country**: From form data (priority) or IP geolocation
- **Display**: All session info shown in Lead List expanded view

## Deployment Considerations

### Production Environment
```bash
# Set production environment variables
NODE_ENV=production
MONGODB_URI=mongodb://your-production-cluster
JWT_SECRET=your-secure-production-secret
SUPER_ADMIN_PASSWORD=your-secure-password
```

### Subdomain Configuration
For subdomain-based multi-tenancy (`tenant.yourdomain.com`):
1. Configure wildcard DNS: `*.yourdomain.com`
2. Update CORS settings for subdomains
3. Set `CUSTOM_DOMAINS=true` in environment

### Security
- Change all default passwords
- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Configure proper CORS origins
- Set up rate limiting
- Regular security audits

## Troubleshooting

### Common Issues

1. **Migration fails**: Check database connections and permissions
2. **Subdomain not working**: Verify DNS configuration and CORS settings
3. **Authentication errors**: Check JWT secret configuration
4. **Database connection errors**: Verify MongoDB connection strings

### Logs
- Check browser console for client-side errors
- Check server logs for API errors
- Monitor MongoDB logs for database issues

## Support

For technical support:
- Check the application logs
- Verify environment configuration
- Ensure all dependencies are installed
- Test with the demo tenant first

## Development

### Adding New Features
1. Consider tenant isolation for all new features
2. Use the `withTenant` middleware for API routes
3. Check user permissions using `usePermissions` hook
4. Test with multiple tenants

### Database Changes
1. Update migration service for schema changes
2. Test with existing tenants
3. Provide rollback procedures
4. Document any breaking changes

This multi-tenant architecture provides a scalable foundation for the FPT Chatbot Platform while preserving all existing functionality.
