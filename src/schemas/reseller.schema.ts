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

export const ResellerSupplierImportSchema = z.object({
  supplierId: z.string().min(1),
  marginType: MarginTypeSchema,
  marginValue: z.coerce.number().nonnegative(),
  user: z.object({
    email: z.string().email(),
    fullName: z.string().min(2).optional().nullable(),
    phoneNumber: z.string().min(2).optional().nullable().or(z.literal("")),
    username: z.string().min(2).optional().nullable(),
    image: z.string().url().optional().nullable().or(z.literal("")),
    uid: z.string().uuid(),
  }),
});

export const ResellerSupplierSyncSchema = z.object({
  supplierId: z.string().min(1),
  marginType: MarginTypeSchema,
  marginValue: z.coerce.number().nonnegative(),
  user: z.object({
    email: z.string().email(),
    fullName: z.string().min(2).optional().nullable(),
    phoneNumber: z.string().min(2).optional().nullable().or(z.literal("")),
    username: z.string().min(2).optional().nullable(),
    image: z.string().url().optional().nullable().or(z.literal("")),
    uid: z.string().uuid(),
  }),
});

export type MarginType = z.infer<typeof MarginTypeSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type ResellerSupplierImportInput = z.infer<
  typeof ResellerSupplierImportSchema
>;
export type ResellerSupplierSyncInput = z.infer<
  typeof ResellerSupplierSyncSchema
>;
