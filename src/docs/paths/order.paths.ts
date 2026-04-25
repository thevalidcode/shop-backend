import { registry } from "../components/registry";
import {
  UpdateOrderSchema,
  UpdateOrderByUserSchema,
  RefundRequestSchema,
  UpdateShippingInfoSchema,
  VerifyPaymentSchema,
  BulkStatusUpdateSchema,
  GetOrdersByStatusSchema,
  OrderUidSchema,
} from "../../schemas/order.schema";
import {
  GetOrdersResponseSchema,
  GetOrdersAdminResponseSchema,
  OrderResponseSchema,
  OrderAdminResponseSchema,
  UpdateOrderResponseSchema,
  DeleteOrderResponseSchema,
  BulkUpdateResponseSchema,
  OrderErrorResponseSchema,
  OrderValidationErrorResponseSchema,
} from "../responses/order.response";

/**
 * USER ORDER ENDPOINTS
 */

// GET /orders (User)
registry.registerPath({
  method: "get",
  path: "/orders",
  tags: ["Orders"],
  summary: "Get user's orders",
  description:
    "Retrieve all orders for the authenticated user with items and shipping information",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "Orders retrieved successfully",
      content: {
        "application/json": {
          schema: GetOrdersResponseSchema,
        },
      },
    },
    400: {
      description: "Authentication error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// GET /orders/:orderUid (User)
registry.registerPath({
  method: "get",
  path: "/orders/{orderUid}",
  tags: ["Orders"],
  summary: "Get single order",
  description:
    "Retrieve detailed information about a specific order including items and shipping information",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
  },
  responses: {
    200: {
      description: "Order retrieved successfully",
      content: {
        "application/json": {
          schema: OrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// GET /orders/status/:status (User)
registry.registerPath({
  method: "get",
  path: "/orders/status/{status}",
  tags: ["Orders"],
  summary: "Get orders by status",
  description:
    "Retrieve user's orders filtered by status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: GetOrdersByStatusSchema,
  },
  responses: {
    200: {
      description: "Orders retrieved successfully",
      content: {
        "application/json": {
          schema: GetOrdersResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// PATCH /orders/:orderUid (User)
registry.registerPath({
  method: "patch",
  path: "/orders/{orderUid}",
  tags: ["Orders"],
  summary: "Update order",
  description:
    "Update order notes or mark order as received. Can only mark as received if order status is SHIPPED or DELIVERED",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateOrderByUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Order updated successfully",
      content: {
        "application/json": {
          schema: UpdateOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or invalid status for marking as received",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// PATCH /orders/:orderUid/cancel-request (User)
registry.registerPath({
  method: "patch",
  path: "/orders/{orderUid}/cancel-request",
  tags: ["Orders"],
  summary: "Cancel order",
  description:
    "User cancels their order. Only allowed for PENDING or VERIFYING_PAYMENT orders.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
  },
  responses: {
    200: {
      description: "Order canceled successfully",
      content: {
        "application/json": {
          schema: UpdateOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or order cannot be canceled",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// POST /orders/:orderUid/refund-request (User)
registry.registerPath({
  method: "post",
  path: "/orders/{orderUid}/refund-request",
  tags: ["Orders"],
  summary: "Request refund",
  description:
    "Submit a refund request for an order. Must provide a reason (10-1000 characters).",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: RefundRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Refund request submitted successfully",
      content: {
        "application/json": {
          schema: UpdateOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or order not eligible for refund",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// PATCH /orders/:orderUid/shipping (User)
registry.registerPath({
  method: "patch",
  path: "/orders/{orderUid}/shipping",
  tags: ["Orders"],
  summary: "Update shipping information",
  description:
    "Update shipping information for an order. Only allowed for PENDING orders.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateShippingInfoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Shipping information updated successfully",
      content: {
        "application/json": {
          schema: UpdateOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or order cannot be updated",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order or shipping information not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * ADMIN ORDER ENDPOINTS
 */

// GET /admin/orders (Admin)
registry.registerPath({
  method: "get",
  path: "/admin/orders",
  tags: ["Admin - Orders"],
  summary: "Get all orders (Admin)",
  description:
    "Retrieve all orders in the shop with user info, items, and billing details",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "Orders retrieved successfully",
      content: {
        "application/json": {
          schema: GetOrdersAdminResponseSchema,
        },
      },
    },
    400: {
      description: "Authentication error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// GET /orders/admin/status/:status (Admin)
registry.registerPath({
  method: "get",
  path: "/orders/admin/status/{status}",
  tags: ["Orders"],
  summary: "Get orders by status",
  description:
    "Retrieve all orders filtered by status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: GetOrdersByStatusSchema,
  },
  responses: {
    200: {
      description: "Orders retrieved successfully",
      content: {
        "application/json": {
          schema: GetOrdersResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// GET /admin/orders/:orderUid (Admin)
registry.registerPath({
  method: "get",
  path: "/admin/orders/{orderUid}",
  tags: ["Admin - Orders"],
  summary: "Get single order (Admin)",
  description:
    "Retrieve detailed order information with full user data, items, and shipping information",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
  },
  responses: {
    200: {
      description: "Order retrieved successfully",
      content: {
        "application/json": {
          schema: OrderAdminResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// PATCH /admin/orders/:orderUid (Admin)
registry.registerPath({
  method: "patch",
  path: "/admin/orders/{orderUid}",
  tags: ["Admin - Orders"],
  summary: "Update order (Admin)",
  description:
    "Update order details such as status or notes. Common flow: PENDING → PROCESSING → SHIPPED → DELIVERED",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateOrderSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Order updated successfully",
      content: {
        "application/json": {
          schema: UpdateOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

// DELETE /admin/orders/:orderUid (Admin)
registry.registerPath({
  method: "delete",
  path: "/admin/orders/{orderUid}",
  tags: ["Admin - Orders"],
  summary: "Delete order (Admin)",
  description:
    "Permanently delete an order. Note: Consider using status='CANCELLED' instead for record keeping",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
  },
  responses: {
    200: {
      description: "Order deleted successfully",
      content: {
        "application/json": {
          schema: DeleteOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});


// POST /admin/orders/:orderUid/verify-payment (Admin)
registry.registerPath({
  method: "post",
  path: "/admin/orders/{orderUid}/verify-payment",
  tags: ["Admin - Orders"],
  summary: "Verify payment (Admin)",
  description:
    "Verify or reject a payment for an order. If verified, order moves to PROCESSING. If rejected, order is CANCELED.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: OrderUidSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: VerifyPaymentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Payment verification completed",
      content: {
        "application/json": {
          schema: UpdateOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or order not in VERIFYING_PAYMENT status",
      content: {
        "application/json": {
          schema: OrderValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: OrderErrorResponseSchema,
        },
      },
    },
  },
});

