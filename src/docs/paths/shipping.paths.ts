import { registry } from "../components/registry";
import {
  ConnectShippingAccountSchema,
  UpdateShippingAccountSchema,
  CreateShipmentSchema,
  BulkCreateShipmentsSchema,
  SendboxWebhookSchema,
  ShippoWebhookSchema,
  ShipmentFiltersSchema,
  AccountUidSchema,
  OrderUidParamSchema,
  ShipmentUidSchema,
} from "../../schemas/shipping.schema";
import {
  ConnectAccountResponseSchema,
  GetAccountsResponseSchema,
  UpdateAccountResponseSchema,
  DisconnectAccountResponseSchema,
  CreateShipmentResponseSchema,
  BulkCreateShipmentsResponseSchema,
  GetShipmentsResponseSchema,
  GetShipmentResponseSchema,
  GetTrackingEventsResponseSchema,
  WebhookResponseSchema,
  ShippingErrorResponseSchema,
  ShippingValidationErrorResponseSchema,
} from "../responses/shipping.response";

/**
 * ADMIN SHIPPING ENDPOINTS
 */

// POST /admin/accounts (Admin)
registry.registerPath({
  method: "post",
  path: "/admin/accounts",
  tags: ["Shipping - Admin"],
  summary: "Connect shipping account",
  description:
    "Connect a new shipping provider account (Sendbox or Shippo) for the shop. Connection is tested before saving.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ConnectShippingAccountSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Shipping account connected successfully",
      content: {
        "application/json": {
          schema: ConnectAccountResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or connection test failed",
      content: {
        "application/json": {
          schema: ShippingValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// GET /admin/accounts (Admin)
registry.registerPath({
  method: "get",
  path: "/admin/accounts",
  tags: ["Shipping - Admin"],
  summary: "Get all shipping accounts",
  description: "Retrieve all shipping accounts configured for the shop",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "Shipping accounts retrieved successfully",
      content: {
        "application/json": {
          schema: GetAccountsResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// PATCH /admin/accounts/:accountUid (Admin)
registry.registerPath({
  method: "patch",
  path: "/admin/accounts/{accountUid}",
  tags: ["Shipping - Admin"],
  summary: "Update shipping account",
  description:
    "Update settings for a shipping account (active status, preferred status, etc.)",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: AccountUidSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateShippingAccountSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Shipping account updated successfully",
      content: {
        "application/json": {
          schema: UpdateAccountResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ShippingValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Shipping account not found",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// DELETE /admin/accounts/:accountUid (Admin)
registry.registerPath({
  method: "delete",
  path: "/admin/accounts/{accountUid}",
  tags: ["Shipping - Admin"],
  summary: "Disconnect shipping account",
  description: "Remove a shipping provider account from the shop",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: AccountUidSchema,
  },
  responses: {
    200: {
      description: "Shipping account disconnected successfully",
      content: {
        "application/json": {
          schema: DisconnectAccountResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Shipping account not found",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// POST /admin/shipments (Admin)
registry.registerPath({
  method: "post",
  path: "/admin/shipments",
  tags: ["Shipping - Admin"],
  summary: "Create shipment",
  description:
    "Create a new shipment for an order. Order status will be updated to SHIPPED and email notification sent.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateShipmentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Shipment created successfully",
      content: {
        "application/json": {
          schema: CreateShipmentResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or shipment already exists",
      content: {
        "application/json": {
          schema: ShippingValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error or no active shipping account",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// POST /admin/shipments/bulk (Admin)
registry.registerPath({
  method: "post",
  path: "/admin/shipments/bulk",
  tags: ["Shipping - Admin"],
  summary: "Bulk create shipments",
  description:
    "Create shipments for multiple orders at once (max 100). Returns both successful and failed operations.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: BulkCreateShipmentsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Bulk operation completed",
      content: {
        "application/json": {
          schema: BulkCreateShipmentsResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ShippingValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// GET /admin/shipments (Admin)
registry.registerPath({
  method: "get",
  path: "/admin/shipments",
  tags: ["Shipping - Admin"],
  summary: "Get all shipments",
  description:
    "Retrieve all shipments with optional filters (status, platform, date range) and pagination",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    query: ShipmentFiltersSchema,
  },
  responses: {
    200: {
      description: "Shipments retrieved successfully",
      content: {
        "application/json": {
          schema: GetShipmentsResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error in query params",
      content: {
        "application/json": {
          schema: ShippingValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * USER SHIPPING ENDPOINTS
 */

// GET /orders/:orderUid/shipment (User)
registry.registerPath({
  method: "get",
  path: "/orders/{orderUid}/shipment",
  tags: ["Shipping - User"],
  summary: "Get shipment by order",
  description:
    "Retrieve shipment details for a specific order (user can only access their own orders)",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidParamSchema,
  },
  responses: {
    200: {
      description: "Shipment retrieved successfully",
      content: {
        "application/json": {
          schema: GetShipmentResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found or shipment not found",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// GET /shipments/:shipmentUid/tracking (User)
registry.registerPath({
  method: "get",
  path: "/shipments/{shipmentUid}/tracking",
  tags: ["Shipping - User"],
  summary: "Get tracking events",
  description:
    "Retrieve tracking history for a shipment (user can only access shipments for their orders)",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: ShipmentUidSchema,
  },
  responses: {
    200: {
      description: "Tracking events retrieved successfully",
      content: {
        "application/json": {
          schema: GetTrackingEventsResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Shipment not found",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * WEBHOOK ENDPOINTS
 */

// POST /webhooks/shipping/sendbox
registry.registerPath({
  method: "post",
  path: "/webhooks/shipping/sendbox",
  tags: ["Shipping - Webhooks"],
  summary: "Sendbox webhook",
  description:
    "Receive tracking updates from Sendbox. Signature verification required (no auth cookies).",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: SendboxWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Webhook processed successfully",
      content: {
        "application/json": {
          schema: WebhookResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid webhook payload",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Failed to process webhook",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});

// POST /webhooks/shipping/shippo
registry.registerPath({
  method: "post",
  path: "/webhooks/shipping/shippo",
  tags: ["Shipping - Webhooks"],
  summary: "Shippo webhook",
  description:
    "Receive tracking updates from Shippo. Signature verification required (no auth cookies).",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ShippoWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Webhook processed successfully",
      content: {
        "application/json": {
          schema: WebhookResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid webhook payload",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Failed to process webhook",
      content: {
        "application/json": {
          schema: ShippingErrorResponseSchema,
        },
      },
    },
  },
});
