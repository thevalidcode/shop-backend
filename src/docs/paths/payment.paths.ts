// src/docs/paths/payment.paths.ts
import { registry } from "../components/registry";
import { z } from "zod";
import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";
import { NotFound } from "../responses/shop.response";
import {
  InitializedPaymentResponse,
  PaymentListResponse,
  PaymentPublicListResponse,
} from "../responses/payment.response";

registry.registerPath({
  method: "post",
  path: "/payments/initialize",
  summary: "Initialize a payment transaction",
  description:
    "Takes an order UID and returns a payment provider URL to complete the payment.",
  tags: ["Payments"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ orderUid: z.string().uuid() }),
        },
      },
    },
  },
  responses: {
    200: InitializedPaymentResponse,
    400: BadRequest,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/payments",
  summary: "Get a user's payments",
  tags: ["Payments"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: PaymentPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/payments/admin",
  summary: "Get all payments for admins",
  tags: ["Payments"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: PaymentListResponse,
    400: BadRequest,
    500: ServerError,
  },
});
