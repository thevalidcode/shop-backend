import { registry } from "../components/registry";
import {
  ProductCreateInputSchema,
  ProductUpdateInputSchema,
  DeleteProductInputSchema,
  DeleteMultipleProductsInputSchema,
} from "../../schemas/product.schema";

import {
  ProductCreated,
  ProductUpdated,
  ProductDeleted,
  ProductsDeleted,
  ProductPublicListResponse,
  ProductListResponse,
  SingleProductPublicResponse,
  SingleProductResponse,
} from "../responses/product.response";

import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";

// Public: Get all active products
registry.registerPath({
  method: "get",
  path: "/product",
  summary: "Get all active products",
  tags: ["Products"],
  parameters: [
    {
      name: "shopId",
      in: "query",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: ProductPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Admin: Get all products
registry.registerPath({
  method: "get",
  path: "/product/admin",
  summary: "Get all products for admins",
  tags: ["Products"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: ProductListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Get products by provider ID
registry.registerPath({
  method: "get",
  path: "/product/{providerId}",
  summary: "Get products by provider ID",
  tags: ["Products"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "providerId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: ProductListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Public: Get single service
registry.registerPath({
  method: "get",
  path: "/product/{productId}",
  summary: "Get a service by ID (public)",
  tags: ["Products"],
  parameters: [
    {
      name: "productId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
    {
      name: "shopId",
      in: "query",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: SingleProductPublicResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Admin: Get service by ID
registry.registerPath({
  method: "get",
  path: "/product/admin/{productId}",
  summary: "Get a service by ID (admin)",
  tags: ["Products"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "productId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: SingleProductResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Update a service
registry.registerPath({
  method: "patch",
  path: "/product",
  summary: "Update a service",
  tags: ["Products"],
  security: [{ CookieAuth: [] }],
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

// Admin: Delete single service
registry.registerPath({
  method: "delete",
  path: "/product",
  summary: "Delete a single service",
  tags: ["Products"],
  security: [{ CookieAuth: [] }],
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
  path: "/product/multiple",
  summary: "Delete multiple products",
  tags: ["Products"],
  security: [{ CookieAuth: [] }],
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

// Admin: Create new service
registry.registerPath({
  method: "post",
  path: "/product/create",
  summary: "Create a new service",
  tags: ["Products"],
  security: [{ CookieAuth: [] }],
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
