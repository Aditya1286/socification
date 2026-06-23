import { config } from "dotenv";

config();

export const PORT = Number(process.env.PORT) || 5001;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/socification_db";
export const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || "socitune_internal_secret_token_123!";
export const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3000", "http://localhost:3001"];
