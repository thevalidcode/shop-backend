import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { DiscountType, ProductStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const ProductSchema = z
  .object({
    id: z.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    categoryUid: z.string(),
    type: z.string(),
    min: z.number(),
    max: z.number(),
    position: z.number(),
    status: z.nativeEnum(ProductStatus),
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
    comparePrice: z.string().nullable(),
    discountType: z.nativeEnum(DiscountType).nullable(),
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
    categoryUid: z.string(),
    type: z.string(),
    min: z.number(),
    max: z.number(),
    price: z.number(),
    status: z.nativeEnum(ProductStatus),
    stock: z.number(),
    imageUrl: z.string().nullable(),
    galleryUrls: z.array(z.string()).nullable(),
    isFeatured: z.boolean(),
    brand: z.string().nullable(),
    comparePrice: z.coerce.string().nullable(),
    slug: z.string().min(1),
    discountType: z.nativeEnum(DiscountType).nullable(),
    discountValue: z.coerce.string().nullable(),
    timestamp: z.string(),
  })
  .openapi("ProductPublic");

export const ProductCreateInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  categoryUid: z.string(),
  currency: z.string().toUpperCase().length(3).optional(),
  min: z.coerce.number().default(0),
  max: z.coerce.number().default(0),
  price: z.coerce.string().default("0"),
  position: z.number().optional(),
  stock: z.number().optional(),
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().optional(),
  weight: z.coerce.string().optional(),
  dimensions: z.string().optional(),
  slug: z.string().min(1),
  comparePrice: z.coerce.string().optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.coerce.string().optional(),
});

export const ProductUpdateInputSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  currency: z.string().toUpperCase().length(3).optional(),
  description: z.string().optional(),
  categoryUid: z.string().optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  price: z.coerce.string().optional(),
  position: z.number().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  stock: z.number().optional(),
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().optional(),
  weight: z.coerce.string().optional(),
  dimensions: z.string().optional(),
  comparePrice: z.coerce.string().optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  slug: z.string().min(1),
  discountValue: z.coerce.string().optional(),
});

export const ProductUidSchema = z.object({
  productUid: z.string(),
});

export const DeleteProductInputSchema = z.object({
  uid: z.string(),
});

export const DeleteMultipleProductsInputSchema = z.object({
  uids: z.array(z.string()),
});

// Product Query Schemas
export const GetProductsBasicQuerySchema = z
  .object({
    shopId: z.coerce.number(),
  })
  .openapi("GetProductsBasicQuery");

export const GetProductsQuerySchema = z
  .object({
    shopId: z.coerce.number(),
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(20),
    search: z.string().optional(),
    categoryUid: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    sortBy: z.string().optional().default("position"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    isFeatured: z.enum(["true", "false"]).optional(),
    brand: z.string().optional(),
  })
  .openapi("GetProductsQuery");

export const GetProductBySlugSchema = z
  .object({
    slug: z.string().min(1),
    shopId: z.coerce.number(),
  })
  .openapi("GetProductBySlug");

export const ProductReviewCreateSchema = z
  .object({
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    comment: z.string().min(1),
  })
  .openapi("ProductReviewCreate");

export const GetProductReviewsQuerySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
  })
  .openapi("GetProductReviewsQuery");

export const GetFeaturedProductsQuerySchema = z
  .object({
    shopId: z.coerce.number(),
    limit: z.coerce.number().optional().default(10),
  })
  .openapi("GetFeaturedProductsQuery");

export const GetBestSellingQuerySchema = z
  .object({
    shopId: z.coerce.number(),
    limit: z.coerce.number().optional().default(10),
  })
  .openapi("GetBestSellingQuery");

export const GetRelatedProductsQuerySchema = z
  .object({
    limit: z.coerce.number().optional().default(6),
  })
  .openapi("GetRelatedProductsQuery");
