import { z } from "zod";
import {
  ProductSchema,
  ProductPublicSchema,
} from "../../schemas/product.schema";

export const ProductPublicListResponse = {
  description: "List of available products (public users)",
  content: {
    "application/json": {
      schema: z.array(ProductPublicSchema),
    },
  },
};

export const ProductListResponse = {
  description: "List of available products (admin)",
  content: {
    "application/json": {
      schema: z.array(ProductSchema),
    },
  },
};

export const SingleProductResponse = {
  description: "A single service object",
  content: {
    "application/json": {
      schema: z.object({
        service: ProductSchema,
      }),
    },
  },
};

export const ProductCreated = {
  description: "Product created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Product added successfully."),
        service: ProductSchema,
      }),
    },
  },
};

export const ProductDeleted = {
  description: "Product deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Product deleted successfully."),
      }),
    },
  },
};

export const ProductsDeleted = {
  description: "Multiple products deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Products deleted successfully."),
      }),
    },
  },
};

export const ProductUpdated = {
  description: "Product updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Product updated successfully."),
        service: ProductSchema,
      }),
    },
  },
};
