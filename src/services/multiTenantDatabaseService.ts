import { MongoClient, Db } from 'mongodb';
import { Tenant, TenantUser, SuperAdmin } from '../types/tenant';
import { COUNTRIES } from '../constants/countries';
 
// Master database for tenant management
const MASTER_DB_URI = process.env.MASTER_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/fpt_chatbot_master';
const TENANT_DB_PREFIX = process.env.TENANT_DB_PREFIX || 'fpt_';
console.log("MASTER_DB_URI",MASTER_DB_URI);
console.log("TENANT_DB_PREFIX",TENANT_DB_PREFIX);
interface DatabaseConnection {
  client: MongoClient;
  db: Db;
  lastAccessed: number;
}

// Optimized MongoDB connection options for Atlas M0 tier
const MONGO_OPTIONS = {
  maxPoolSize: 5, // Reduced for multi-tenant (multiple DBs)
  minPoolSize: 1,
  maxIdleTimeMS: 60000, // 1 minute idle timeout
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
};

class MultiTenantDatabaseService {
  private static instance: MultiTenantDatabaseService;
  private masterClient: MongoClient | null = null;
  private masterDb: Db | null = null;
  private tenantConnections: Map<string, DatabaseConnection> = new Map();
  private readonly CONNECTION_TIMEOUT = 10 * 60 * 1000; // 10 minutes (reduced from 30)
  private readonly MAX_CONNECTIONS = 20; // Reduced from 50 for M0 tier

  private constructor() {
    // Clean up idle connections every 2 minutes (more aggressive)
    setInterval(() => this.cleanupIdleConnections(), 2 * 60 * 1000);

    // Log connection stats every 5 minutes
    setInterval(() => this.logConnectionStats(), 5 * 60 * 1000);
  }

  static getInstance(): MultiTenantDatabaseService {
    if (!MultiTenantDatabaseService.instance) {
      MultiTenantDatabaseService.instance = new MultiTenantDatabaseService();
    }
    return MultiTenantDatabaseService.instance;
  }

  /**
   * Connect to master database for tenant management
   */
  async connectToMaster(): Promise<Db> {
    if (!this.masterDb) {
      try {
        console.log('Connecting to master database...');
        this.masterClient = new MongoClient(MASTER_DB_URI, MONGO_OPTIONS);

        await this.masterClient.connect();
        this.masterDb = this.masterClient.db();
        console.log('Successfully connected to master database with optimized pooling');
      } catch (error) {
        console.error('Master database connection error:', error);
        throw new Error('Failed to connect to master database');
      }
    }
    return this.masterDb;
  }

  /**
   * Connect to a specific tenant's database
   */
  async connectToTenant(tenantId: string): Promise<Db> {
    const existing = this.tenantConnections.get(tenantId);

    if (existing) {
      existing.lastAccessed = Date.now();
      return existing.db;
    }

    try {
      // Get tenant info from master DB
      const masterDb = await this.connectToMaster();
      const tenant = await masterDb.collection('tenants').findOne({ id: tenantId });

      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      if (tenant.status !== 'active') {
        throw new Error(`Tenant ${tenantId} is not active`);
      }

      // Connect to tenant database
      const client = new MongoClient(tenant.database_uri, MONGO_OPTIONS);

      await client.connect();
      const db = client.db(tenant.database_name);

      // Store connection
      this.tenantConnections.set(tenantId, {
        client,
        db,
        lastAccessed: Date.now()
      });

      // Ensure indexes are created
      await this.ensureTenantIndexes(db);

      return db;

    } catch (error) {
      console.error(`Failed to connect to tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get tenant information by subdomain
   */
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    try {
      const masterDb = await this.connectToMaster();
      const tenant = await masterDb.collection<Tenant>('tenants')
        .findOne({ subdomain: subdomain.toLowerCase() });

      return tenant;
    } catch (error) {
      console.error('Error getting tenant by subdomain:', error);
      return null;
    }
  }

  /**
   * Get tenant information by custom domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    try {
      const masterDb = await this.connectToMaster();
      const tenant = await masterDb.collection<Tenant>('tenants')
        .findOne({ domain: domain.toLowerCase() });

      return tenant;
    } catch (error) {
      console.error('Error getting tenant by domain:', error);
      return null;
    }
  }

  /**
   * Create a new tenant with isolated database
   */
  async createTenant(tenantData: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>): Promise<Tenant> {
    try {
      const masterDb = await this.connectToMaster();

      // Generate unique tenant ID and database name
      const tenantId = `t_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const dbName = `${TENANT_DB_PREFIX}${tenantId}`;

      const tenant: Tenant = {
        ...tenantData,
        id: tenantId,
        database_name: dbName,
        database_uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        configKey: tenantData.configKey // Optional, can be set during creation
      };

      // Insert tenant into master database
      await masterDb.collection('tenants').insertOne(tenant);

      // Create and initialize tenant database
      await this.initializeTenantDatabase(tenantId);

      console.log(`Created new tenant: ${tenantId}`);
      return tenant;

    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Initialize a new tenant database with collections and indexes
   */
  private async initializeTenantDatabase(tenantId: string): Promise<void> {
    try {
      const db = await this.connectToTenant(tenantId);

      // Create collections with initial structure
      const collections = [
        'tenant_users',
        'chatbot_buttons',
        'chatbot_config',
        'custom_forms',
        'lead_interactions',
        'analytics_data',
        'invitations'
      ];

      for (const collectionName of collections) {
        try {
          await db.createCollection(collectionName);
        } catch (error: any) {
          // Ignore error if collection already exists
          if (!error.message.includes('already exists')) {
            console.warn(`Warning creating collection ${collectionName}:`, error.message);
          }
        }
      }

      await this.ensureTenantIndexes(db);

      // Seed default buttons
      await this.seedDefaultButtons(db);

      // Seed default "Contact Us" form
      await this.seedDefaultContactForm(db);

      console.log(`Initialized database for tenant: ${tenantId}`);
    } catch (error) {
      console.error(`Failed to initialize tenant database ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Seed default buttons for a tenant
   */
  private async seedDefaultButtons(db: Db): Promise<void> {
    try {
      const defaultButtons = [
        {
          id: 'btn_talk_to_human',
          label: 'Speak to Expert',
          type: 'cta',
          description: 'Connect users with human support agents',
          location: 'welcome_screen',
          action_type: 'expert_support',
          is_system_button: true,
          is_active: true,
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'btn_continue_ai',
          label: 'Continue with AI',
          type: 'cta',
          description: 'Start conversation with AI chatbot',
          location: 'welcome_screen',
          action_type: 'start_chat',
          is_system_button: true,
          is_active: true,
          order_index: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const buttonsCollection = db.collection('chatbot_buttons');

      for (const button of defaultButtons) {
        // Check if button already exists
        const existing = await buttonsCollection.findOne({ id: button.id });

        if (!existing) {
          await buttonsCollection.insertOne(button);
          console.log(`  ✅ Seeded default button: "${button.label}"`);
        } else {
          console.log(`  ⏭️  Default button "${button.label}" already exists`);
        }
      }
    } catch (error) {
      console.error('Error seeding default buttons:', error);
      // Don't throw - default buttons are optional
    }
  }

  /**
   * Seed default "Contact Us" form for a tenant
   */
  private async seedDefaultContactForm(db: Db): Promise<void> {
    try {
      const formId = 'form_default_contact_us';
      const formsCollection = db.collection('forms');

      // Check if form already exists
      const existingForm = await formsCollection.findOne({ id: formId });

      if (!existingForm) {
        // Create the default Contact Us form
        const contactForm = {
          id: formId,
          form_name: 'Contact Us',
          form_title: 'Contact Us',
          form_description: 'Please fill out the form below and we will get back to you as soon as possible.',
          description: 'Default contact form for lead capture',
          is_active: true,
          is_system_form: true,
          cta_button_text: 'Submit',
          cta_button_color: '#f37021',
          submit_button_text: 'Submit',
          submit_button_color: '#f37021',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const formInsertResult = await formsCollection.insertOne(contactForm);
        console.log(`  ✅ Seeded default form: "Contact Us"`);

        // Create form fields
        const fieldsCollection = db.collection('form_fields');
        const defaultFields = [
          {
            id: `${formInsertResult.insertedId.toString()}_field_name`,
            form_id: formInsertResult.insertedId.toString(),
            field_id: 'Name',
            field_name: 'Name',
            field_type: 'text',
            placeholder: 'Enter your full name',
            placement: 'full',
            is_required: true,
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${formInsertResult.insertedId.toString()}_field_company`,
            form_id: formInsertResult.insertedId.toString(),
            field_name: 'Company Name',
            field_id: 'Company',
            field_type: 'text',
            placeholder: 'Enter your company name',
            placement: 'full',
            is_required: true,
            order_index: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${formInsertResult.insertedId.toString()}_field_job_title`,
            form_id: formInsertResult.insertedId.toString(),
            field_name: 'Job Title',
            field_id: 'Job Title',
            field_type: 'text',
            placeholder: 'Enter your job title',
            placement: 'full',
            is_required: true,
            order_index: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${formInsertResult.insertedId.toString()}_field_country`,
            form_id: formInsertResult.insertedId.toString(),
            field_name: 'Country',
            field_id: 'Country',
            field_type: 'select',
            placeholder: 'Select your country',
            placement: 'full',
            is_required: true,
            order_index: 4,
            options: COUNTRIES,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${formInsertResult.insertedId.toString()}_field_email`,
            form_id: formInsertResult.insertedId.toString(),
            field_name: 'Email',
            field_id: 'Email',
            field_type: 'email',
            placeholder: 'Enter your email address',
            placement: 'full',
            is_required: true,
            order_index: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${formInsertResult.insertedId.toString()}_field_phone`,
            form_id: formInsertResult.insertedId.toString(),
            field_name: 'Phone',
            field_id: 'Phone',
            field_type: 'text',
            placeholder: 'Enter your phone number',
            placement: 'full',
            is_required: false,
            order_index: 6,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${formInsertResult.insertedId.toString()}_field_purpose`,
            form_id: formInsertResult.insertedId.toString(),
            field_name: 'Purpose',
            field_id: 'Purpose',
            field_type: 'select',
            placeholder: 'Select purpose of inquiry',
            placement: 'full',
            is_required: true,
            order_index: 7,
            options: ['General Inquiry', 'Product Demo', 'Pricing Information', 'Technical Support', 'Partnership', 'Other'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${formInsertResult.insertedId.toString()}_field_details`,
            form_id: formInsertResult.insertedId.toString(),
            field_name: 'Details',
            field_id: 'Details',
            field_type: 'textarea',
            placeholder: 'Please provide additional details about your inquiry',
            placement: 'full',
            is_required: true,
            order_index: 8,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        for (const field of defaultFields) {
          const existingField = await fieldsCollection.findOne({ id: field.id });
          if (!existingField) {
            await fieldsCollection.insertOne(field);
            console.log(`    ✅ Seeded form field: "${field.field_name}"`);
          }
        }

        // Connect "Speak to Expert" button to this form
        const buttonFormConnectionsCollection = db.collection('button_form_connections');
        const buttonId = 'btn_talk_to_human';
        const existingConnection = await buttonFormConnectionsCollection.findOne({ button_id: buttonId });

        if (!existingConnection) {
          await buttonFormConnectionsCollection.insertOne({
            button_id: buttonId,
            form_id: formId,
            created_at: new Date().toISOString()
          });
          console.log(`  ✅ Connected "Speak to Expert" button to "Contact Us" form`);
        } else {
          console.log(`  ⏭️  Button-form connection already exists`);
        }

      } else {
        console.log(`  ⏭️  Default form "Contact Us" already exists`);
      }
    } catch (error) {
      console.error('Error seeding default Contact Us form:', error);
      // Don't throw - default form is optional
    }
  }

  /**
   * Ensure proper indexes exist in tenant database
   */
  private async ensureTenantIndexes(db: Db): Promise<void> {
    try {
      // User indexes
      await db.collection('tenant_users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { tenant_id: 1 } },
        { key: { status: 1 } },
        { key: { role: 1 } }
      ]);

      // Lead interaction indexes
      await db.collection('lead_interactions').createIndexes([
        { key: { session_id: 1 } },
        { key: { created_at: -1 } },
        { key: { form_data: 1 } }
      ]);

      // Analytics indexes
      await db.collection('analytics_data').createIndexes([
        { key: { date: -1 } },
        { key: { metric_type: 1 } }
      ]);

      // Form indexes
      await db.collection('custom_forms').createIndexes([
        { key: { is_active: 1 } },
        { key: { created_at: -1 } }
      ]);

      // Button indexes
      await db.collection('chatbot_buttons').createIndexes([
        { key: { is_active: 1 } },
        { key: { order_index: 1 } }
      ]);

      // Invitation indexes
      await db.collection('invitations').createIndexes([
        { key: { email: 1 } },
        { key: { token: 1 }, unique: true },
        { key: { expires_at: 1 } },
        { key: { status: 1 } }
      ]);

    } catch (error) {
      console.error('Error creating indexes:', error);
      // Don't throw - indexes are optional for basic functionality
    }
  }

  /**
   * Get collections for master database operations
   */
  async getMasterCollections() {
    const db = await this.connectToMaster();
    return {
      tenants: db.collection<Tenant>('tenants'),
      superAdmins: db.collection<SuperAdmin>('super_admins'),
      systemSettings: db.collection('system_settings')
    };
  }

  /**
   * Get collections for tenant database operations
   */
  async getTenantCollections(tenantId: string) {
    const db = await this.connectToTenant(tenantId);
    return {
      users: db.collection<TenantUser>('team_members'),
      tenant_users: db.collection('team_members'),
      buttons: db.collection('chatbot_buttons'),
      config: db.collection('chatbot_config'),
      forms: db.collection('custom_forms'),
      leads: db.collection('leads'),
      analytics: db.collection('analytics_data'),
      invitations: db.collection('invitations')
    };
  }

  /**
   * Clean up idle database connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const connectionsToClose: string[] = [];

    for (const [tenantId, connection] of this.tenantConnections) {
      if (now - connection.lastAccessed > this.CONNECTION_TIMEOUT) {
        connectionsToClose.push(tenantId);
      }
    }

    // Close idle connections
    connectionsToClose.forEach(async (tenantId) => {
      const connection = this.tenantConnections.get(tenantId);
      if (connection) {
        try {
          await connection.client.close();
          this.tenantConnections.delete(tenantId);
          console.log(`Closed idle connection for tenant: ${tenantId}`);
        } catch (error) {
          console.error(`Error closing connection for tenant ${tenantId}:`, error);
        }
      }
    });

    // If we still have too many connections, close the oldest ones
    if (this.tenantConnections.size > this.MAX_CONNECTIONS) {
      const sorted = Array.from(this.tenantConnections.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      const toClose = sorted.slice(0, this.tenantConnections.size - this.MAX_CONNECTIONS);
      toClose.forEach(async ([tenantId, connection]) => {
        try {
          await connection.client.close();
          this.tenantConnections.delete(tenantId);
          console.log(`Closed excess connection for tenant: ${tenantId}`);
        } catch (error) {
          console.error(`Error closing excess connection for tenant ${tenantId}:`, error);
        }
      });
    }
  }

  /**
   * Log connection statistics for monitoring
   */
  private logConnectionStats(): void {
    const stats = {
      totalTenantConnections: this.tenantConnections.size,
      maxConnections: this.MAX_CONNECTIONS,
      masterConnected: !!this.masterDb,
      timestamp: new Date().toISOString()
    };

    console.log('📊 MongoDB Connection Stats:', JSON.stringify(stats));

    // Warn if approaching limits
    if (this.tenantConnections.size > this.MAX_CONNECTIONS * 0.8) {
      console.warn(`⚠️  WARNING: Tenant connections (${this.tenantConnections.size}) approaching limit (${this.MAX_CONNECTIONS})`);
    }
  }

  /**
   * Close all database connections
   */
  async closeAllConnections(): Promise<void> {
    try {
      // Close master connection
      if (this.masterClient) {
        await this.masterClient.close();
        this.masterClient = null;
        this.masterDb = null;
      }

      // Close all tenant connections
      for (const [tenantId, connection] of this.tenantConnections) {
        try {
          await connection.client.close();
        } catch (error) {
          console.error(`Error closing connection for tenant ${tenantId}:`, error);
        }
      }
      this.tenantConnections.clear();

      console.log('All database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
  }
}

export const multiTenantDB = MultiTenantDatabaseService.getInstance();
export default multiTenantDB;
