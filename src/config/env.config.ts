import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PRIMARY_PORT: z.coerce.number().default(7030),
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
  INTERNAL_SERVICE_USER_JWT_SECRET: z.string(),
  INTERNAL_SERVICE_ADMIN_JWT_SECRET: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_REGION: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  CORE_PLATFORM_BACKEND_URL: z.string().url(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

export const env = envSchema.parse(process.env);
