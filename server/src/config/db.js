import mongoose from "mongoose";

export const connectDb = async (retries = 5) => {
  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }
  mongoose.set("strictQuery", true);

  while (retries > 0) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      console.error(`MongoDB connection failed. Retries left: ${retries - 1}`, error.message);
      retries -= 1;
      if (retries === 0) throw new Error("Could not connect to MongoDB after multiple attempts");
      await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
    }
  }
};
