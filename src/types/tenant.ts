// Multi-tenant SaaS types and interfaces

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  domain?: string; // Custom domain
  database_name: string;
  database_uri: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
  configKey?: string; // Chatbot configuration key
  settings: TenantSettings;
  billing: TenantBilling;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TenantSettings {
  max_users: number;
  max_chatbots: number;
  max_sessions_per_month: number;
  custom_branding: boolean;
  api_access: boolean;
  analytics_retention_days: number;
  storage_limit_gb: number;
  allowed_domains: string[];
}

export interface TenantBilling {
  plan_price: number;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date: string;
  payment_method?: string;
  is_trial: boolean;
  trial_ends_at?: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: TenantUserRole;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type TenantUserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'support';
  status: 'active' | 'inactive';
  permissions: string[];
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// Role-based permissions
export const TENANT_ROLE_PERMISSIONS = {
  owner: [
    'tenant:manage',
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'chatbots:create',
    'chatbots:read',
    'chatbots:update',
    'chatbots:delete',
    'analytics:read',
    'forms:create',
    'forms:read',
    'forms:update',
    'forms:delete',
    'leads:read',
    'leads:export',
    'settings:read',
    'settings:update',
    'billing:read',
    'billing:update'
  ],
  admin: [
    'users:create',
    'users:read',
    'users:update',
    'chatbots:create',
    'chatbots:read',
    'chatbots:update',
    'chatbots:delete',
    'analytics:read',
    'forms:create',
    'forms:read',
    'forms:update',
    'forms:delete',
    'leads:read',
    'leads:export',
    'settings:read',
    'settings:update'
  ],
  editor: [
    'chatbots:create',
    'chatbots:read',
    'chatbots:update',
    'forms:create',
    'forms:read',
    'forms:update',
    'leads:read',
    'analytics:read'
  ],
  viewer: [
    'chatbots:read',
    'forms:read',
    'leads:read',
    'analytics:read'
  ]
} as const;

export const SUPER_ADMIN_PERMISSIONS = [
  'super:tenant:create',
  'super:tenant:read',
  'super:tenant:update',
  'super:tenant:delete',
  'super:user:create',
  'super:user:read',
  'super:user:update',
  'super:user:delete',
  'super:analytics:read',
  'super:system:manage'
] as const;

export interface TenantInvitation {
  id: string;
  tenant_id: string;
  email: string;
  role: TenantUserRole;
  invited_by: string;
  expires_at: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
}

export interface CreateTenantRequest {
  name: string;
  subdomain: string;
  plan: Tenant['plan'];
  owner_name: string;
  owner_email: string;
  owner_password: string;
}

export interface TenantRegistration extends CreateTenantRequest {
  company_size: string;
  industry: string;
  use_case: string;
}
