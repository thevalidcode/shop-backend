import { registry } from "../components/registry";
import {
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
  deleteMultipleBlogsSchema,
  blogIdSchema,
  getBlogsSchema,
} from "../../schemas/blog.schema";

import {
  BlogCreatedResponse,
  BlogUpdatedResponse,
  BlogListResponse,
  BlogObject,
} from "../responses/blog.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";

// GET /blogs?shopId=123
registry.registerPath({
  method: "get",
  path: "/blogs",
  summary: "Get all blogs",
  tags: ["Blogs"],
  request: {
    query: getBlogsSchema,
  },
  responses: {
    200: BlogListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /blogs/{blogId}?shopId=123
registry.registerPath({
  method: "get",
  path: "/blogs/{blogId}",
  summary: "Get blog by ID",
  tags: ["Blogs"],
  request: {
    params: blogIdSchema,
    query: getBlogsSchema,
  },
  responses: {
    200: BlogObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /blogs
registry.registerPath({
  method: "post",
  path: "/blogs/admin",
  summary: "Create a new blog",
  tags: ["Blogs"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createBlogSchema,
        },
      },
    },
  },
  responses: {
    200: BlogCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /blogs
registry.registerPath({
  method: "patch",
  path: "/blogs/admin",
  summary: "Update a blog",
  tags: ["Blogs"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateBlogSchema,
        },
      },
    },
  },
  responses: {
    200: BlogUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /blogs
registry.registerPath({
  method: "delete",
  path: "/blogs/admin",
  summary: "Delete a blog",
  tags: ["Blogs"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteBlogSchema,
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

// DELETE /blogs/multiple
registry.registerPath({
  method: "delete",
  path: "/blogs/admin/multiple",
  summary: "Delete multiple blogs",
  tags: ["Blogs"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteMultipleBlogsSchema,
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
