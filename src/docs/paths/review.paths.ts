import { registry } from "../components/registry";
import {
  ReviewCreateSchema,
  ReviewApproveSchema,
  ReviewRejectSchema,
  ReviewDeleteSchema,
  ProductUidParamSchema,
} from "../../schemas/review.schema";
import { ShopIdSchema } from "../../schemas/common.schema";
import {
  ReviewCreatedResponse,
  ProductReviewsListResponse,
  UserReviewsListResponse,
  ReviewDeletedResponse,
  AllReviewsListResponse,
  ReviewApprovedResponse,
  ReviewRejectedResponse,
  ReviewNotFound,
  ReviewAlreadyExists,
} from "../responses/review.response";
import {
  BadRequest,
  Forbidden,
  ServerError,
  Unauthorized,
} from "../responses/common.response";

// ======================= USER ROUTES =======================

// Create Review (User)
registry.registerPath({
  method: "post",
  path: "/reviews",
  summary: "Create a product review",
  tags: ["Reviews"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ReviewCreateSchema,
        },
      },
    },
  },
  responses: {
    201: ReviewCreatedResponse,
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
    409: ReviewAlreadyExists,
    500: ServerError,
  },
});

// Get Product Reviews (Public)
registry.registerPath({
  method: "get",
  path: "/reviews/product/{productUid}",
  summary: "Get all approved reviews for a product",
  tags: ["Reviews"],
  request: {
    params: ProductUidParamSchema,
    query: ShopIdSchema,
  },
  responses: {
    200: ProductReviewsListResponse,
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

// Get User Reviews (User)
registry.registerPath({
  method: "get",
  path: "/reviews/user",
  summary: "Get all reviews created by the authenticated user",
  tags: ["Reviews"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: UserReviewsListResponse,
    401: Unauthorized,
    500: ServerError,
  },
});

// Delete Review (User)
registry.registerPath({
  method: "delete",
  path: "/reviews",
  summary: "Delete a review (user can only delete their own)",
  tags: ["Reviews"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ReviewDeleteSchema,
        },
      },
    },
  },
  responses: {
    200: ReviewDeletedResponse,
    401: Unauthorized,
    403: Forbidden,
    404: ReviewNotFound,
    500: ServerError,
  },
});

// ======================= ADMIN ROUTES =======================

// Get All Reviews (Admin)
registry.registerPath({
  method: "get",
  path: "/reviews/admin/all",
  summary: "Get all reviews for the admin's shop",
  tags: ["Reviews"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: AllReviewsListResponse,
    401: Unauthorized,
    403: Forbidden,
    500: ServerError,
  },
});

// Approve Review (Admin)
registry.registerPath({
  method: "patch",
  path: "/reviews/approve",
  summary: "Approve a pending review",
  tags: ["Reviews"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ReviewApproveSchema,
        },
      },
    },
  },
  responses: {
    200: ReviewApprovedResponse,
    401: Unauthorized,
    403: Forbidden,
    404: ReviewNotFound,
    500: ServerError,
  },
});

// Reject Review (Admin)
registry.registerPath({
  method: "patch",
  path: "/reviews/reject",
  summary: "Reject a review",
  tags: ["Reviews"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ReviewRejectSchema,
        },
      },
    },
  },
  responses: {
    200: ReviewRejectedResponse,
    401: Unauthorized,
    403: Forbidden,
    404: ReviewNotFound,
    500: ServerError,
  },
});

// Delete Review (Admin)
registry.registerPath({
  method: "delete",
  path: "/reviews/admin",
  summary: "Delete any review in the admin's shop",
  tags: ["Reviews"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ReviewDeleteSchema,
        },
      },
    },
  },
  responses: {
    200: ReviewDeletedResponse,
    401: Unauthorized,
    403: Forbidden,
    404: ReviewNotFound,
    500: ServerError,
  },
});
