import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withSuperAdmin, withErrorHandling, withRateLimit, compose } from '../../../src/middleware/auth';
import TenantService from '../../../src/services/tenantService';
import AuthService from '../../../src/services/authService';
import { CreateTenantRequest, TenantRegistration } from '../../../src/types/tenant';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await handleGetTenants(req, res);
    case 'POST':
      return await handleCreateTenant(req, res);
    case 'PUT':
      return await handleUpdateTenant(req, res);
    case 'DELETE':
      return await handleDeleteTenant(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get all tenants (super admin only)
 */
async function handleGetTenants(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const status = req.query.status as string;
    
    const result = await TenantService.getAllTenants(page, pageSize);
    
    let filteredTenants = result.tenants;
    if (status && status !== 'all') {
      filteredTenants = result.tenants.filter(tenant => tenant.status === status);
    }
    
    return res.status(200).json({
      success: true,
      tenants: filteredTenants,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: result.totalPages
      }
    });

  } catch (error: any) {
    console.error('Error getting tenants:', error);
    return res.status(500).json({ error: 'Failed to retrieve tenants' });
  }
}

/**
 * Create new tenant (super admin only)
 */
async function handleCreateTenant(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const tenantData: CreateTenantRequest = req.body;
    
    // Validate required fields
    if (!tenantData.name || !tenantData.subdomain || !tenantData.plan || 
        !tenantData.owner_name || !tenantData.owner_email || !tenantData.owner_password) {
      return res.status(400).json({ 
        error: 'All fields are required: name, subdomain, plan, owner_name, owner_email, owner_password' 
      });
    }

    // Validate subdomain format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(tenantData.subdomain) || 
        tenantData.subdomain.length < 3 || 
        tenantData.subdomain.length > 63) {
      return res.status(400).json({ 
        error: 'Invalid subdomain format. Must be 3-63 characters, alphanumeric and hyphens only.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tenantData.owner_email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate plan
    if (!['starter', 'professional', 'enterprise'].includes(tenantData.plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be starter, professional, or enterprise.' });
    }

    // Check subdomain uniqueness
    const existingTenant = await TenantService.getTenantBySubdomain(tenantData.subdomain);
    if (existingTenant) {
      return res.status(409).json({ error: 'Subdomain already exists' });
    }

    const tenant = await TenantService.createTenant(tenantData);

    // Create owner user
    await AuthService.createTenantUser(tenant.id, {
      name: tenantData.owner_name,
      email: tenantData.owner_email,
      password: tenantData.owner_password,
      role: 'admin',
      status: 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        plan: tenant.plan,
        status: tenant.status,
        created_at: tenant.created_at
      }
    });

  } catch (error: any) {
    console.error('Error creating tenant:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to create tenant' });
  }
}

/**
 * Update tenant (super admin only)
 */
async function handleUpdateTenant(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { tenantId, ...updateData } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Validate status if provided
    if (updateData.status && !['active', 'suspended', 'pending', 'cancelled'].includes(updateData.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Validate plan if provided
    if (updateData.plan && !['starter', 'professional', 'enterprise'].includes(updateData.plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Get existing tenant
    const existingTenant = await TenantService.getTenantById(tenantId);
    if (!existingTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Check subdomain uniqueness if changing
    if (updateData.subdomain && updateData.subdomain !== existingTenant.subdomain) {
      const subdomainExists = await TenantService.getTenantBySubdomain(updateData.subdomain);
      if (subdomainExists) {
        return res.status(409).json({ error: 'Subdomain already exists' });
      }
    }

    // Update tenant (configKey can be included in updateData)
    const updatedTenant = await TenantService.updateTenant(tenantId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });

  } catch (error: any) {
    console.error('Error updating tenant:', error);
    return res.status(500).json({ error: error.message || 'Failed to update tenant' });
  }
}

/**
 * Delete tenant (super admin only)
 */
async function handleDeleteTenant(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { tenantId } = req.query;
    
    if (!tenantId || typeof tenantId !== 'string') {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Check if tenant exists
    const tenant = await TenantService.getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Delete tenant (this will also handle cleanup of tenant database and users)
    await TenantService.deleteTenant(tenantId);

    return res.status(200).json({
      success: true,
      message: 'Tenant deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting tenant:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete tenant' });
  }
}

export default compose(
  withErrorHandling,
  withRateLimit(10, 60000), // 10 requests per minute for tenant creation
  withSuperAdmin
)(handler);
