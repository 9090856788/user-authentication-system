import mongoose from "mongoose";

const dbConnect = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MONGO_URI is not defined in environment variables. Please configure MONGO_URI in your .env file.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

export default dbConnect;
