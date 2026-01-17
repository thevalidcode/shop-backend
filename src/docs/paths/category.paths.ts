import { registry } from "../components/registry";
import { z } from "zod";
import {
  CategoryCreateRequestSchema,
  CategoryUpdateRequestSchema,
  DeleteCategoriesSchema,
  DeleteCategorySchema,
} from "../../schemas/category.schema";
import {
  CategoryCreatedResponse,
  CategoryUpdatedResponse,
  CategoryListResponse,
  CategoryObject,
} from "../responses/category.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";
import { ShopIdSchema, UidSchema } from "../../schemas/common.schema";

// GET /categories?shopId=123
registry.registerPath({
  method: "get",
  path: "/categories",
  summary: "Get all categories",
  tags: ["Categories"],
  request: {
    query: ShopIdSchema,
  },
  responses: {
    200: CategoryListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /categories (Admin)
registry.registerPath({
  method: "post",
  path: "/categories",
  summary: "Create a new category",
  tags: ["Categories"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CategoryCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: CategoryCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /categories (Admin)
registry.registerPath({
  method: "patch",
  path: "/categories",
  summary: "Update a category",
  tags: ["Categories"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CategoryUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: CategoryUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /categories (Admin)
registry.registerPath({
  method: "delete",
  path: "/categories",
  summary: "Delete a single category",
  tags: ["Categories"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteCategorySchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /categories/multiple (Admin)
registry.registerPath({
  method: "delete",
  path: "/categories/multiple",
  summary: "Delete multiple categories",
  tags: ["Categories"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteCategoriesSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// GET /categories/{uid}?shopId=123
registry.registerPath({
  method: "get",
  path: "/categories/{uid}",
  summary: "Get category by UID",
  tags: ["Categories"],
  request: {
    query: ShopIdSchema,
    params: UidSchema,
  },
  responses: {
    200: CategoryObject,
    400: BadRequest,
    500: ServerError,
  },
});
