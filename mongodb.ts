import mongoose from 'mongoose';

const DB_URI = process.env.MONGODB_URI as string; // Replace with your MongoDB URI

async function connectToDatabase() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

export default connectToDatabase;
