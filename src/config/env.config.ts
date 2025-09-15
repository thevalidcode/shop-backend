import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PRIMARY_PORT: z.coerce.number().default(7030),
  SECONDARY_PORT: z.coerce.number().default(5020),
  DATABASE_URL: z.string().url(),
  MASTER_KEY: z
    .string()
    .length(32, { message: "MASTER_KEY must be 32 characters long" }),
  JWT_SECRET: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  BACKEND_PROXY_PATH: z.string().optional(),
  CORE_SERVICE_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
