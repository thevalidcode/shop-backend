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

// Enhanced Product Responses
export const ProductsWithPaginationResponse = {
  description: "List of products with pagination",
  content: {
    "application/json": {
      schema: z.object({
        products: z.array(ProductPublicSchema),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
    },
  },
};

export const SingleProductDetailedResponse = {
  description: "Detailed product with category, images, variants, and reviews",
  content: {
    "application/json": {
      schema: ProductPublicSchema.extend({
        category: z.object({
          name: z.string(),
          slug: z.string(),
        }).nullable(),
        images: z.array(z.any()),
        variants: z.array(z.any()),
        reviews: z.array(z.any()),
      }),
    },
  },
};

export const ProductReviewCreatedResponse = {
  description: "Product review created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        review: z.object({
          uid: z.string(),
          productUid: z.string(),
          userUid: z.string(),
          rating: z.number(),
          title: z.string().optional(),
          comment: z.string(),
          isVerified: z.boolean(),
          status: z.string(),
        }),
      }),
    },
  },
};

export const ProductReviewsListResponse = {
  description: "List of product reviews with pagination",
  content: {
    "application/json": {
      schema: z.object({
        reviews: z.array(z.object({
          uid: z.string(),
          rating: z.number(),
          title: z.string().nullable(),
          comment: z.string(),
          isVerified: z.boolean(),
          timestamp: z.string(),
          user: z.object({
            fullName: z.string(),
            username: z.string(),
            image: z.string().nullable(),
          }),
        })),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
    },
  },
};

export const ProductVariantsListResponse = {
  description: "List of product variants",
  content: {
    "application/json": {
      schema: z.array(z.object({
        uid: z.string(),
        name: z.string(),
        price: z.number(),
        stock: z.number(),
        color: z.string().nullable(),
        size: z.string().nullable(),
      })),
    },
  },
};

export const RelatedProductsResponse = {
  description: "List of related products",
  content: {
    "application/json": {
      schema: z.array(ProductPublicSchema),
    },
  },
};
