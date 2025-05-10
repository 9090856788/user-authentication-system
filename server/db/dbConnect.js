import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log(`Database Connected Successfully :)`);
      })
      .catch(() => {
        console.log(`Database Connection was failed due to : ${error.message}`);
      });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
  }
};

export default dbConnect;
