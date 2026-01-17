import { registry } from "../components/registry";
import {
  UpdateOrderSchema,
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
  description: "Retrieve all orders for the authenticated user with items and billing info",
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
  description: "Retrieve detailed information about a specific order including items and billing info",
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
  description: "Retrieve user's orders filtered by status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)",
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

/**
 * ADMIN ORDER ENDPOINTS
 */

// GET /admin/orders (Admin)
registry.registerPath({
  method: "get",
  path: "/admin/orders",
  tags: ["Admin - Orders"],
  summary: "Get all orders (Admin)",
  description: "Retrieve all orders in the shop with user info, items, and billing details",
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

// GET /admin/orders/:orderUid (Admin)
registry.registerPath({
  method: "get",
  path: "/admin/orders/{orderUid}",
  tags: ["Admin - Orders"],
  summary: "Get single order (Admin)",
  description: "Retrieve detailed order information with full user data, items, and billing info",
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
  description: "Update order details such as status or notes. Common flow: PENDING → PROCESSING → SHIPPED → DELIVERED",
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
  description: "Permanently delete an order. Note: Consider using status='CANCELLED' instead for record keeping",
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

// POST /admin/orders/bulk-update (Admin)
registry.registerPath({
  method: "post",
  path: "/admin/orders/bulk-update",
  tags: ["Admin - Orders"],
  summary: "Bulk update orders (Admin)",
  description: "Update status for multiple orders at once. Maximum 100 orders per request",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: BulkStatusUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Bulk update successful",
      content: {
        "application/json": {
          schema: BulkUpdateResponseSchema,
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
