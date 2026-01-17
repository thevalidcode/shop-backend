import { registry } from "../components/registry";
import {
  CreateBillingInfoSchema,
  UpdateBillingInfoSchema,
  GetBillingInfoQuerySchema,
  BillingInfoParamsSchema,
} from "../../schemas/billingInfo.schema";

import {
  CreateBillingInfoResponse,
  GetBillingInfoListResponse,
  GetBillingInfoResponse,
  UpdateBillingInfoResponse,
  DeleteBillingInfoResponse,
  GetDefaultBillingInfoResponse,
} from "../responses/billingInfo.response";

import {
  BadRequest,
  ServerError,
  NotFound,
} from "../responses/common.response";
import { UidSchema } from "../../schemas/common.schema";

// POST /billing-info - Create billing information
registry.registerPath({
  method: "post",
  path: "/billing-info",
  summary: "Create new billing information",
  tags: ["Billing Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateBillingInfoSchema,
        },
      },
    },
  },
  responses: {
    201: CreateBillingInfoResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /billing-info - Get all billing information for user
registry.registerPath({
  method: "get",
  path: "/billing-info",
  summary: "Get all billing information for authenticated user",
  tags: ["Billing Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: { query: GetBillingInfoQuerySchema },
  responses: {
    200: GetBillingInfoListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /billing-info/default - Get default billing information
registry.registerPath({
  method: "get",
  path: "/billing-info/default",
  summary: "Get default billing information",
  tags: ["Billing Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: GetDefaultBillingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// GET /billing-info/:uid - Get billing information by UID
registry.registerPath({
  method: "get",
  path: "/billing-info/{uid}",
  summary: "Get specific billing information by UID",
  tags: ["Billing Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: GetBillingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// PUT /billing-info/:uid - Update billing information
registry.registerPath({
  method: "put",
  path: "/billing-info/{uid}",
  summary: "Update billing information",
  tags: ["Billing Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateBillingInfoSchema,
        },
      },
    },
    params: UidSchema,
  },
  responses: {
    200: UpdateBillingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

// DELETE /billing-info/:uid - Delete billing information
registry.registerPath({
  method: "delete",
  path: "/billing-info/{uid}",
  summary: "Delete billing information",
  tags: ["Billing Info"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: DeleteBillingInfoResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});
