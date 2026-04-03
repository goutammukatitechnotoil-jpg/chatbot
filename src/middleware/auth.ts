import { NextApiRequest, NextApiResponse } from 'next';
import AuthService, { AuthUser } from '../../src/services/authService';
import { multiTenantDB } from '../../src/services/multiTenantDatabaseService';

// Extended request with tenant and user info
export interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthUser;
  tenant?: any;
  tenantDb?: any;
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = 
                   req.cookies.authToken ;
      
      if (!token) {
        return res.status(401).json({ error: 'No authentication token provided' });
      }

      const user = await AuthService.getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = user; 
      return handler(req, res);

    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

/**
 * Middleware to verify tenant access for tenant users
 */
export function withTenant(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const user = req.user!;
      
      // Super admins can access any tenant
      if (user.isSuperAdmin) {
        const tenantId = req.query.tenantId as string || req.headers['x-tenant-id'] as string;
        if (tenantId) {
          try {
            const tenantDb = await multiTenantDB.connectToTenant(tenantId);
            req.tenantDb = tenantDb;
            
            // Get tenant info
            const { tenants } = await multiTenantDB.getMasterCollections();
            const tenant = await tenants.findOne({ id: tenantId });
            req.tenant = tenant;
          } catch (error) {
            console.error('Tenant access error for super admin:', error);
            return res.status(404).json({ error: 'Tenant not found' });
          }
        }
        return handler(req, res);
      }

      // Regular users must belong to a tenant
      if (!user.tenantId) {
        return res.status(403).json({ error: 'Access denied: No tenant association' });
      }

      try {
        const tenantDb = await multiTenantDB.connectToTenant(user.tenantId);
        req.tenantDb = tenantDb;
        
        // Get tenant info
        const { tenants } = await multiTenantDB.getMasterCollections();
        const tenant = await tenants.findOne({ id: user.tenantId });
        
        if (!tenant || tenant.status !== 'active') {
          return res.status(403).json({ error: 'Tenant is not active' });
        }
        
        req.tenant = tenant;
        return handler(req, res);

      } catch (error) {
        console.error('Tenant access error:', error);
        return res.status(403).json({ error: 'Cannot access tenant data' });
      }

    } catch (error) {
      console.error('Tenant middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}

/**
 * Middleware to check specific permissions
 */
export function withPermission(requiredPermissions: string | string[]) {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  return function(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const user = req.user!;
      
      // Super admins have all permissions
      if (user.isSuperAdmin) {
        return handler(req, res);
      }

      // Check if user has any of the required permissions
      const hasPermission = permissions.some(permission => 
        AuthService.hasPermission(user, permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permissions,
          current: user.permissions
        });
      }

      return handler(req, res);
    });
  };
}

/**
 * Middleware for super admin only access
 */
export function withSuperAdmin(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user!;
    
    if (!user.isSuperAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    return handler(req, res);
  });
}

/**
 * Middleware for tenant owners only
 */
export function withTenantOwner(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return withTenant(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user!;
    
    if (!user.isSuperAdmin && user.role !== 'owner') {
      return res.status(403).json({ error: 'Tenant owner access required' });
    }

    return handler(req, res);
  });
}

/**
 * Rate limiting middleware (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return function(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientId = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
      const now = Date.now();
      
      const requestData = requestCounts.get(clientId as string);
      
      if (!requestData || now > requestData.resetTime) {
        requestCounts.set(clientId as string, { count: 1, resetTime: now + windowMs });
        return handler(req, res);
      }
      
      if (requestData.count >= maxRequests) {
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        });
      }
      
      requestData.count++;
      return handler(req, res);
    };
  };
}

/**
 * CORS middleware
 */
export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

/**
 * Error handling middleware
 */
export function withErrorHandling(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('validation')) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('unauthorized') || error.message.includes('permission')) {
          return res.status(403).json({ error: error.message });
        }
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Compose multiple middlewares
 */
export function compose(...middlewares: Function[]) {
  return function(handler: Function) {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
