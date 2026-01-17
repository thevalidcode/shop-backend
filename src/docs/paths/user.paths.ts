import { registry } from "../components/registry";
import {
  AuthenticateUserSchema,
  CreateUserInputSchema,
  UserUpdateRequestSchema,
  UpdateUserByAdminRequestSchema,
  VerifySessionCodeBodySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  DeleteUserSchema,
  DeleteUsersSchema,
} from "../../schemas/user.schema";
import { UidSchema } from "../../schemas/common.schema";

import {
  LoginResponse,
  CreateUserResponse,
  GetUserResponse,
  UsersListResponse,
  UpdateUserResponse,
  UpdateUserByAdminResponse,
  DeleteUserResponse,
  VerifySessionResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from "../responses/user.response";

import {
  BadRequest,
  Forbidden,
  ServerError,
  NotFound,
} from "../responses/common.response";

// GET /users - Get all users (admin only)
registry.registerPath({
  method: "get",
  path: "/users",
  summary: "Get all users (admin only)",
  tags: ["User"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: UsersListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /users/me - User login
registry.registerPath({
  method: "post",
  path: "/users/me",
  summary: "User login",
  tags: ["User"],
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
    200: LoginResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// POST /users/verify-session - Verify session code
registry.registerPath({
  method: "post",
  path: "/users/verify-session",
  summary: "Verify user session code",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifySessionCodeBodySchema,
        },
      },
    },
  },
  responses: {
    200: VerifySessionResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// POST /users/reset-password - Reset password
registry.registerPath({
  method: "post",
  path: "/users/reset-password",
  summary: "Reset user password with token",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: ResetPasswordResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /users/forgot-password - Forgot password
registry.registerPath({
  method: "post",
  path: "/users/forgot-password",
  summary: "Request user password reset",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: forgotPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: ForgotPasswordResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// POST /users - Create user
registry.registerPath({
  method: "post",
  path: "/users",
  summary: "Create new user account",
  tags: ["User"],
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
    200: CreateUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /users/{uid} - Get user by UID
registry.registerPath({
  method: "get",
  path: "/users/{uid}",
  summary: "Get user by UID",
  tags: ["User"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: GetUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// PATCH /users - Update user (self)
registry.registerPath({
  method: "patch",
  path: "/users",
  summary: "Update user profile (authenticated user)",
  tags: ["User"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
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
    200: UpdateUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// PATCH /users/admin - Update user by admin
registry.registerPath({
  method: "patch",
  path: "/users/admin",
  summary: "Update user by admin",
  tags: ["User"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserByAdminRequestSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateUserByAdminResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// DELETE /users - Delete user
registry.registerPath({
  method: "delete",
  path: "/users",
  summary: "Delete a single user",
  tags: ["User"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteUserSchema,
        },
      },
    },
  },
  responses: {
    200: DeleteUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// DELETE /users/multiple - Delete multiple users
registry.registerPath({
  method: "delete",
  path: "/users/multiple",
  summary: "Delete multiple users",
  tags: ["User"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteUsersSchema,
        },
      },
    },
  },
  responses: {
    200: DeleteUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});
