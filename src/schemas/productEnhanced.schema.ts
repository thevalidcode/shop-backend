import { z } from "zod";

/**
 * Product Review Schemas
 */
export const CreateProductReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

export const GetProductReviewsSchema = z.object({
  productUid: z.string().uuid(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const ApproveReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

/**
 * Product Variant Schemas
 */
export const CreateProductVariantSchema = z.object({
  name: z.string(),
  sku: z.string().optional(),
  price: z.number(),
  comparePrice: z.number().optional(),
  stock: z.number(),
  imageUrl: z.string().url().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  weight: z.number().optional(),
  position: z.number().optional(),
  isDefault: z.boolean().optional(),
});

export const UpdateProductVariantSchema = CreateProductVariantSchema.partial();

/**
 * Product Image Schemas
 */
export const CreateProductImageSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().optional(),
  position: z.number().optional(),
  isPrimary: z.boolean().optional(),
});

export const UpdateProductImageSchema = CreateProductImageSchema.partial();

/**
 * Enhanced Product Query Schemas
 */
export const GetProductsQuerySchema = z.object({
  shopId: z.coerce.number(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  category: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['position', 'price', 'averageRating', 'totalSales', 'timestamp']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  isFeatured: z.coerce.boolean().optional(),
  brand: z.string().optional(),
});

export const GetProductBySlugSchema = z.object({
  slug: z.string(),
  shopId: z.coerce.number(),
});

/**
 * Admin Product Management Schemas
 */
export const AdminCreateProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  categoryUid: z.string().uuid().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  position: z.number().optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  stock: z.number().optional(),
  sku: z.string().optional(),
  imageUrl: z.string().url().optional(),
  galleryUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  price: z.number(),
  comparePrice: z.number().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().optional(),
  slug: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  lowStockThreshold: z.number().optional(),
  trackInventory: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
});

export const AdminUpdateProductSchema = AdminCreateProductSchema.partial();