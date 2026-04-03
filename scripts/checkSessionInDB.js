/**
 * Check if a specific session exists in the database
 * Usage: node scripts/checkSessionInDB.js <sessionId> <tenantId>
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const sessionId = process.argv[2] || 'session_1764393515669_9gkx91yhp';
const tenantId = process.argv[3] || 'fpteu';

async function checkSession() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const dbName = `chatbot_${tenantId}`;
    console.log(`🔍 Checking database: ${dbName}`);
    console.log(`🔍 Looking for session: ${sessionId}\n`);

    const db = client.db(dbName);

    // Check if database exists
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    const dbExists = databases.databases.some(d => d.name === dbName);

    if (!dbExists) {
      console.error(`❌ Database "${dbName}" does not exist!`);
      console.log('\n📋 Available databases:');
      databases.databases.forEach(d => console.log(`   - ${d.name}`));
      return;
    }

    console.log(`✅ Database "${dbName}" exists\n`);

    // Check if leads collection exists
    const collections = await db.listCollections().toArray();
    const leadsCollection = collections.find(c => c.name === 'leads');

    if (!leadsCollection) {
      console.error(`❌ Collection "leads" does not exist in database "${dbName}"!`);
      console.log('\n📋 Available collections:');
      collections.forEach(c => console.log(`   - ${c.name}`));
      return;
    }

    console.log(`✅ Collection "leads" exists\n`);

    // Count total leads
    const totalLeads = await db.collection('leads').countDocuments();
    console.log(`📊 Total leads in database: ${totalLeads}\n`);

    // Search for the specific session
    const lead = await db.collection('leads').findOne({ session_id: sessionId });

    if (lead) {
      console.log('✅ SESSION FOUND IN DATABASE!\n');
      console.log('📄 Lead Document:');
      console.log('─'.repeat(80));
      console.log(JSON.stringify(lead, null, 2));
      console.log('─'.repeat(80));
      console.log('\n📋 Summary:');
      console.log(`   Session ID: ${lead.session_id}`);
      console.log(`   Date: ${lead.date}`);
      console.log(`   Created: ${lead.created_at}`);
      console.log(`   Updated: ${lead.updated_at}`);
      console.log(`   Chat History: ${lead.chat_history?.length || 0} messages`);
      console.log(`   Name: ${lead.form_data?.name || 'N/A'}`);
      console.log(`   Email: ${lead.form_data?.email || 'N/A'}`);
      console.log(`   Phone: ${lead.form_data?.phone || 'N/A'}`);
      console.log(`   Last Message: ${lead.last_message || 'N/A'}`);
      
      if (lead.session_info) {
        console.log(`\n🖥️  Session Info:`);
        console.log(`   Browser: ${lead.session_info.browser || 'N/A'}`);
        console.log(`   OS: ${lead.session_info.os || 'N/A'}`);
        console.log(`   Device: ${lead.session_info.device || 'N/A'}`);
        console.log(`   IP: ${lead.session_info.ipAddress || 'N/A'}`);
      }

      console.log('\n✅ The session EXISTS in the database.');
      console.log('❓ If it\'s not showing in the Lead List, check:');
      console.log('   1. Are you looking at the correct tenant in the admin panel?');
      console.log('   2. Is the date range filter excluding this session?');
      console.log('   3. Is there a search filter applied?');
      console.log('   4. Try refreshing the lead list page');
      
    } else {
      console.log('❌ SESSION NOT FOUND IN DATABASE!\n');
      
      // Search for similar sessions
      const similarSessions = await db.collection('leads').find({
        session_id: { $regex: sessionId.substring(0, 20) }
      }).limit(5).toArray();

      if (similarSessions.length > 0) {
        console.log('🔍 Found similar sessions:');
        similarSessions.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.session_id} (created: ${s.created_at})`);
        });
      }

      // Check recent sessions
      console.log('\n📅 Recent sessions (last 10):');
      const recentSessions = await db.collection('leads')
        .find({})
        .sort({ created_at: -1 })
        .limit(10)
        .toArray();

      if (recentSessions.length > 0) {
        recentSessions.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.session_id}`);
          console.log(`      Created: ${s.created_at}`);
          console.log(`      Name: ${s.form_data?.name || 'Anonymous'}`);
          console.log(`      Messages: ${s.chat_history?.length || 0}`);
          console.log('');
        });
      } else {
        console.log('   No sessions found in database!');
      }

      console.log('\n❓ Why might the session not exist?');
      console.log('   1. The session API was never called');
      console.log('   2. The API call failed (check server logs)');
      console.log('   3. Wrong tenant ID was used');
      console.log('   4. Database connection issue during creation');
      console.log('\n💡 Next steps:');
      console.log('   1. Check browser console for session creation logs');
      console.log('   2. Check server terminal for [Session API] logs');
      console.log('   3. Visit: http://fpteu.fptchatbot.com/test-session-tracking.html');
      console.log('   4. Run the test suite to verify session creation works');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
    console.log('\n✅ Database connection closed');
  }
}

checkSession();
