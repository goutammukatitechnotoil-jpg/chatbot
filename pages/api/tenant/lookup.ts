import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling, withCors, compose } from '../../../src/middleware/auth';
import TenantService from '../../../src/services/tenantService';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subdomain, domain } = req.query;

  if (!subdomain && !domain) {
    return res.status(400).json({ error: 'Subdomain or domain is required' });
  }

  try {
    let tenant;

    if (subdomain) {
      tenant = await TenantService.getTenantBySubdomain(subdomain as string);
    } else if (domain) {
      tenant = await TenantService.getTenantByDomain(domain as string);
    }

    if (!tenant) {
      return res.status(404).json({ 
        error: 'Tenant not found',
        tenant: null 
      });
    }

    // Return only safe tenant information
    return res.status(200).json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        domain: tenant.domain,
        plan: tenant.plan,
        status: tenant.status,
        settings: {
          custom_branding: tenant.settings.custom_branding,
          // Only include public settings
        }
      }
    });

  } catch (error: any) {
    console.error('Tenant lookup error:', error);
    return res.status(500).json({ 
      error: 'Failed to lookup tenant',
      tenant: null 
    });
  }
}

export default compose(
  withCors,
  withErrorHandling
)(handler);
