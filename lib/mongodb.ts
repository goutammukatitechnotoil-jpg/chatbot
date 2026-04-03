import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fpt_chatbot';
let client: MongoClient;
let db: Db;

// Optimized connection options for MongoDB Atlas M0 tier
const MONGO_OPTIONS = {
  maxPoolSize: 10, // Limit connections per instance (M0 max is 500 total)
  minPoolSize: 2,  // Keep minimum connections ready
  maxIdleTimeMS: 60000, // Close idle connections after 1 minute
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  compressors: ['zlib' as const], // Compress network traffic
};

export async function connectToDatabase(): Promise<Db | null> {
  try {
    if (!client) {
      console.log('Attempting to connect to MongoDB...');
      console.log('MongoDB URI (sanitized):', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      
      client = new MongoClient(uri, MONGO_OPTIONS);
      
      await client.connect();
      console.log('Successfully connected to MongoDB with optimized pooling');
      db = client.db();
    }
    return db;
  } catch (error) {
    console.error('MongoDB Connection Error Details:');
    console.error('- Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- MongoDB URI (sanitized):', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    // Reset client so next request will try to reconnect
    client = null as any;
    
    return null;
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null as any;
    db = null as any;
    console.log('MongoDB connection closed');
  }
}
