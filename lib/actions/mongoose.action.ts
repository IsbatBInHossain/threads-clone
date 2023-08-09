import mongoose, { mongo } from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);
  if (!process.env.MONGO_URI) return console.log('MongoDB URL not found');
  if (isConnected) return console.log('MongoDB already connected');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(error);
  }
};
