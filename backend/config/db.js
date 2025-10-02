import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(mongoUri) {
  if (!mongoUri) throw new Error('MONGO_URI is not defined');
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, { dbName: 'myApp' });
  isConnected = true;
  return mongoose.connection;
}

export function dbStatus() {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
  };
}


