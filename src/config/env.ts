import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "7030",
  MASTER_KEY: process.env.MASTER_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  RATE_KEY: process.env.RATE_KEY || "",
};
