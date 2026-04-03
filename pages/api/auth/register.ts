import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling, withRateLimit, withCors, compose } from '../../../src/middleware/auth';
import TenantService from '../../../src/services/tenantService';
import { TenantRegistration } from '../../../src/types/tenant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const registrationData: TenantRegistration = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'subdomain', 'plan', 'owner_name', 'owner_email', 'owner_password', 'company_size', 'industry', 'use_case'];
    const missingFields = requiredFields.filter(field => !registrationData[field as keyof TenantRegistration]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: missingFields 
      });
    }

    // Validate subdomain format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(registrationData.subdomain) || 
        registrationData.subdomain.length < 3 || 
        registrationData.subdomain.length > 63) {
      return res.status(400).json({ 
        error: 'Invalid subdomain format. Must be 3-63 characters, alphanumeric and hyphens only, and cannot start or end with a hyphen.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.owner_email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate plan
    if (!['starter', 'professional', 'enterprise'].includes(registrationData.plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be starter, professional, or enterprise.' });
    }

    // Validate password strength
    if (registrationData.owner_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check for reserved subdomains
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost', 'test', 'staging', 'dev'];
    if (reservedSubdomains.includes(registrationData.subdomain.toLowerCase())) {
      return res.status(400).json({ error: 'This subdomain is reserved and cannot be used' });
    }

    const result = await TenantService.registerTenant(registrationData);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Chatbot Platform.',
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
        plan: result.tenant.plan,
        status: result.tenant.status
      },
      user: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        role: result.owner.role
      },
      token: result.token,
      loginUrl: `https://${result.tenant.subdomain}.fptchatbot.com/login`
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
}

export default compose(
  withCors,
  withErrorHandling,
  withRateLimit(5, 3600000) // 5 registrations per hour per IP
)(handler);
