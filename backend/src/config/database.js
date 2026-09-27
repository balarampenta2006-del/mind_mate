import mongoose from 'mongoose';
import { config } from './config.js';
import { seedMongoDatabase } from '../data/seedMongo.js';

let mongoConnected = false;

export async function connectDB() {
  const uri = config.mongoUri;
  if (!uri) {
    console.log('ℹ️ MONGODB_URI not set. Using In-Memory data store.');
    return false;
  }

  try {
    console.log(`🔌 Connecting to MongoDB at ${uri}...`);
    // Connect with a 4 second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });

    mongoConnected = true;
    console.log('🍃 Connected to MongoDB successfully!');

    // Seed database if empty
    await seedMongoDatabase();

    return true;
  } catch (error) {
    mongoConnected = false;
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
    console.log('💡 Note: The server will automatically use the In-Memory Store so everything keeps working without interruptions.');
    return false;
  }
}

export function isMongoConnected() {
  return mongoConnected && mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (mongoConnected) {
    await mongoose.disconnect();
    mongoConnected = false;
  }
}
