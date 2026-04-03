import { connectToDatabase } from '../../lib/mongodb';
import { multiTenantDB } from '../services/multiTenantDatabaseService';
import AuthService from '../services/authService';
import { SuperAdmin, Tenant, TenantUser } from '../types/tenant';

class MigrationService {
  /**
   * Migrate existing single-tenant database to multi-tenant architecture
   */
  static async migrateToMultiTenant(): Promise<void> {
    try {
      console.log('Starting migration to multi-tenant architecture...');

      // Step 1: Connect to existing database
      const legacyDb = await connectToDatabase();
      if (!legacyDb) {
        throw new Error('Cannot connect to legacy database');
      }

      // Step 2: Create super admin user if not exists
      await this.createInitialSuperAdmin();

      // Step 3: Create default tenant from existing data
      const defaultTenant = await this.createDefaultTenant(legacyDb);

      // Step 4: Migrate existing team members to tenant users
      await this.migrateTenantUsers(legacyDb, defaultTenant.id);

      // Step 5: Migrate existing data to tenant database
      await this.migrateExistingData(legacyDb, defaultTenant.id);

      console.log('Migration completed successfully!');

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create initial super admin user
   */
  private static async createInitialSuperAdmin(): Promise<SuperAdmin> {
    try {
      const { superAdmins } = await multiTenantDB.getMasterCollections();
      
      // Check if super admin already exists
      const existingAdmin = await superAdmins.findOne({ role: 'super_admin' });
      if (existingAdmin) {
        console.log('Super admin already exists');
        return existingAdmin as SuperAdmin;
      }

      // Create default super admin
      const superAdmin = await AuthService.createSuperAdmin({
        name: 'Super Administrator',
        email: process.env.SUPER_ADMIN_EMAIL || 'admin@fptchatbot.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!',
        role: 'super_admin',
        status: 'active'
      });

      console.log('Created initial super admin:', superAdmin.email);
      return superAdmin;

    } catch (error) {
      console.error('Error creating super admin:', error);
      throw error;
    }
  }

  /**
   * Create default tenant from existing data
   */
  private static async createDefaultTenant(legacyDb: any): Promise<Tenant> {
    try {
      const { tenants } = await multiTenantDB.getMasterCollections();
      
      // Check if default tenant already exists
      const existingTenant = await tenants.findOne({ subdomain: 'default' });
      if (existingTenant) {
        console.log('Default tenant already exists');
        return existingTenant as Tenant;
      }

      // Get first admin user from legacy database to use as owner
      const legacyUsers = legacyDb.collection('team_members');
      const adminUser = await legacyUsers.findOne({ role: 'admin' }) || 
                       await legacyUsers.findOne({}) ||
                       { name: 'Default Owner', email: 'owner@company.com' };

      const tenant = await multiTenantDB.createTenant({
        name: process.env.DEFAULT_TENANT_NAME || 'Default Company',
        subdomain: 'default',
        database_name: '', // Will be set by createTenant
        database_uri: '', // Will be set by createTenant
        plan: 'professional',
        status: 'active',
        settings: {
          max_users: 50,
          max_chatbots: 10,
          max_sessions_per_month: 50000,
          custom_branding: true,
          api_access: true,
          analytics_retention_days: 365,
          storage_limit_gb: 50,
          allowed_domains: []
        },
        billing: {
          plan_price: 99,
          billing_cycle: 'monthly',
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_trial: false
        },
        created_by: adminUser.email
      });

      console.log('Created default tenant:', tenant.subdomain);
      return tenant;

    } catch (error) {
      console.error('Error creating default tenant:', error);
      throw error;
    }
  }

  /**
   * Migrate existing team members to tenant users
   */
  private static async migrateTenantUsers(legacyDb: any, tenantId: string): Promise<void> {
    try {
      const legacyUsers = legacyDb.collection('team_members');
      const users = await legacyUsers.find({}).toArray();
      
      if (users.length === 0) {
        console.log('No legacy users found to migrate');
        return;
      }

      const { users: tenantUsersCollection } = await multiTenantDB.getTenantCollections(tenantId);

      for (const user of users) {
        try {
          // Map legacy roles to new roles
          const roleMapping: Record<string, TenantUser['role']> = {
            'admin': 'owner',
            'editor': 'admin',
            'viewer': 'viewer'
          };

          const newUser: TenantUser = {
            id: user.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tenant_id: tenantId,
            name: user.name || 'Unknown User',
            email: user.email || `user${Date.now()}@example.com`,
            password_hash: user.password_hash || await AuthService.hashPassword('ChangeMe123!'),
            role: roleMapping[user.role] || 'viewer',
            status: user.status === 'active' ? 'active' : 'inactive',
            permissions: [], // Will be set based on role
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at || new Date().toISOString(),
            created_by: user.created_by
          };

          // Set permissions based on role
          const { TENANT_ROLE_PERMISSIONS } = await import('../types/tenant');
          newUser.permissions = [...TENANT_ROLE_PERMISSIONS[newUser.role]];

          await tenantUsersCollection.insertOne(newUser);
          console.log(`Migrated user: ${newUser.email}`);

        } catch (userError) {
          console.error(`Error migrating user ${user.email}:`, userError);
          // Continue with other users
        }
      }

      console.log(`Migrated ${users.length} users to tenant ${tenantId}`);

    } catch (error) {
      console.error('Error migrating tenant users:', error);
      throw error;
    }
  }

  /**
   * Migrate existing data to tenant database
   */
  private static async migrateExistingData(legacyDb: any, tenantId: string): Promise<void> {
    try {
      const collections = await multiTenantDB.getTenantCollections(tenantId);

      // Migrate chatbot buttons
      await this.migrateCollection(legacyDb, 'chatbot_buttons', collections.buttons);
      
      // Migrate chatbot config
      await this.migrateCollection(legacyDb, 'config', collections.config);
      
      // Migrate custom forms
      await this.migrateCollection(legacyDb, 'custom_forms', collections.forms);
      
      // Migrate lead interactions
      await this.migrateCollection(legacyDb, 'lead_interactions', collections.leads);
      
      // Migrate analytics data (if exists)
      await this.migrateCollection(legacyDb, 'analytics', collections.analytics);

      console.log(`Successfully migrated all data to tenant ${tenantId}`);

    } catch (error) {
      console.error('Error migrating existing data:', error);
      throw error;
    }
  }

  /**
   * Helper to migrate a collection
   */
  private static async migrateCollection(legacyDb: any, collectionName: string, targetCollection: any): Promise<void> {
    try {
      const legacyCollection = legacyDb.collection(collectionName);
      const documents = await legacyCollection.find({}).toArray();
      
      if (documents.length === 0) {
        console.log(`No documents found in ${collectionName}`);
        return;
      }

      // Insert documents into tenant database
      await targetCollection.insertMany(documents);
      console.log(`Migrated ${documents.length} documents from ${collectionName}`);

    } catch (error) {
      console.error(`Error migrating collection ${collectionName}:`, error);
      // Don't throw - continue with other collections
    }
  }

  /**
   * Create initial database setup for development
   */
  static async setupDevelopment(body: any): Promise<void> {
    try {
      console.log('Setting up development environment...', body);

      // Create super admin
      await this.createInitialSuperAdmin();

      // Create demo tenant
      const demoTenant = await multiTenantDB.createTenant({
        name: 'Demo Company',
        subdomain: 'demo',
        database_name: '', // Will be set by createTenant
        database_uri: '', // Will be set by createTenant
        plan: 'professional',
        status: 'active',
        settings: {
          max_users: 10,
          max_chatbots: 5,
          max_sessions_per_month: 10000,
          custom_branding: true,
          api_access: true,
          analytics_retention_days: 90,
          storage_limit_gb: 10,
          allowed_domains: []
        },
        billing: {
          plan_price: 99,
          billing_cycle: 'monthly',
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_trial: true,
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        created_by: 'system@fptchatbot.com'
      });

      // Create demo user
      await AuthService.createTenantUser(demoTenant.id, {
        name: 'Demo User',
        email: 'demo@company.com',
        password: 'Demo123!',
        role: 'owner',
        status: 'active'
      });

      console.log('Development environment setup completed!');
      console.log('Super Admin: admin@fptchatbot.com / SuperAdmin123!');
      console.log('Demo Tenant: demo.localhost:3000');
      console.log('Demo User: demo@company.com / Demo123!');

    } catch (error) {
      console.error('Development setup failed:', error);
      throw error;
    }
  }

  /**
   * Check if migration is needed
   */
  static async isMigrationNeeded(): Promise<boolean> {
    try {
      const { tenants } = await multiTenantDB.getMasterCollections();
      const tenantCount = await tenants.countDocuments();
      return tenantCount === 0;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return true;
    }
  }
}

export default MigrationService;
