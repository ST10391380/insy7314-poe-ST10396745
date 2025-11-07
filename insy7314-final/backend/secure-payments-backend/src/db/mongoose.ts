import mongoose from "mongoose";
import { config } from "dotenv";
config();

const url = process.env.MONGO_URL as string;

export default async function connectDb() {
  if (!url) throw new Error("MONGO_URL missing in .env");
  try {
    await mongoose.connect(url);
    console.log("✅ Mongo connected");
  } catch (err) {
    console.error("❌ Mongo connect failed:", err);
    process.exit(1);
  }
}
connectDb();
