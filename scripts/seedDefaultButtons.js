const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fpt_chatbot';
const TENANT_DB_PREFIX = process.env.TENANT_DB_PREFIX || 'fpt_';

const DEFAULT_BUTTONS = [
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

/**
 * Seed default buttons for a specific tenant
 */
async function seedDefaultButtonsForTenant(client, tenantId, dbName) {
  try {
    const db = client.db(dbName);
    console.log(`\n📍 Seeding default buttons for tenant: ${tenantId} (${dbName})`);
    
    let seededCount = 0;
    let skippedCount = 0;
    
    for (const button of DEFAULT_BUTTONS) {
      const existing = await db.collection('chatbot_buttons').findOne({ id: button.id });
      
      if (existing) {
        console.log(`  ⏭️  Button "${button.label}" already exists, skipping`);
        skippedCount++;
      } else {
        await db.collection('chatbot_buttons').insertOne(button);
        console.log(`  ✅ Seeded button: "${button.label}"`);
        seededCount++;
      }
    }
    
    console.log(`  📊 Result: ${seededCount} seeded, ${skippedCount} already existed`);
    return { seeded: seededCount, skipped: skippedCount };
    
  } catch (error) {
    console.error(`  ❌ Error seeding buttons for ${tenantId}:`, error.message);
    throw error;
  }
}

/**
 * Seed default buttons for all tenants
 */
async function seedDefaultButtonsForAllTenants() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    // Get master database
    const masterDb = client.db('fpt_chatbot_master');
    
    // Get all tenants
    const tenants = await masterDb.collection('tenants').find({ status: 'active' }).toArray();
    console.log(`\n📋 Found ${tenants.length} active tenants`);
    
    if (tenants.length === 0) {
      console.log('⚠️  No active tenants found. Nothing to do.');
      return;
    }
    
    let totalSeeded = 0;
    let totalSkipped = 0;
    let successCount = 0;
    let failureCount = 0;
    
    // Seed buttons for each tenant
    for (const tenant of tenants) {
      try {
        const result = await seedDefaultButtonsForTenant(client, tenant.id, tenant.database_name);
        totalSeeded += result.seeded;
        totalSkipped += result.skipped;
        successCount++;
      } catch (error) {
        console.error(`❌ Failed for tenant ${tenant.id}:`, error.message);
        failureCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tenants processed: ${tenants.length}`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${failureCount}`);
    console.log(`  📝 Buttons seeded: ${totalSeeded}`);
    console.log(`  ⏭️  Buttons already existed: ${totalSkipped}`);
    console.log('='.repeat(60));
    console.log('\n✨ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

/**
 * Export function to seed buttons for a single tenant (for new tenant creation)
 */
async function seedButtonsForNewTenant(tenantId, dbName) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const result = await seedDefaultButtonsForTenant(client, tenantId, dbName);
    return result;
  } catch (error) {
    console.error('Error seeding buttons for new tenant:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run if executed directly
if (require.main === module) {
  console.log('\n🚀 Starting Default Buttons Migration');
  console.log('This will add "Speak to Expert" and "Continue with AI" buttons to all tenants\n');
  
  seedDefaultButtonsForAllTenants()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDefaultButtonsForAllTenants,
  seedButtonsForNewTenant,
  DEFAULT_BUTTONS
};
