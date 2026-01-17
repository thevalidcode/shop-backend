import { z } from "zod";
import { registry } from "../components/registry";
import {
  ProductCreateInputSchema,
  ProductUpdateInputSchema,
  DeleteProductInputSchema,
  DeleteMultipleProductsInputSchema,
  GetProductsBasicQuerySchema,
  GetProductsQuerySchema,
  GetProductBySlugSchema,
  ProductReviewCreateSchema,
  GetProductReviewsQuerySchema,
  GetFeaturedProductsQuerySchema,
  GetBestSellingQuerySchema,
  GetRelatedProductsQuerySchema,
  ProductUidSchema,
} from "../../schemas/product.schema";

import {
  ProductCreated,
  ProductUpdated,
  ProductDeleted,
  ProductsDeleted,
  ProductPublicListResponse,
  ProductListResponse,
  SingleProductResponse,
  ProductsWithPaginationResponse,
  SingleProductDetailedResponse,
  ProductReviewCreatedResponse,
  ProductReviewsListResponse,
  ProductVariantsListResponse,
  RelatedProductsResponse,
} from "../responses/product.response";

import {
  BadRequest,
  Forbidden,
  ServerError,
  Unauthorized,
} from "../responses/common.response";
import { ShopIdSchema } from "../../schemas/common.schema";

// Public: Get all active products
registry.registerPath({
  method: "get",
  path: "/products",
  summary: "Get all active products",
  tags: ["Products"],
  request: {
    query: GetProductsBasicQuerySchema,
  },
  responses: {
    200: ProductPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Admin: Get all products
registry.registerPath({
  method: "get",
  path: "/products/admin",
  summary: "Get all products for admins",
  tags: ["Products"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: ProductListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Get product by ID
registry.registerPath({
  method: "get",
  path: "/products/admin/{productUid}",
  summary: "Get a product by ID (admin)",
  tags: ["Products"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: ProductUidSchema,
  },
  responses: {
    200: SingleProductResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Update a product
registry.registerPath({
  method: "patch",
  path: "/products",
  summary: "Update a product",
  tags: ["Products"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProductUpdateInputSchema,
        },
      },
    },
  },
  responses: {
    200: ProductUpdated,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Delete single product
registry.registerPath({
  method: "delete",
  path: "/products",
  summary: "Delete a single product",
  tags: ["Products"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteProductInputSchema,
        },
      },
    },
  },
  responses: {
    200: ProductDeleted,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Delete multiple products
registry.registerPath({
  method: "delete",
  path: "/products/multiple",
  summary: "Delete multiple products",
  tags: ["Products"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteMultipleProductsInputSchema,
        },
      },
    },
  },
  responses: {
    200: ProductsDeleted,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Create new product
registry.registerPath({
  method: "post",
  path: "/products",
  summary: "Create a new product",
  tags: ["Products"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProductCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: ProductCreated,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Public: Search products with filters
registry.registerPath({
  method: "get",
  path: "/products/search",
  summary: "Search products with advanced filters",
  tags: ["Products"],
  request: {
    query: GetProductsQuerySchema,
  },
  responses: {
    200: ProductsWithPaginationResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Public: Get featured products
registry.registerPath({
  method: "get",
  path: "/products/featured",
  summary: "Get featured products",
  tags: ["Products"],
  request: {
    query: GetFeaturedProductsQuerySchema,
  },
  responses: {
    200: ProductPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Public: Get best-selling products
registry.registerPath({
  method: "get",
  path: "/products/best-selling",
  summary: "Get best-selling products",
  tags: ["Products"],
  request: {
    query: GetBestSellingQuerySchema,
  },
  responses: {
    200: ProductPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Public: Get product by slug
registry.registerPath({
  method: "get",
  path: "/products/slug/{slug}",
  summary: "Get product details by slug",
  tags: ["Products"],
  request: {
    params: z.object({ slug: z.string() }),
    query: ShopIdSchema,
  },
  responses: {
    200: SingleProductDetailedResponse,
    400: BadRequest,
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    500: ServerError,
  },
});

// Public: Get product reviews
registry.registerPath({
  method: "get",
  path: "/products/{productUid}/reviews",
  summary: "Get product reviews",
  tags: ["Products"],
  request: {
    params: ProductUidSchema,
    query: GetProductReviewsQuerySchema,
  },
  responses: {
    200: ProductReviewsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Protected: Create product review
registry.registerPath({
  method: "post",
  path: "/products/{productUid}/reviews",
  summary: "Create a product review",
  tags: ["Products"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: ProductUidSchema,
    body: {
      content: {
        "application/json": {
          schema: ProductReviewCreateSchema,
        },
      },
    },
  },
  responses: {
    201: ProductReviewCreatedResponse,
    400: BadRequest,
    401: Unauthorized,
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    500: ServerError,
  },
});

// Public: Get product variants
registry.registerPath({
  method: "get",
  path: "/products/{productUid}/variants",
  summary: "Get product variants",
  tags: ["Products"],
  request: {
    params: ProductUidSchema,
  },
  responses: {
    200: ProductVariantsListResponse,
    500: ServerError,
  },
});

// Public: Get related products
registry.registerPath({
  method: "get",
  path: "/products/{productUid}/related",
  summary: "Get related products",
  tags: ["Products"],
  request: {
    params: ProductUidSchema,
    query: GetRelatedProductsQuerySchema,
  },
  responses: {
    200: RelatedProductsResponse,
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    500: ServerError,
  },
});
