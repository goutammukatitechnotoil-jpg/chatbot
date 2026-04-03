import { SuperAdmin } from '../types/tenant';

export interface CreateSuperAdminRequest {
  name: string;
  email: string;
  password: string;
  role?: 'super_admin' | 'support';
}

export interface UpdateSuperAdminRequest {
  id: string;
  name?: string;
  email?: string;
  role?: 'super_admin' | 'support';
  status?: 'active' | 'inactive';
  password?: string;
}

class SuperAdminService {
  /**
   * Get all super admins
   */
  static async getSuperAdmins(): Promise<Omit<SuperAdmin, 'password_hash'>[]> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/super-admins', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch super admins');
      }

      const data = await response.json();
      return data.admins;
    } catch (error) {
      console.error('Error fetching super admins:', error);
      throw error;
    }
  }

  /**
   * Create new super admin
   */
  static async createSuperAdmin(
    adminData: CreateSuperAdminRequest
  ): Promise<Omit<SuperAdmin, 'password_hash'>> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/super-admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create super admin');
      }

      const data = await response.json();
      return data.admin;
    } catch (error) {
      console.error('Error creating super admin:', error);
      throw error;
    }
  }

  /**
   * Update super admin
   */
  static async updateSuperAdmin(
    adminData: UpdateSuperAdminRequest
  ): Promise<Omit<SuperAdmin, 'password_hash'>> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/super-admins', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update super admin');
      }

      const data = await response.json();
      return data.admin;
    } catch (error) {
      console.error('Error updating super admin:', error);
      throw error;
    }
  }

  /**
   * Delete super admin
   */
  static async deleteSuperAdmin(adminId: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/super-admins?id=${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete super admin');
      }
    } catch (error) {
      console.error('Error deleting super admin:', error);
      throw error;
    }
  }
}

export default SuperAdminService;
