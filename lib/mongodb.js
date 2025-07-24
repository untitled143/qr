import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'myDatabase';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}
if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
  throw new Error('Invalid MONGODB_URI: Must start with "mongodb+srv://" or "mongodb://"');
}
if (!dbName) {
  throw new Error('Please define MONGODB_DB_NAME in .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
    global._mongoClientPromise = client.connect().catch(err => {
      console.error('MongoDB connection failed:', err);
      global._mongoClientPromise = null;
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
  });
  clientPromise = client.connect();
}

export default async function connectToDatabase() {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = null;
    }
  }
}