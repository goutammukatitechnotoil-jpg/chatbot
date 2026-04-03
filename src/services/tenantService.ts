import { multiTenantDB } from './multiTenantDatabaseService';
import AuthService from './authService';
import { Tenant, CreateTenantRequest, TenantRegistration, TenantUser, TenantInvitation } from '../types/tenant';

class TenantService {
  /**
   * Register a new tenant (self-service signup)
   */
  static async registerTenant(registrationData: TenantRegistration): Promise<{ tenant: Tenant; owner: TenantUser; token: string }> {
    try {
      // Validate subdomain uniqueness
      const existingTenant = await multiTenantDB.getTenantBySubdomain(registrationData.subdomain);
      if (existingTenant) {
        throw new Error('Subdomain already exists');
      }

      // Validate subdomain format
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(registrationData.subdomain) || 
          registrationData.subdomain.length < 3 || 
          registrationData.subdomain.length > 63) {
        throw new Error('Invalid subdomain format');
      }

      // Create tenant
      const tenant = await this.createTenant({
        name: registrationData.name,
        subdomain: registrationData.subdomain,
        plan: registrationData.plan,
        owner_name: registrationData.owner_name,
        owner_email: registrationData.owner_email,
        owner_password: registrationData.owner_password
      });

      // Create owner user
      const owner = await AuthService.createTenantUser(tenant.id, {
        name: registrationData.owner_name,
        email: registrationData.owner_email,
        password: registrationData.owner_password,
        role: 'owner',
        status: 'active'
      });

      // Generate auth token for owner
      const { token } = await AuthService.loginTenantUser({
        email: registrationData.owner_email,
        password: registrationData.owner_password,
        tenantId: tenant.id
      });

      return { tenant, owner, token: token.token };

    } catch (error) {
      console.error('Tenant registration error:', error);
      throw error;
    }
  }

  /**
   * Create a new tenant (admin function)
   */
  static async createTenant(tenantData: CreateTenantRequest): Promise<Tenant> {
    try {
      // Set default settings based on plan
      const planSettings = this.getPlanSettings(tenantData.plan);
      
      const tenant = await multiTenantDB.createTenant({
        name: tenantData.name,
        subdomain: tenantData.subdomain.toLowerCase(),
        database_name: '', // Will be set by createTenant method
        database_uri: '', // Will be set by createTenant method
        plan: tenantData.plan,
        status: 'active',
        settings: planSettings,
        billing: {
          plan_price: this.getPlanPrice(tenantData.plan),
          billing_cycle: 'monthly',
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_trial: true,
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        created_by: tenantData.owner_email
      });

      return tenant;

    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant by subdomain
   */
  static async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    return await multiTenantDB.getTenantBySubdomain(subdomain);
  }

  /**
   * Get tenant by domain
   */
  static async getTenantByDomain(domain: string): Promise<Tenant | null> {
    return await multiTenantDB.getTenantByDomain(domain);
  }

  /**
   * Get tenant by ID
   */
  static async getTenantById(tenantId: string): Promise<Tenant | null> {
    try {
      const { tenants } = await multiTenantDB.getMasterCollections();
      const tenant = await tenants.findOne({ id: tenantId });
      return tenant as Tenant | null;
    } catch (error) {
      console.error('Error getting tenant by ID:', error);
      throw error;
    }
  }

  /**
   * Get all tenants (super admin function)
   */
  static async getAllTenants(page: number = 1, pageSize: number = 50): Promise<{
    tenants: Tenant[];
    total: number;
    totalPages: number;
  }> {
    try {
      const { tenants: tenantsCollection } = await multiTenantDB.getMasterCollections();
      
      const skip = (page - 1) * pageSize;
      const [tenants, total] = await Promise.all([
        tenantsCollection.find({}).skip(skip).limit(pageSize).sort({ created_at: -1 }).toArray(),
        tenantsCollection.countDocuments({})
      ]);

      return {
        tenants: tenants as Tenant[],
        total,
        totalPages: Math.ceil(total / pageSize)
      };

    } catch (error) {
      console.error('Error getting all tenants:', error);
      throw error;
    }
  }

  /**
   * Update tenant
   */
  static async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    try {
      const { tenants } = await multiTenantDB.getMasterCollections();
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const result = await tenants.findOneAndUpdate(
        { id: tenantId },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Tenant not found');
      }

      return result as Tenant;

    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  /**
   * Delete tenant (soft delete)
   */
  static async deleteTenant(tenantId: string): Promise<void> {
    try {
      const { tenants } = await multiTenantDB.getMasterCollections();
      
      await tenants.updateOne(
        { id: tenantId },
        { 
          $set: { 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          } 
        }
      );

    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant users
   */
  static async getTenantUsers(tenantId: string, page: number = 1, pageSize: number = 50): Promise<{
    users: TenantUser[];
    total: number;
    totalPages: number;
  }> {
    try {
      const { users } = await multiTenantDB.getTenantCollections(tenantId);
      
      const skip = (page - 1) * pageSize;
      const [usersList, total] = await Promise.all([
        users.find({}).skip(skip).limit(pageSize).sort({ created_at: -1 }).toArray(),
        users.countDocuments({})
      ]);

      // Remove password hashes from response
      const safeUsers = usersList.map(user => {
        const { password_hash, ...safeUser } = user;
        return { ...safeUser, password_hash: '' } as TenantUser;
      });

      return {
        users: safeUsers,
        total,
        totalPages: Math.ceil(total / pageSize)
      };

    } catch (error) {
      console.error('Error getting tenant users:', error);
      throw error;
    }
  }

  /**
   * Invite user to tenant
   */
  static async inviteUser(tenantId: string, inviterUserId: string, email: string, role: TenantUser['role']): Promise<TenantInvitation> {
    try {
      const { users, invitations } = await multiTenantDB.getTenantCollections(tenantId);
      
      // Check if user already exists
      const existingUser = await users.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error('User already exists in this tenant');
      }

      // Check for pending invitation
      const existingInvitation = await invitations.findOne({ 
        email: email.toLowerCase(), 
        status: 'pending' 
      });
      if (existingInvitation) {
        throw new Error('Invitation already sent to this email');
      }

      // Create invitation
      const invitationId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const invitation: TenantInvitation = {
        id: invitationId,
        tenant_id: tenantId,
        email: email.toLowerCase(),
        role,
        invited_by: inviterUserId,
        expires_at: expiresAt,
        token,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await invitations.insertOne(invitation);

      // TODO: Send email invitation here
      console.log('Invitation created:', invitation);

      return invitation;

    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  }

  /**
   * Accept invitation and create user
   */
  static async acceptInvitation(token: string, userData: { name: string; password: string }): Promise<{ tenant: Tenant; user: TenantUser; authToken: string }> {
    try {
      // Find invitation across all tenants
      const masterDb = await multiTenantDB.connectToMaster();
      const tenants = await masterDb.collection<Tenant>('tenants').find({ status: 'active' }).toArray();
      
      let invitation: TenantInvitation | null = null;
      let tenant: Tenant | null = null;

      for (const t of tenants) {
        try {
          const { invitations } = await multiTenantDB.getTenantCollections(t.id);
          invitation = await invitations.findOne({ token, status: 'pending' }) as TenantInvitation | null;
          if (invitation) {
            tenant = t;
            break;
          }
        } catch (error) {
          console.warn(`Error checking invitations for tenant ${t.id}:`, error);
        }
      }

      if (!invitation || !tenant) {
        throw new Error('Invalid or expired invitation');
      }

      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Create user
      const user = await AuthService.createTenantUser(tenant.id, {
        name: userData.name,
        email: invitation.email,
        password: userData.password,
        role: invitation.role,
        status: 'active',
        created_by: invitation.invited_by
      });

      // Mark invitation as accepted
      const { invitations } = await multiTenantDB.getTenantCollections(tenant.id);
      await invitations.updateOne(
        { id: invitation.id },
        { $set: { status: 'accepted' } }
      );

      // Generate auth token
      const { token: authToken } = await AuthService.loginTenantUser({
        email: invitation.email,
        password: userData.password,
        tenantId: tenant.id
      });

      return { tenant, user, authToken: authToken.token };

    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  /**
   * Get plan settings based on plan type
   */
  private static getPlanSettings(plan: Tenant['plan']) {
    const settings = {
      starter: {
        max_users: 3,
        max_chatbots: 1,
        max_sessions_per_month: 1000,
        custom_branding: false,
        api_access: false,
        analytics_retention_days: 30,
        storage_limit_gb: 1,
        allowed_domains: []
      },
      professional: {
        max_users: 10,
        max_chatbots: 5,
        max_sessions_per_month: 10000,
        custom_branding: true,
        api_access: true,
        analytics_retention_days: 90,
        storage_limit_gb: 10,
        allowed_domains: []
      },
      enterprise: {
        max_users: 50,
        max_chatbots: 25,
        max_sessions_per_month: 100000,
        custom_branding: true,
        api_access: true,
        analytics_retention_days: 365,
        storage_limit_gb: 100,
        allowed_domains: []
      }
    };

    return settings[plan];
  }

  /**
   * Get plan price
   */
  private static getPlanPrice(plan: Tenant['plan']): number {
    const prices = {
      starter: 29,
      professional: 99,
      enterprise: 299
    };

    return prices[plan];
  }
}

export default TenantService;
