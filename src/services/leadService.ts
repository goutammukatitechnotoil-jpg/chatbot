import { LeadInteraction } from '../types/leads';

// Get tenant ID from localStorage or domain
function getTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  
  // First, try to get from logged-in user
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.tenantId) {
        console.log('📍 Tenant ID from user:', user.tenantId);
        return user.tenantId;
      }
    }
  } catch (error) {
    console.error('Error getting tenant ID from user:', error);
  }
  
  // If no user, try to get from domain/subdomain
  try {
    const hostname = window.location.hostname;
    console.log('🌐 Current hostname:', hostname);
    
    // For localhost development, try to get from URL params or use default
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      if (tenantParam) {
        console.log('📍 Tenant ID from URL param:', tenantParam);
        return tenantParam;
      }
      
      // Try localStorage for tenant from config
      const storedTenant = localStorage.getItem('currentTenant');
      if (storedTenant) {
        const tenant = JSON.parse(storedTenant);
        if (tenant.id) {
          console.log('📍 Tenant ID from stored tenant:', tenant.id);
          return tenant.id;
        }
      }
      
      console.warn('⚠️ No tenant ID found for localhost - using domain as fallback');
      return 'localhost';
    }
    
    // For custom domains like fpteu.fptchatbot.com
    // Extract tenant ID from subdomain or use full domain
    if (hostname.includes('.')) {
      const parts = hostname.split('.');
      
      // If it's a subdomain like fpteu.fptchatbot.com
      if (parts.length >= 2) {
        const subdomain = parts[0];
        console.log('📍 Tenant ID from subdomain:', subdomain);
        
        // Store for future use
        localStorage.setItem('detectedTenantId', subdomain);
        
        return subdomain;
      }
    }
    
    // Use full hostname as tenant ID
    console.log('📍 Tenant ID from hostname:', hostname);
    localStorage.setItem('detectedTenantId', hostname);
    return hostname;
    
  } catch (error) {
    console.error('Error getting tenant ID from domain:', error);
  }
  
  // Last resort: check if we stored a detected tenant ID before
  try {
    const detectedTenantId = localStorage.getItem('detectedTenantId');
    if (detectedTenantId) {
      console.log('📍 Tenant ID from cache:', detectedTenantId);
      return detectedTenantId;
    }
  } catch (error) {
    console.error('Error getting cached tenant ID:', error);
  }
  
  console.error('❌ Unable to determine tenant ID from any source');
  return null;
}

// Safe JSON parsing helper
async function safeJsonParse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response:', text);
    if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error('Received HTML instead of JSON - likely a server error or routing issue');
    }
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
  }
}

export const leadService = {
  async getLeads(): Promise<LeadInteraction[]> {
    try {
      // Add cache-busting parameters - timestamp + random to ensure completely unique URLs
      const timestamp = new Date().getTime();
      const random = Math.random().toString(36).substring(7);
      const response = await fetch(`/api/lead?_t=${timestamp}&_r=${random}`, {
        method: 'GET',
        cache: 'reload', // Force reload from server, bypass ALL caches
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      // Log for debugging
      console.log('[LeadService] Fetched leads at:', new Date().toISOString(), 'URL:', response.url);
      console.log('[LeadService] Response headers:', {
        cacheControl: response.headers.get('cache-control'),
        pragma: response.headers.get('pragma'),
        expires: response.headers.get('expires'),
      });
      
      const result = await safeJsonParse(response);
      console.log('[LeadService] Received', result.data?.length || 0, 'leads');
      return result.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  },

  async getLeadBySessionId(sessionId: string): Promise<LeadInteraction | null> {
    try {
      const response = await fetch(`/api/lead?sessionId=${sessionId}`);
      const result = await safeJsonParse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching lead by session ID:', error);
      return null;
    }
  },

  async getLeadById(id: string): Promise<LeadInteraction | null> {
    try {
      const response = await fetch(`/api/lead/${id}`);
      const result = await safeJsonParse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching lead by ID:', error);
      return null;
    }
  },

  async searchLeads(query: string): Promise<LeadInteraction[]> {
    try {
      const response = await fetch(`/api/lead?search=${encodeURIComponent(query)}`);
      const result = await safeJsonParse(response);
      return result.data;
    } catch (error) {
      console.error('Error searching leads:', error);
      return [];
    }
  },

  async filterLeadsByDateRange(startDate: string, endDate: string): Promise<LeadInteraction[]> {
    try {
      const response = await fetch(`/api/lead?startDate=${startDate}&endDate=${endDate}`);
      const result = await safeJsonParse(response);
      return result.data;
    } catch (error) {
      console.error('Error filtering leads by date range:', error);
      return [];
    }
  },

  async exportLeads(): Promise<string> {
    try {
      const response = await fetch('/api/lead/export');
      return await response.text();
    } catch (error) {
      console.error('Error exporting leads:', error);
      return '';
    }
  },

  async createOrUpdateSession(sessionId: string, message?: string, sender?: 'user' | 'bot', sources?: any[], attachments?: any[], sessionInfo?: any): Promise<boolean> {
    try {
      const tenantId = getTenantId();
      
      if (!tenantId) {
        console.warn('⚠️ No tenant ID found - cannot create/update session');
        return false;
      }

      console.log('📝 Creating/updating session:', { sessionId, tenantId, message: message?.substring(0, 50) });

      const response = await fetch(`/api/lead/session?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message,
          sender,
          sources,
          attachments,
          session_info: sessionInfo
        }),
      });

      if (!response.ok) {
        console.error('❌ Session create/update failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        return false;
      }

      const result = await safeJsonParse(response);
      console.log('✅ Session created/updated successfully:', result.action);
      return result.success;
    } catch (error) {
      console.error('❌ Error creating/updating session:', error);
      return false;
    }
  },

  async updateSessionFormData(sessionId: string, formData: Record<string, any>): Promise<boolean> {
    try {
      const tenantId = getTenantId();
      
      if (!tenantId) {
        console.warn('⚠️ No tenant ID found - cannot update session form data');
        return false;
      }

      console.log('📝 Updating session form data:', { sessionId, tenantId });

      const response = await fetch(`/api/lead/session?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          form_data: formData
        }),
      });

      if (!response.ok) {
        console.error('❌ Session form data update failed:', response.status, response.statusText);
        return false;
      }

      const result = await safeJsonParse(response);
      console.log('✅ Session form data updated successfully');
      return result.success;
    } catch (error) {
      console.error('❌ Error updating session form data:', error);
      return false;
    }
  },
};
