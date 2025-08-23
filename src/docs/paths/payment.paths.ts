// src/docs/paths/payment.paths.ts
import { registry } from "../components/registry";
import { z } from "zod";
import { BadRequest, Forbidden, ServerError } from "../responses/common.response";
import { NotFound } from "../responses/shop.response";

registry.registerPath({
  method: "post",
  path: "/payment/initialize",
  summary: "Initialize a payment transaction",
  description: "Takes an order UID and returns a payment provider URL to complete the payment.",
  tags: ["Checkout & Payment"],
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
    200: {
      description: "Payment initialization successful.",
      content: {
        "application/json": {
          schema: z.object({
            authorization_url: z.string().url(),
            access_code: z.string(),
            reference: z.string(),
          }),
        },
      },
    },
    400: BadRequest,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/payment/webhook/{shopId}",
  summary: "Webhook for payment provider notifications",
  description: "Public endpoint for receiving and verifying payment status updates from providers like Paystack.",
  tags: ["Checkout & Payment"],
  parameters: [{ name: "shopId", in: "path", required: true, schema: { type: "number" } }],
  responses: {
    200: { description: "Webhook received and acknowledged." },
    400: { description: "Invalid payload." },
    401: { description: "Invalid signature." },
  },
});