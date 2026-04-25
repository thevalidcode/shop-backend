import { z } from "zod";

export const SupplierSourceStoresResponse = {
  description: "List of source suppliers available for reseller discovery",
  content: {
    "application/json": {
      schema: z.object({
        suppliers: z.array(
          z.object({
            uid: z.string(),
            name: z.string(),
            url: z.string(),
            image: z.string().nullable(),
          }),
        ),
        meta: z.object({
          total: z.number(),
          page: z.number(),
          pages: z.number(),
          limit: z.number(),
        }),
      }),
    },
  },
};

export const SupplierSourceProductsResponse = {
  description: "Catalog preview for a source supplier",
  content: {
    "application/json": {
      schema: z.object({
        sourceSupplier: z.object({
          shopId: z.number(),
          uid: z.string(),
          name: z.string(),
        }),
        products: z.array(
          z.object({
            productId: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            price: z.union([z.string(), z.number()]),
            currency: z.string(),
          }),
        ),
      }),
    },
  },
};

export const SupplierImportProductsResponse = {
  description: "Products imported into target reseller shop",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: z.object({
          supplierId: z.string(),
          targetShopId: z.number(),
          marginType: z.enum(["percentage", "fixed"]),
          marginValue: z.number(),
          totalSourceProducts: z.number(),
          created: z.number(),
          updated: z.number(),
        }),
      }),
    },
  },
};

export const SupplierSyncProductsResponse = {
  description: "Products synchronized into target reseller shop",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: z.object({
          supplierId: z.string(),
          targetShopId: z.number(),
          marginType: z.enum(["percentage", "fixed"]),
          marginValue: z.number(),
          totalSourceProducts: z.number(),
          created: z.number(),
          updated: z.number(),
          syncedAt: z.string(),
        }),
      }),
    },
  },
};

export const ResellerSourceStoresResponse = SupplierSourceStoresResponse;
export const ResellerSourceProductsResponse = SupplierSourceProductsResponse;
export const ResellerImportProductsResponse = SupplierImportProductsResponse;
export const ResellerSyncProductsResponse = SupplierSyncProductsResponse;
