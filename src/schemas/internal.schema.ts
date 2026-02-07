import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ShopStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Page must be a positive number",
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
});

export const createShopSchema = z.object({
  storeId: z.number().int().positive(),
  name: z.string().min(1, "Shop name is required"),
  storeDomain: z.string().min(1, "Shop domain is required"),
  description: z.string().optional().nullable(),
  planId: z.number().int().positive(),
  features: z.record(z.any()).optional(),
  adminEmail: z.string().email("Invalid admin email"),
  adminUsername: z.string().optional().nullable(),
  fullName: z.string(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  adminImage: z.string().optional().nullable(),
  adminId: z.number().positive(),
  adminUid: z.string().uuid(),
});

export type CreateShopParams = z.infer<typeof createShopSchema>;

export const UidSchema = z.object({
  uid: z.string(),
});

export type DeleteShopParams = z.infer<typeof UidSchema>;

export const UpdateShopSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  faviconUrl: z.string().url().optional().or(z.literal("")).nullable(),
  storeName: z.string().optional(),
  storeDescription: z.string().optional().nullable(),
  status: z.nativeEnum(ShopStatus).optional(),
  defaultClientCurrency: z.string().optional().nullable(),
  showBanner: z.boolean().optional().nullable(),
  onboardingCompleted: z.boolean().optional().nullable(),
  features: z.record(z.any()).optional(),
});
