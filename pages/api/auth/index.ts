import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth, withErrorHandling, compose } from '../../../src/middleware/auth';
import AuthService from '../../../src/services/authService';
import TenantService from '../../../src/services/tenantService';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await handleVerifyToken(req, res);
    case 'DELETE':
      return await handleLogout(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Main handler that routes requests based on authentication needs
async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    // Login doesn't require authentication
    return await handleLogin(req as AuthenticatedRequest, res);
  } else {
    // For GET (verify) and DELETE (logout), we need authentication
    const authenticatedHandler = compose(withErrorHandling, withAuth)(handler);
    return authenticatedHandler(req, res);
  }
}

/**
 * Handle user login (tenant users and super admins)
 */
async function handleLogin(req: AuthenticatedRequest, res: NextApiResponse) {
  const { email, password, subdomain, type = 'tenant' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    if (type === 'super-admin') {
      const { user, token } = await AuthService.loginSuperAdmin({ email, password });
      
      // Set HTTP-only cookie
      res.setHeader('Set-Cookie', `authToken=${token.token}; Path=/; HttpOnly; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} Max-Age=${7 * 24 * 60 * 60}`);
      
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          isSuperAdmin: user.isSuperAdmin
        },
        token: token.token,
        expiresAt: token.expiresAt
      });

    } else {
      // Tenant user login
      if (!subdomain) {
        return res.status(400).json({ error: 'Subdomain is required for tenant login' });
      }

      const tenant = await TenantService.getTenantBySubdomain(subdomain);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      if (tenant.status !== 'active') {
        return res.status(403).json({ error: 'Tenant is not active' });
      }

      const { user, token } = await AuthService.loginTenantUser({
        email,
        password,
        tenantId: tenant.id
      });

      // Set HTTP-only cookie
      res.setHeader('Set-Cookie', `authToken=${token.token}; Path=/; HttpOnly; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} Max-Age=${7 * 24 * 60 * 60}`);

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          permissions: user.permissions,
          isSuperAdmin: false
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          plan: tenant.plan,
          status: tenant.status
        },
        token: token.token,
        expiresAt: token.expiresAt
      });
    }

  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(401).json({ error: error.message || 'Login failed' });
  }
}

/**
 * Handle token verification
 */
async function handleVerifyToken(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user!;
  
  if (user.isSuperAdmin) {
    return res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        isSuperAdmin: true
      }
    });
  } else {
    // Get tenant info for regular users
    try {
      const tenant = await TenantService.getTenantBySubdomain(''); // This should be improved
      
      return res.status(200).json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          permissions: user.permissions,
          isSuperAdmin: false
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          plan: tenant.plan,
          status: tenant.status
        } : null
      });
    } catch (error) {
      return res.status(200).json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          permissions: user.permissions,
          isSuperAdmin: false
        }
      });
    }
  }
}

/**
 * Handle logout
 */
async function handleLogout(req: AuthenticatedRequest, res: NextApiResponse) {
  // Clear the auth cookie
  res.setHeader('Set-Cookie', 'authToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

export default withErrorHandling(mainHandler);
