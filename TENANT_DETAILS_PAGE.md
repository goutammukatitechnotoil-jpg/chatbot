# Tenant Details Page Feature

## Overview
The Tenant Details Page provides Super Admins with comprehensive insights into individual tenant accounts, including analytics, activity logs, and management controls.

## Features

### 1. **Tenant Overview**
- Company information and branding
- Current plan and billing details
- Status indicators (Active, Suspended, Pending, Cancelled)
- Quick access to key metrics

### 2. **Analytics Dashboard**
Comprehensive analytics with the following metrics:
- **Total Sessions**: Number of chatbot conversations
- **Total Leads**: Captured lead count
- **Total Messages**: User and AI message breakdown
- **Conversion Rate**: Session to lead conversion percentage
- **Unique Customers**: Distinct users who interacted
- **Average Session Duration**: Time spent per session
- **Form Submissions**: Number of forms filled
- **Active Users**: Currently active team members

### 3. **Usage Metrics**
- Unique customer tracking
- Average session duration
- Form submission statistics
- Active user count

### 4. **Configuration Details**
- Total forms created
- Webhook integrations
- Team member count
- Storage usage (coming soon)

### 5. **Billing Information**
- Current plan details
- Monthly pricing
- Billing cycle information
- Next billing date

### 6. **Activity Log**
Real-time tracking of:
- User logins
- Configuration changes
- Form creation/updates
- System actions
- Timestamps and user attribution

### 7. **Tenant Management**
Super Admin controls:
- **Activate/Suspend**: Change tenant status
- **Edit Tenant**: Update tenant information
- **Delete Tenant**: Remove tenant (danger zone)
- **Export Data**: Download tenant data

## Access

### Navigation
1. Login to Super Admin dashboard at `/super-admin`
2. Navigate to "Tenants" tab
3. Click the "Eye" icon (👁️) next to any tenant in the list
4. View comprehensive tenant details

### Permissions
- **Required Role**: Super Admin
- **Access Level**: Full platform management

## Page Structure

### Header Section
- Tenant name and logo placeholder
- Subdomain information
- Creation date
- Status badge
- Plan badge
- Monthly revenue display

### Sub-Navigation Tabs
1. **Overview**: Quick stats and key metrics
2. **Analytics**: Detailed analytics with date range filtering
3. **Activity Log**: Recent actions and changes
4. **Settings**: Tenant management controls

## Date Range Filtering

Analytics can be filtered by:
- Last 7 days
- Last 30 days
- Last 90 days
- Last year

## Status Management

### Available Status Options
- **Active**: Fully operational tenant
- **Suspended**: Temporarily disabled
- **Pending**: Awaiting activation
- **Cancelled**: Permanently closed

### Status Change
Super Admins can change status with one click:
- Activate button (for non-active tenants)
- Suspend button (for active tenants)

## Data Points Displayed

### Overview Tab
- Total sessions
- Unique customers
- Total messages (user vs AI breakdown)
- Conversion rate
- Form submissions
- Active users
- Total forms
- Webhooks
- Team members

### Analytics Tab
- Historical data visualization (coming soon)
- Detailed metrics breakdown
- Performance indicators
- Customer satisfaction (coming soon)
- Return rate (coming soon)

### Activity Log Tab
- Action descriptions
- User attribution
- Timestamps
- Activity type icons

### Settings Tab
- Current status
- Status management controls
- Danger zone (delete tenant)

## API Integration

The page fetches data from:
- `/api/admin/tenants` - Tenant details
- `/api/analytics` - Analytics data with tenant context
- Headers used:
  - `Authorization: Bearer {token}`
  - `x-tenant-id: {tenantId}`

## Future Enhancements

### Planned Features
- [ ] Interactive charts (line charts, pie charts, bar charts)
- [ ] Export functionality for analytics
- [ ] Tenant configuration editor
- [ ] User management within tenant
- [ ] Billing management interface
- [ ] Storage usage tracking
- [ ] Real-time activity feed
- [ ] Email notifications for status changes
- [ ] Audit trail with full history
- [ ] Custom date range picker
- [ ] Comparison view (compare with other tenants)
- [ ] Performance benchmarks

### Analytics Enhancements
- [ ] Sessions by source visualization
- [ ] Messages over time graph
- [ ] Lead conversion funnel
- [ ] Customer journey mapping
- [ ] Chatbot performance metrics
- [ ] Form completion rates
- [ ] Webhook success/failure tracking

## Technical Details

### Component Location
`/src/components/TenantDetailsPage.tsx`

### Dependencies
- React hooks (useState, useEffect)
- Lucide React icons
- Tenant type definitions
- Custom analytics service

### State Management
- Local state for tenant data
- Analytics data fetching
- Activity log loading
- Error handling
- Loading states

### Props
```typescript
interface TenantDetailsPageProps {
  tenantId: string;
  onBack: () => void;
}
```

## User Guide

### Viewing Tenant Details
1. Access Super Admin Dashboard
2. Click "Tenants" in the top navigation
3. Find the tenant you want to view
4. Click the eye icon (👁️) in the actions column
5. Explore different tabs for various information

### Changing Tenant Status
1. Open tenant details
2. Go to "Settings" tab
3. View current status
4. Click "Activate" or "Suspend" button
5. Status updates immediately

### Exporting Data
1. Open tenant details
2. Click "Export Data" button in the header
3. Choose export format (coming soon)
4. Download the file

### Returning to Tenant List
- Click "Back to Tenants" button at the top of the page

## Error Handling

The page handles:
- Failed API requests
- Missing tenant data
- Invalid tenant IDs
- Network errors
- Authentication errors

Error messages appear in red alert boxes with dismiss option.

## Performance Considerations

- Lazy loading of analytics data
- Efficient state management
- Minimal re-renders
- Optimized API calls
- Date range filtering reduces data load

## Security

- All requests require Super Admin authentication
- JWT token validation
- Tenant isolation maintained
- Sensitive data protected
- Audit logging for all actions

## Best Practices

### For Super Admins
- Review analytics regularly
- Monitor suspicious activity
- Keep tenant information updated
- Use activity logs for troubleshooting
- Suspend rather than delete when possible

### For Development
- Keep components modular
- Handle loading states
- Provide clear error messages
- Maintain type safety
- Document API changes

---

**Last Updated**: November 28, 2025  
**Version**: 2.0.0  
**Status**: Production Ready
