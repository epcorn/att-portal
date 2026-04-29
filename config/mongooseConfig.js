import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const currentEnv = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(currentEnv);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export { currentEnv };
export default connectDB;
