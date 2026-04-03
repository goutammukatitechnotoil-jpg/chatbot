/**
 * Migration Script: Seed Default "Contact Us" Form for All Existing Tenants
 * 
 * This script adds a default "Contact Us" form with 8 fields to all existing tenants.
 * It also connects the "Speak to Expert" button to this form.
 * 
 * Usage: node scripts/seedDefaultContactForm.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MASTER_DB_URI = process.env.MASTER_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/fpt_chatbot_master';

// Default form configuration
const FORM_ID = 'form_default_contact_us';
const BUTTON_ID = 'btn_talk_to_human';

const DEFAULT_FORM = {
  id: FORM_ID,
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

const DEFAULT_FIELDS = [
  {
    id: `${FORM_ID}_field_name`,
    form_id: FORM_ID,
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
    id: `${FORM_ID}_field_company`,
    form_id: FORM_ID,
    field_name: 'Company Name',
    field_type: 'text',
    placeholder: 'Enter your company name',
    placement: 'full',
    is_required: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: `${FORM_ID}_field_job_title`,
    form_id: FORM_ID,
    field_name: 'Job Title',
    field_type: 'text',
    placeholder: 'Enter your job title',
    placement: 'full',
    is_required: true,
    order_index: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: `${FORM_ID}_field_country`,
    form_id: FORM_ID,
    field_name: 'Country',
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
    id: `${FORM_ID}_field_email`,
    form_id: FORM_ID,
    field_name: 'Email',
    field_type: 'email',
    placeholder: 'Enter your email address',
    placement: 'full',
    is_required: true,
    order_index: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: `${FORM_ID}_field_phone`,
    form_id: FORM_ID,
    field_name: 'Phone',
    field_type: 'text',
    placeholder: 'Enter your phone number',
    placement: 'full',
    is_required: false,
    order_index: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: `${FORM_ID}_field_purpose`,
    form_id: FORM_ID,
    field_name: 'Purpose',
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
    id: `${FORM_ID}_field_details`,
    form_id: FORM_ID,
    field_name: 'Details',
    field_type: 'textarea',
    placeholder: 'Please provide additional details about your inquiry',
    placement: 'full',
    is_required: true,
    order_index: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function seedFormForTenant(tenantDb, tenantId) {
  console.log(`\n📋 Processing tenant: ${tenantId}`);
  
  try {
    const formsCollection = tenantDb.collection('forms');
    const fieldsCollection = tenantDb.collection('form_fields');
    const connectionsCollection = tenantDb.collection('button_form_connections');
    
    // 1. Check and create form
    let formDoc = await formsCollection.findOne({ id: FORM_ID });
    if (!formDoc) {
      const insertResult = await formsCollection.insertOne(DEFAULT_FORM);
      formDoc = await formsCollection.findOne({ _id: insertResult.insertedId });
      console.log(`  ✅ Created "Contact Us" form`,formDoc);
    } else {
      console.log(`  ⏭️  "Contact Us" form already exists`);
    }

    // 2. Check and create form fields
    let fieldsAdded = 0;
    let fieldsSkipped = 0;

    for (const field of DEFAULT_FIELDS) {
      // Always set form_id to the actual form id
      field.form_id = formDoc._id.toString();
      console.log("field:", field);
      const existingField = await fieldsCollection.findOne({ id: field.id });
      if (!existingField) {
        await fieldsCollection.insertOne(field);
        fieldsAdded++;
      } else {
        fieldsSkipped++;
      }
    }
    
    if (fieldsAdded > 0) {
      console.log(`  ✅ Added ${fieldsAdded} form field(s)`);
    }
    if (fieldsSkipped > 0) {
      console.log(`  ⏭️  Skipped ${fieldsSkipped} existing field(s)`);
    }
    
    // 3. Connect "Speak to Expert" button to form
    const existingConnection = await connectionsCollection.findOne({ button_id: BUTTON_ID });
    
    if (!existingConnection) {
      await connectionsCollection.insertOne({
        button_id: BUTTON_ID,
        form_id: FORM_ID,
        created_at: new Date().toISOString()
      });
      console.log(`  ✅ Connected "Speak to Expert" button to "Contact Us" form`);
    } else if (existingConnection.form_id !== FORM_ID) {
      // Update existing connection to point to Contact Us form
      await connectionsCollection.updateOne(
        { button_id: BUTTON_ID },
        { $set: { form_id: FORM_ID, updated_at: new Date().toISOString() } }
      );
      console.log(`  ✅ Updated "Speak to Expert" button connection to "Contact Us" form`);
    } else {
      console.log(`  ⏭️  Button already connected to "Contact Us" form`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`  ❌ Error processing tenant ${tenantId}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Default "Contact Us" Form Seeding Script');
  console.log('='.repeat(60));
  console.log('');
  console.log('This script will:');
  console.log('  1. Add a default "Contact Us" form to all tenants');
  console.log('  2. Add 8 form fields (Name, Company, Job Title, Country, Email, Phone, Purpose, Details)');
  console.log('  3. Connect the "Speak to Expert" button to this form');
  console.log('');
  
  let masterClient;
  
  try {
    // Connect to master database
    console.log('📡 Connecting to master database...');
    masterClient = new MongoClient(MASTER_DB_URI);
    await masterClient.connect();
    const masterDb = masterClient.db();
    console.log('✅ Connected to master database\n');
    
    // Get all active tenants
    const tenants = await masterDb.collection('tenants').find({ status: 'active' }).toArray();
    
    if (tenants.length === 0) {
      console.log('⚠️  No active tenants found');
      return;
    }
    
    console.log(`📊 Found ${tenants.length} active tenant(s)\n`);
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];
    
    // Process each tenant
    for (const tenant of tenants) {
      const tenantClient = new MongoClient(tenant.database_uri);
      
      try {
        await tenantClient.connect();
        const tenantDb = tenantClient.db(tenant.database_name);
        
        const result = await seedFormForTenant(tenantDb, tenant.id);
        
        if (result.success) {
          successCount++;
          results.push({ tenantId: tenant.id, status: 'success' });
        } else {
          failureCount++;
          results.push({ tenantId: tenant.id, status: 'failed', error: result.error });
        }
        
      } catch (error) {
        console.error(`  ❌ Failed to connect to tenant ${tenant.id}:`, error.message);
        failureCount++;
        results.push({ tenantId: tenant.id, status: 'failed', error: error.message });
      } finally {
        await tenantClient.close();
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📋 Total: ${tenants.length}`);
    console.log('');
    
    if (failureCount > 0) {
      console.log('Failed tenants:');
      results.filter(r => r.status === 'failed').forEach(r => {
        console.log(`  - ${r.tenantId}: ${r.error}`);
      });
      console.log('');
    }
    
    console.log('✨ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (masterClient) {
      await masterClient.close();
      console.log('🔌 Disconnected from master database');
    }
  }
}

// Run the migration
main()
  .then(() => {
    console.log('\n✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
