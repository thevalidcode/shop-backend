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
    category: z.string(),
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
    comparePrice: z.number().nullable(),
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
    category: z.string(),
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
    comparePrice: z.number().nullable(),
    slug: z.string().min(1),
    discountType: z.nativeEnum(DiscountType).nullable(),
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
  discountType: z.nativeEnum(DiscountType).optional(),
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
  status: z.nativeEnum(ProductStatus).optional(),
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
  discountType: z.nativeEnum(DiscountType).optional(),
  slug: z.string().min(1),
  discountValue: z.number().optional(),
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
    category: z.string().optional(),
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
