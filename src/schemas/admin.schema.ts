import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { AdminRole, AdminStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const AdminSchema = z
  .object({
    id: z.number(),
    uid: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    username: z.string(),
    fullName: z.string(),
    apiKey: z.string(),
    role: z.nativeEnum(AdminRole),
    status: z.nativeEnum(AdminStatus),
    shopId: z.number(),
    onboardingCompleted: z.boolean(),
    timestamp: z.coerce.date(),
    lastSeen: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi("Admin");

export const AdminAuthSchema = z.object({
  shopId: z.coerce.number(),
  uid: z.string(),
  type: z.literal("admin"),
  user: AdminSchema,
});

export const AuthenticateAdminSchema = z.object({
  shopId: z.coerce.number().describe("Associated shop ID"),
  email: z.string().email().describe("Admin email"),
  password: z.string().describe("Admin password"),
});

export const AuthenticateAdminResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  role: z.nativeEnum(AdminRole),
  user: z.object({
    id: z.coerce.number().describe("User id"),
    email: z.string().email().describe("User email"),
    username: z.string().describe("User username"),
  }),
});

export const AdminUpdateRequestSchema = z.object({
  username: z.string().min(3).optional(),
  status: z.nativeEnum(AdminStatus).optional(),
  image: z.string().url().nullable().optional(),
});

export const forgotPasswordAdminSchema = z.object({
  email: z.string().email().describe("Admin email address"),
});

export const resetPasswordAdminSchema = z.object({
  email: z.string().email().describe("Admin email address"),
  token: z.string().describe("Password reset token"),
  password: z.string().min(8).describe("New password (min 8 characters)"),
});

export const internalTokenPayloadSchema = z.object({
  iss: z.literal("core"), // who issued
  aud: z.enum(["core", "social-media-store", "shop"]), // who should receive
  uid: z.string().uuid(),
  storeId: z.number(),
});

export const internalAdminTokenPayloadSchema = z.object({
  iss: z.literal("core"), // who issued
  aud: z.enum(["core", "social-media-store", "shop"]), // who should receive
});
