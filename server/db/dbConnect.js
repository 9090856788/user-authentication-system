import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    mongoose.set("bufferCommands", false);
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI not configured. Operating with in-memory persistence.");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log("Database connected successfully.");
  } catch (error) {
    console.warn(`Database connection failed (${error.message}). Using in-memory fallback.`);
  }
};

export default dbConnect;
