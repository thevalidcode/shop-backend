import { registry } from "../components/registry";
import { z } from "zod";
import {
  AuthenticateUserResponseSchema,
  AuthenticateUserSchema,
  CreateUserInputSchema,
  CreateUserResponseSchema,
  UserUpdateRequestSchema,
  UserPublicSchema,
} from "../../schemas/user.schema";

import {
  UpdateSuccess,
  InvalidData,
  UsersListResponse,
} from "../responses/user.response";

import {
  BadRequest,
  Forbidden,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";

// Authenticate user
registry.registerPath({
  method: "post",
  path: "/user/me",
  summary: "Authenticate user",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthenticateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Authenticated user session object",
      content: {
        "application/json": {
          schema: AuthenticateUserResponseSchema,
        },
      },
    },
    400: BadRequest,
    500: ServerError,
  },
});

// Get all users (admin)
registry.registerPath({
  method: "get",
  path: "/user",
  summary: "Get all users",
  tags: ["Users"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: UsersListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Get single user by UID
registry.registerPath({
  method: "get",
  path: "/user/{uid}",
  summary: "Get user by UID",
  tags: ["Users"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Public-facing user profile",
      content: {
        "application/json": {
          schema: UserPublicSchema,
        },
      },
    },
    403: Forbidden,
    500: ServerError,
  },
});

// Create user
registry.registerPath({
  method: "post",
  path: "/user",
  summary: "Register as Customer for a Specific Shop",
  description:
    "Register a new customer account for a specific shop.\n\n" +
    "### 🏪 Shop-Specific Registration:\n" +
    "- Users register for a specific shop using the shop domain\n" +
    "- Each user account is tied to one shop\n" +
    "- Shop must exist and be active\n\n" +
    "### 🔍 Prerequisites:\n" +
    "- Use `/shop/discover` to find available shops\n" +
    "- Use `/shop/info/{domain}` to verify shop exists\n" +
    "- Check shop is active before registration\n\n" +
    "### ✅ On Success:\n" +
    "- Creates customer account for the specified shop\n" +
    "- Sets authentication cookies\n" +
    "- Returns shop URL and account details",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Customer account created successfully",
      content: {
        "application/json": {
          schema: CreateUserResponseSchema,
        },
      },
    },
    400: BadRequest,
    404: {
      description: "Shop not found or inactive",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    500: ServerError,
  },
});

// Update user
registry.registerPath({
  method: "patch",
  path: "/user",
  summary: "Update user info",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateSuccess,
    400: InvalidData,
    500: ServerError,
  },
});

// Delete single user
registry.registerPath({
  method: "delete",
  path: "/user",
  summary: "Delete a single user",
  tags: ["Users"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            uid: z.string(),
          }),
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

// Delete multiple users
registry.registerPath({
  method: "delete",
  path: "/user/multiple",
  summary: "Delete multiple users",
  tags: ["Users"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            uids: z.array(z.string()),
          }),
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
