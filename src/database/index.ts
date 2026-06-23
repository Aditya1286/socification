import mongoose from "mongoose";
import { MONGO_URI } from "../config/index.js";

export const connectWithMongo = async () => {
    try {
        console.log(`[Database] Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log("[Database] Connected successfully to MongoDB");
    } catch (error) {
        console.error("[Database] MongoDB Connection failed:", error);
        process.exit(1);
    }
};
