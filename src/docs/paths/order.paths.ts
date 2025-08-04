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
  placeOrderSchema,
  updateOrderSchema,
} from "../../schemas/order.schema";

// GET /order
registry.registerPath({
  method: "get",
  path: "/order",
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
  path: "/order/admin",
  summary: "Get all orders for admins",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: OrderListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /order/:orderUid
registry.registerPath({
  method: "get",
  path: "/order/{orderUid}",
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

// GET /order/admin/:orderUid
registry.registerPath({
  method: "get",
  path: "/order/admin/{orderUid}",
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

// POST /order (Admin)
registry.registerPath({
  method: "post",
  path: "/order",
  summary: "Create a new order",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: placeOrderSchema,
        },
      },
    },
  },
  responses: {
    200: OrderCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /order/{orderUid} (Admin)
registry.registerPath({
  method: "patch",
  path: "/order/{orderUid}",
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

// DELETE /order/:orderUid (Admin)
registry.registerPath({
  method: "delete",
  path: "/order",
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

// GET /order/status/:status
registry.registerPath({
  method: "get",
  path: "/order/status/{status}",
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

// POST /order/bulk (Admin)
registry.registerPath({
  method: "post",
  path: "/order/bulk",
  summary: "Create bulk orders",
  tags: ["Orders"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: bulkCreateSchema,
        },
      },
    },
  },
  responses: {
    200: OrderCreatedListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /order/bulk/status (Admin)
registry.registerPath({
  method: "patch",
  path: "/order/bulk/status",
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
