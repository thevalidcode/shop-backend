import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ProductSchema = z
  .object({
    id: z.number(),
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
    image_url: z.string().nullable(),
    gallery_urls: z.array(z.string()).nullable(),
    tags: z.array(z.string()).nullable(),
    is_featured: z.boolean(),
    brand: z.string().nullable(),
    weight: z.number().nullable(),
    dimensions: z.string().nullable(),
    price: z.number(),
    compare_price: z.number().nullable(),
    discount_type: z.string().nullable(),
    discount_value: z.number().nullable(),
    slug: z.string().min(1),
    shop_id: z.number(),
    timestamp: z.string(),
  })
  .openapi("Product");

export const ProductPublicSchema = z
  .object({
    id: z.number(),
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
    image_url: z.string().nullable(),
    gallery_urls: z.array(z.string()).nullable(),
    is_featured: z.boolean(),
    brand: z.string().nullable(),
    compare_price: z.number().nullable(),
    slug: z.string().min(1),
    discount_type: z.string().nullable(),
    discount_value: z.number().nullable(),
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
  image_url: z.string().optional(),
  gallery_urls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  brand: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  slug: z.string().min(1),
  compare_price: z.number().optional(),
  discount_type: z.string().optional(),
  discount_value: z.number().optional(),
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
  image_url: z.string().optional(),
  gallery_urls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  brand: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  compare_price: z.number().optional(),
  discount_type: z.string().optional(),
  slug: z.string().min(1),
  discount_value: z.number().optional(),
});

export const DeleteProductInputSchema = z.object({
  uid: z.string(),
});

export const DeleteMultipleProductsInputSchema = z.object({
  uids: z.array(z.string()),
});
