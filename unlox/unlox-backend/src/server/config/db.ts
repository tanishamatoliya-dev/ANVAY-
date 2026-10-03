import mongoose from 'mongoose';

export interface DatabaseStatus {
  connected: boolean;
  type: 'atlas' | 'memory';
  host?: string;
  name?: string;
  error?: string;
}

export let dbStatus: DatabaseStatus = {
  connected: false,
  type: 'memory',
};

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      dbStatus = {
        connected: true,
        type: 'atlas',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      };
      console.log(`[MongoDB] Successfully connected to MongoDB Atlas: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return;
    } catch (err: any) {
      console.warn(`[MongoDB] Atlas connection failed: ${err.message}. Initializing fallback database mode so the application remains fully functional.`);
      dbStatus = {
        connected: false,
        type: 'memory',
        error: err.message,
      };
    }
  } else {
    console.log('[MongoDB] MONGO_URI not set in environment. Running with in-memory persistence layer. To persist data to MongoDB Atlas, add MONGO_URI to your environment variables.');
    dbStatus = {
      connected: false,
      type: 'memory',
      error: 'MONGO_URI not configured. Operating in local memory fallback.',
    };
  }
}
