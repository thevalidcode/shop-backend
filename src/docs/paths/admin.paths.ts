// src/docs/paths/admin.paths.ts
import { registry } from "../components/registry";
import {
  AuthenticateAdminSchema,
  AdminUpdateRequestSchema,
  forgotPasswordAdminSchema,
  resetPasswordAdminSchema,
} from "../../schemas/admin.schema";
import { VerifySessionCodeBodySchema } from "../../schemas/user.schema";
import {
  AdminLoginResponseSchema,
  AdminUpdateResponseSchema,
  OnboardingCompleteResponseSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordResponseSchema,
  VerifySessionResponseSchema,
} from "../responses/admin.response";
import {
  BadRequest,
  Forbidden,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";
import { NotFound } from "../responses/shop.response";

// POST /admin/me - Admin Login
registry.registerPath({
  method: "post",
  path: "/admin/me",
  summary: "Admin login",
  tags: ["Admin"],
  request: {
    body: {
      content: { "application/json": { schema: AuthenticateAdminSchema } },
    },
  },
  responses: {
    200: {
      description: "Admin logged in successfully",
      content: { "application/json": { schema: AdminLoginResponseSchema } },
    },
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /admin - Update Admin Profile
registry.registerPath({
  method: "patch",
  path: "/admin",
  summary: "Update admin profile",
  tags: ["Admin"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: { "application/json": { schema: AdminUpdateRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Admin profile updated successfully",
      content: { "application/json": { schema: AdminUpdateResponseSchema } },
    },
    400: BadRequest,
    500: ServerError,
  },
});

// POST /admin/verify-session - Verify Session Code
registry.registerPath({
  method: "post",
  path: "/admin/verify-session",
  summary: "Verify admin session code",
  tags: ["Admin"],
  request: {
    body: {
      content: { "application/json": { schema: VerifySessionCodeBodySchema } },
    },
  },
  responses: {
    200: {
      description: "Admin authenticated successfully via session code",
      content: { "application/json": { schema: VerifySessionResponseSchema } },
    },
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// PUT /admin/onboarding-completed - Complete Onboarding
registry.registerPath({
  method: "put",
  path: "/admin/onboarding-completed",
  summary: "Mark admin onboarding as completed",
  tags: ["Admin"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "Onboarding completed successfully",
      content: {
        "application/json": { schema: OnboardingCompleteResponseSchema },
      },
    },
    500: ServerError,
  },
});

// POST /admin/forgot-password - Forgot Password
registry.registerPath({
  method: "post",
  path: "/admin/forgot-password",
  summary: "Request admin password reset",
  tags: ["Admin"],
  request: {
    body: {
      content: { "application/json": { schema: forgotPasswordAdminSchema } },
    },
  },
  responses: {
    200: {
      description: "Password reset email sent",
      content: {
        "application/json": { schema: ForgotPasswordResponseSchema },
      },
    },
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// POST /admin/reset-password - Reset Password
registry.registerPath({
  method: "post",
  path: "/admin/reset-password",
  summary: "Reset admin password with token",
  tags: ["Admin"],
  request: {
    body: {
      content: { "application/json": { schema: resetPasswordAdminSchema } },
    },
  },
  responses: {
    200: {
      description: "Password reset successfully",
      content: { "application/json": { schema: ResetPasswordResponseSchema } },
    },
    400: BadRequest,
    500: ServerError,
  },
});
