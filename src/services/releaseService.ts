const API_BASE_URL = '/api';

export interface Release {
  _id: string;
  tenantId: string;
  draftId: string;
  draftName: string;
  releaseNotes?: string;
  published_at: string;
  published_by: string;
}

class ReleaseService {
  async getReleases(): Promise<Release[]> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // For super admins, add tenant ID header
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        const storedTenant = localStorage.getItem('currentTenant');
        if (storedUser && storedTenant) {
          try {
            const user = JSON.parse(storedUser);
            const tenant = JSON.parse(storedTenant);
            if (user.isSuperAdmin && tenant.id) {
              headers['x-tenant-id'] = tenant.id;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/releases`, {
        headers,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch releases: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch releases:', error);
      throw error;
    }
  }

  async createRelease(
    draftId: string,
    draftName: string,
    releaseNotes?: string
  ): Promise<Release> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // For super admins, add tenant ID header
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        const storedTenant = localStorage.getItem('currentTenant');
        if (storedUser && storedTenant) {
          try {
            const user = JSON.parse(storedUser);
            const tenant = JSON.parse(storedTenant);
            if (user.isSuperAdmin && tenant.id) {
              headers['x-tenant-id'] = tenant.id;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/releases`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          draftId,
          draftName,
          releaseNotes
        }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to create release: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create release:', error);
      throw error;
    }
  }
}

export const releaseService = new ReleaseService();