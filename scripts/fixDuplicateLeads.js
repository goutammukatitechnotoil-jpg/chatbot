const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fpt_chatbot';

async function fixDuplicateLeads() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(); // Use database from URI
    console.log('Connected to MongoDB');

    // Find duplicate session_ids
    const duplicates = await db.collection('leads').aggregate([
      {
        $group: {
          _id: '$session_id',
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();

    console.log(`Found ${duplicates.length} duplicate session groups:`);

    for (const duplicate of duplicates) {
      console.log(`\n📋 Processing session: ${duplicate._id}`);
      console.log(`   Found ${duplicate.count} records`);

      // Sort docs by created_at to get the first (chat-only) and latest (with form data)
      const sortedDocs = duplicate.docs.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );

      const firstDoc = sortedDocs[0]; // Usually chat-only
      const otherDocs = sortedDocs.slice(1);

      // Merge all data into the first document
      let mergedFormData = { ...firstDoc.form_data };
      let latestChatHistory = firstDoc.chat_history || [];
      let lastMessage = firstDoc.last_message || '';

      for (const doc of otherDocs) {
        // Merge form data (prioritize non-empty values)
        for (const [key, value] of Object.entries(doc.form_data || {})) {
          if (value && value !== '' && value !== 'Anonymous User' && value !== 'Chat Only') {
            mergedFormData[key] = value;
          }
        }

        // Use latest chat history
        if (doc.chat_history && doc.chat_history.length > latestChatHistory.length) {
          latestChatHistory = doc.chat_history;
        }

        // Use latest message
        if (doc.last_message) {
          lastMessage = doc.last_message;
        }
      }

      // Update the first document with merged data
      await db.collection('leads').updateOne(
        { _id: firstDoc._id },
        {
          $set: {
            form_data: mergedFormData,
            chat_history: latestChatHistory,
            last_message: lastMessage,
            updated_at: new Date().toISOString()
          }
        }
      );

      // Delete the duplicate documents
      const idsToDelete = otherDocs.map(doc => doc._id);
      await db.collection('leads').deleteMany({ _id: { $in: idsToDelete } });

      console.log(`   ✅ Merged and cleaned up ${idsToDelete.length} duplicate(s)`);
      console.log(`   📝 Final lead: ${mergedFormData.name || 'Anonymous'} (${mergedFormData.purpose || 'N/A'})`);
    }

    // Create unique index on session_id to prevent future duplicates
    try {
      await db.collection('leads').createIndex({ session_id: 1 }, { unique: true });
      console.log('\n✅ Created unique index on session_id to prevent future duplicates');
    } catch (error) {
      if (error.code === 11000) {
        console.log('\n⚠️  Unique index on session_id already exists');
      } else {
        console.log('\n❌ Error creating unique index:', error.message);
      }
    }

    // Show final stats
    const totalLeads = await db.collection('leads').countDocuments();
    console.log(`\n📊 Final statistics:`);
    console.log(`   Total leads after cleanup: ${totalLeads}`);
    console.log(`   Duplicate groups resolved: ${duplicates.length}`);

  } catch (error) {
    console.error('❌ Error fixing duplicate leads:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  fixDuplicateLeads();
}

module.exports = { fixDuplicateLeads };
