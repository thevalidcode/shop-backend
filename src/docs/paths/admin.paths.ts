// src/docs/paths/adminPanel.paths.ts
import { registry } from "../components/registry";
import {
  UpdateGeneralSettingsSchema,
  UpdateDesignSettingsSchema,
} from "../../schemas/shop.schema";
import {
  CreatePaymentGatewaySchema,
  ModifyWalletBalanceSchema,
  UpdatePaymentGatewaySchema,
} from "../../schemas/admin.schema";
import {
  BadRequest,
  Forbidden,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";
import { NotFound } from "../responses/shop.response";
import { z } from "zod";

registry.registerPath({
  method: "patch",
  path: "/admin/settings/general",
  summary: "Update general store settings",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: { "application/json": { schema: UpdateGeneralSettingsSchema } },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
registry.registerPath({
  method: "patch",
  path: "/admin/settings/design",
  summary: "Update design & theme settings",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: { "application/json": { schema: UpdateDesignSettingsSchema } },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/admin/payment-gateways",
  summary: "Get configured payment gateways",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "List of gateways.",
      content: { "application/json": { schema: z.any() } },
    },
    403: Forbidden,
    500: ServerError,
  },
});
registry.registerPath({
  method: "post",
  path: "/admin/payment-gateways",
  summary: "Create a new payment gateway",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreatePaymentGatewaySchema } },
    },
  },
  responses: {
    201: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
registry.registerPath({
  method: "patch",
  path: "/admin/payment-gateways/{uid}",
  summary: "Update a payment gateway",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [{ name: "uid", in: "path", schema: { type: "string" } }],
  request: {
    body: {
      content: { "application/json": { schema: UpdatePaymentGatewaySchema } },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});
registry.registerPath({
  method: "delete",
  path: "/admin/payment-gateways/{uid}",
  summary: "Delete a payment gateway",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [{ name: "uid", in: "path", schema: { type: "string" } }],
  responses: {
    200: SuccessResponse,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/admin/users/{userUid}/wallet/credit",
  summary: "Credit a user's wallet",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [{ name: "userUid", in: "path", schema: { type: "string" } }],
  request: {
    body: {
      content: { "application/json": { schema: ModifyWalletBalanceSchema } },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});
registry.registerPath({
  method: "post",
  path: "/admin/users/{userUid}/wallet/debit",
  summary: "Debit a user's wallet",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [{ name: "userUid", in: "path", schema: { type: "string" } }],
  request: {
    body: {
      content: { "application/json": { schema: ModifyWalletBalanceSchema } },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/admin/referrals",
  summary: "Get all referral data",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "List of users and their referrals.",
      content: { "application/json": { schema: z.any() } },
    },
    403: Forbidden,
    500: ServerError,
  },
});
registry.registerPath({
  method: "get",
  path: "/admin/contact-messages",
  summary: "Get all contact form messages",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "List of messages.",
      content: { "application/json": { schema: z.any() } },
    },
    403: Forbidden,
    500: ServerError,
  },
});
registry.registerPath({
  method: "delete",
  path: "/admin/contact-messages/{uid}",
  summary: "Delete a contact message",
  tags: ["Admins"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [{ name: "uid", in: "path", schema: { type: "string" } }],
  responses: {
    200: SuccessResponse,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});
