import { z } from "zod";

export const CreatePaymentGatewaySchema = z.object({
  name: z.string().min(1, "Gateway name is required."),
  publicKey: z.string().min(1, "Public key is required."),
  secretKey: z.string().min(1, "Secret key is required."),
  isActive: z.boolean().optional(),
});

export const UpdatePaymentGatewaySchema = CreatePaymentGatewaySchema.partial();

export const ModifyWalletBalanceSchema = z.object({
  amount: z.number().positive("Amount must be a positive number."),
  description: z.string().min(5, "Description is required and must be at least 5 characters."),
});

export const UpdateContactMessageSchema = z.object({
  status: z.enum(["new", "read", "archived"]),
});

export const AdminUpdateUserSchema = z.object({
    status: z.enum(["active", "banned"]).optional(),
    role: z.enum(["user", "admin"]).optional(),
    // Add other fields an admin should be able to change, e.g., username
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    shopId: z.number().optional(),
    ref: z.number().optional(),
  }).strict();

// NEW: Admin Registration Schema
export const AdminRegistrationSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  shopName: z.string().min(1),
  shopDomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/, {
    message: "Domain must contain only lowercase letters, numbers, and hyphens"
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