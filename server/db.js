import mongoose from 'mongoose';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dspace_nisar';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[DSpace MongoDB] Connected to ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`[DSpace MongoDB] Connection failed (${err.message}). Hybrid adapter will use static seed fallback.`);
  }
}

export function getConnectionStatus() {
  return isConnected;
}
