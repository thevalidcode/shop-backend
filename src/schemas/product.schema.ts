import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ProductSchema = z
  .object({
    id: z.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    type: z.string(),
    min: z.number(),
    max: z.number(),
    position: z.number(),
    status: z.string(),
    stock: z.number(),
    sku: z.string().nullable(),
    imageUrl: z.string().nullable(),
    galleryUrls: z.array(z.string()).nullable(),
    tags: z.array(z.string()).nullable(),
    isFeatured: z.boolean(),
    brand: z.string().nullable(),
    weight: z.number().nullable(),
    dimensions: z.string().nullable(),
    price: z.number(),
    comparePrice: z.number().nullable(),
    discountType: z.string().nullable(),
    discountValue: z.number().nullable(),
    slug: z.string().min(1),
    shopId: z.number(),
    timestamp: z.string(),
  })
  .openapi("Product");

export const ProductPublicSchema = z
  .object({
    id: z.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    type: z.string(),
    min: z.number(),
    max: z.number(),
    price: z.number(),
    status: z.string(),
    stock: z.number(),
    imageUrl: z.string().nullable(),
    galleryUrls: z.array(z.string()).nullable(),
    isFeatured: z.boolean(),
    brand: z.string().nullable(),
    comparePrice: z.number().nullable(),
    slug: z.string().min(1),
    discountType: z.string().nullable(),
    discountValue: z.number().nullable(),
    timestamp: z.string(),
  })
  .openapi("ProductPublic");

export const ProductCreateInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  type: z.string(),
  min: z.number(),
  max: z.number(),
  price: z.number(),
  position: z.number().optional(),
  stock: z.number().optional(),
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  slug: z.string().min(1),
  comparePrice: z.number().optional(),
  discountType: z.string().optional(),
  discountValue: z.number().optional(),
});

export const ProductUpdateInputSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  price: z.number().optional(),
  position: z.number().optional(),
  status: z.string().optional(),
  stock: z.number().optional(),
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  comparePrice: z.number().optional(),
  discountType: z.string().optional(),
  slug: z.string().min(1),
  discountValue: z.number().optional(),
});

export const DeleteProductInputSchema = z.object({
  uid: z.string(),
});

export const DeleteMultipleProductsInputSchema = z.object({
  uids: z.array(z.string()),
});
