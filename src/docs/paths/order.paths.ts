import { registry } from "../components/registry";
import {
  OrderCreatedResponse,
  OrderUpdatedResponse,
  OrderListResponse,
  OrderSingleResponseForUser,
  OrderCreatedListResponse,
  OrderPublicListResponse,
  OrderSingleResponseForAdmin,
} from "../responses/order.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";
import {
  bulkCreateSchema,
  bulkStatusUpdateSchema,
  updateOrderSchema,
} from "../../schemas/order.schema";

// GET /orders
registry.registerPath({
  method: "get",
  path: "/orders",
  summary: "Get all user's orders",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: OrderPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/orders/admin/all",
  summary: "Get all orders for admins",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: OrderListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /orders/:orderUid
registry.registerPath({
  method: "get",
  path: "/orders/{orderUid}",
  summary: "Get a order for user by uid",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [
    {
      name: "orderUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: OrderSingleResponseForUser,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /orders/admin/:orderUid
registry.registerPath({
  method: "get",
  path: "/orders/admin/{orderUid}",
  summary: "Get a order for admins by uid",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [
    {
      name: "orderUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: OrderSingleResponseForAdmin,
    400: BadRequest,
    500: ServerError,
  },
});

// PATCH /orders/{orderUid} (Admin)
registry.registerPath({
  method: "patch",
  path: "/orders/admin/{orderUid}",
  summary: "Update a order",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [
    {
      name: "orderUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateOrderSchema,
        },
      },
    },
  },
  responses: {
    200: OrderUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /orders/:orderUid (Admin)
registry.registerPath({
  method: "delete",
  path: "/orders/admin",
  summary: "Delete a single order",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [
    {
      name: "orderUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// GET /orders/status/:status
registry.registerPath({
  method: "get",
  path: "/orders/status/{status}",
  summary: "Get all orders for admin or user orders by status",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [
    {
      name: "status",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: OrderListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// PATCH /orders/bulk/status (Admin)
registry.registerPath({
  method: "patch",
  path: "/orders/admin/bulk/status",
  summary: "Update bulk order status",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: bulkStatusUpdateSchema,
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
