import mongoose from "mongoose";

// ✅ Function to connect to MongoDB using Mongoose
const dbConnect = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log(`Database Connected Successfully :)`);
      })
      .catch((error) => {
        // Catch connection errors inside the .catch block
        console.log(`Database Connection failed due to: ${error.message}`);
      });
  } catch (error) {
    // Catch any unexpected errors during the connection process
    console.error(`Database connection error: ${error.message}`);
  }
};

export default dbConnect;
