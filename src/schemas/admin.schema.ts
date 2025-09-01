import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Admin, AdminRole, AdminStatus, ContactStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const AdminSchema: z.ZodType<Admin> = z
  .object({
    id: z.number(),
    uid: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    password: z.string(),
    username: z.string(),
    apiKey: z.string(),
    role: z.nativeEnum(AdminRole),
    status: z.nativeEnum(AdminStatus),
    shopId: z.number(),
    currency: z.string(),
    timestamp: z.date(),
    lastSeen: z.date(),
  })
  .openapi("Admin");

export const AuthenticateAdminSchema = z.object({
  shopId: z.coerce.number().describe("Associated store ID"),
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

export const internalTokenPayloadSchema = z.object({
  service: z.literal("core-platform", {
    errorMap: () => ({ message: "Invalid value provided" }),
  }),
  type: z.literal("system", {
    errorMap: () => ({ message: "Invalid value provided" }),
  }),
  email: z.string().email(),
  shopId: z.number(),
  apiKey: z.string(),
  uid: z.string(),
});

export const CreatePaymentGatewaySchema = z.object({
  name: z.string().min(1, "Gateway name is required."),
  publicKey: z.string().min(1, "Public key is required."),
  secretKey: z.string().min(1, "Secret key is required."),
  isActive: z.boolean().optional(),
});

export const UpdatePaymentGatewaySchema = CreatePaymentGatewaySchema.partial();

export const ModifyWalletBalanceSchema = z.object({
  amount: z.number().positive("Amount must be a positive number."),
  description: z
    .string()
    .min(5, "Description is required and must be at least 5 characters."),
});

export const UpdateContactMessageSchema = z.object({
  status: z.nativeEnum(ContactStatus),
});

export const AdminUpdateUserSchema = z
  .object({
    status: z.nativeEnum(AdminStatus).optional(),
    // Add other fields an admin should be able to change, e.g., username
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    shopId: z.number().optional(),
    ref: z.number().optional(),
  })
  .strict();

// NEW: Admin Registration Schema
export const AdminRegistrationSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  shopName: z.string().min(1),
  shopDomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Domain must contain only lowercase letters, numbers, and hyphens",
    }),
});

// NEW: Domain Check Response Schema
export const DomainCheckResponseSchema = z.object({
  domain: z.string(),
  available: z.boolean(),
  message: z.string(),
  suggestedUrl: z.string(),
});

// NEW: Admin Registration Response Schema
export const AdminRegistrationResponseSchema = z.object({
  success: z.string(),
  shop: z.object({
    shopId: z.number(),
    domain: z.string(),
    name: z.string(),
    url: z.string(),
    status: z.string(),
    plan: z.string(),
  }),
  admin: z.object({
    uid: z.string(),
    email: z.string(),
    username: z.string(),
    role: z.string(),
  }),
  nextSteps: z.array(z.string()),
});
