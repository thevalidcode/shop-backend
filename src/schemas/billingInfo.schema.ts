import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const BillingInfoSchema = z.object({
  id: z.number(),
  uid: z.string(),
  userId: z.number(),
  shopId: z.number(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  isDefault: z.boolean(),
  timestamp: z.string(),
  updatedAt: z.string(),
});

// Schema for creating billing information
export const CreateBillingInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional().default(false),
});

export type CreateBillingInfoInput = z.infer<typeof CreateBillingInfoSchema>;

// Schema for updating billing information
export const UpdateBillingInfoSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateBillingInfoInput = z.infer<typeof UpdateBillingInfoSchema>;

// Schema for getting billing info
export const GetBillingInfoQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type GetBillingInfoQuery = z.infer<typeof GetBillingInfoQuerySchema>;

// Schema for billing info params
export const BillingInfoParamsSchema = z.object({
  uid: z.string().uuid("Invalid billing info ID"),
});

export type BillingInfoParams = z.infer<typeof BillingInfoParamsSchema>;
