import { z } from "zod";

export const MarginTypeSchema = z.enum(["percentage", "fixed"]);
export const SourceTypeSchema = z.enum(["EXTERNAL", "SYSTEM_INTERNAL"]);

export const SupplierIdParamsSchema = z.object({
  supplierId: z.string().min(1),
});

export const SourceSuppliersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  shopId: z.coerce.number().int().optional(),
});

export const SupplierSchema = z.object({
  id: z.number(),
  shopScopedId: z.number(),
  uid: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  apiUrl: z.string(),
  percentage: z.number(),
  sync: z.boolean(),
  isInternal: z.boolean(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const SupplierCreateRequestSchema = z.object({
  name: z.string().min(2),
  url: z.string().min(3),
  percentage: z.coerce.number().min(0).default(0),
  image: z.string().url().optional(),
  apiKey: z.string().min(1),
  sync: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isInternal: z.boolean().default(false),
});

export const SupplierUpdateRequestSchema = z.object({
  uid: z.string(),
  name: z.string().min(2).optional(),
  url: z.string().min(3).optional(),
  percentage: z.coerce.number().min(0).optional(),
  image: z.string().url().nullable().optional(),
  apiKey: z.string().min(1),
  sync: z.boolean().optional(),
  // sourceType is intentionally NOT included - cannot be changed on update
});

export const DeleteSupplierSchema = z.object({
  uid: z.string(),
});

export const DeleteMultipleSuppliersSchema = z.object({
  uids: z.array(z.string()).min(1),
});

export const SupplierProductsQuerySchema = z.object({
  supplierUid: z.string(),
});

export const SupplierProductSchema = z.object({
  productId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  min: z.number(),
  max: z.number(),
  stock: z.number(),
  status: z.enum(["ACTIVE", "OUT_OF_STOCK"]),
  imageUrl: z.string().nullable(),
  galleryUrls: z.array(z.string()),
  tags: z.array(z.string()),
  brand: z.string().nullable(),
  slug: z.string(),
  categoryUid: z.string().nullable().optional(),
});

export const SupplierImportProductsSchema = z.object({
  supplierUid: z.string(),
  productIds: z.array(z.string()).min(1),
  marginType: MarginTypeSchema,
  marginValue: z.coerce.number().nonnegative(),
  categoryUid: z.string().nullable().optional(),
});

export const SupplierSyncProductsSchema = z.object({
  supplierUid: z.string(),
  marginType: MarginTypeSchema,
  marginValue: z.coerce.number().nonnegative(),
});

export type MarginType = z.infer<typeof MarginTypeSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type SupplierCreateInput = z.infer<typeof SupplierCreateRequestSchema>;
export type SupplierUpdateInput = z.infer<typeof SupplierUpdateRequestSchema>;
export type SupplierImportProductsInput = z.infer<
  typeof SupplierImportProductsSchema
>;
export type SupplierSyncProductsInput = z.infer<
  typeof SupplierSyncProductsSchema
>;
export type SupplierProduct = z.infer<typeof SupplierProductSchema>;
