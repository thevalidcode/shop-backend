import { registry } from "../components/registry";
import {
  CreateShippingInfoSchema,
  UpdateShippingInfoSchema,
  GetShippingInfoQuerySchema,
  ShippingInfoParamsSchema,
} from "../../schemas/shippingInfo.schema";

import {
  CreateShippingInfoResponse,
  GetShippingInfoListResponse,
  GetShippingInfoResponse,
  UpdateShippingInfoResponse,
  DeleteShippingInfoResponse,
  GetDefaultShippingInfoResponse,
} from "../responses/shippingInfo.response";

import {
  BadRequest,
  ServerError,
  NotFound,
} from "../responses/common.response";
import { UidSchema } from "../../schemas/common.schema";

// POST /shipping-info - Create shipping information
registry.registerPath({
  method: "post",
  path: "/shipping-info",
  summary: "Create new shipping information",
  tags: ["Shipping Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateShippingInfoSchema,
        },
      },
    },
  },
  responses: {
    201: CreateShippingInfoResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /shipping-info - Get all shipping information for user
registry.registerPath({
  method: "get",
  path: "/shipping-info",
  summary: "Get all shipping information for authenticated user",
  tags: ["Shipping Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: { query: GetShippingInfoQuerySchema },
  responses: {
    200: GetShippingInfoListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /shipping-info/default - Get default shipping information
registry.registerPath({
  method: "get",
  path: "/shipping-info/default",
  summary: "Get default shipping information",
  tags: ["Shipping Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: GetDefaultShippingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// GET /shipping-info/:uid - Get shipping information by UID
registry.registerPath({
  method: "get",
  path: "/shipping-info/{uid}",
  summary: "Get specific shipping information by UID",
  tags: ["Shipping Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: GetShippingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// PUT /shipping-info/:uid - Update shipping information
registry.registerPath({
  method: "put",
  path: "/shipping-info/{uid}",
  summary: "Update shipping information",
  tags: ["Shipping Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateShippingInfoSchema,
        },
      },
    },
    params: UidSchema,
  },
  responses: {
    200: UpdateShippingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// DELETE /shipping-info/:uid - Delete shipping information
registry.registerPath({
  method: "delete",
  path: "/shipping-info/{uid}",
  summary: "Delete shipping information",
  tags: ["Shipping Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: DeleteShippingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});
