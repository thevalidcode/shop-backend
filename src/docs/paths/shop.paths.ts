import { registry } from "../components/registry";
import {
  ShopDataResponse,
  DesignStylesResponse,
  SiteDataResponse,
  ExchangeRatesResponse,
  CurrentUserResponse,
  CurrentAdminResponse,
  CSrfTokenResponse,
  NotFound,
} from "../responses/shop.response";
import { ServerError, Forbidden } from "../responses/common.response";

// GET /shop/data
registry.registerPath({
  method: "get",
  path: "/shop/data",
  summary: "Get the shop data for a custom domain",
  tags: ["Shop"],
  parameters: [
    {
      name: "domain",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: ShopDataResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /shop/csrf-token
registry.registerPath({
  method: "get",
  path: "/shop/csrf-token",
  description:
    "Retrieve a CSRF token which must be included in all subsequent requests that mutate data (e.g., POST, PATCH, DELETE). The frontend must extract the token from this response and send it in the 'X-CSRF-Token' header for every protected request. This ensures protection against Cross-Site Request Forgery (CSRF) attacks.",
  summary: "Get the csrf token for a custom domain",
  tags: ["Shop"],
  parameters: [
    {
      name: "domain",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: CSrfTokenResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /shop/styles
registry.registerPath({
  method: "get",
  path: "/shop/styles",
  summary: "Get design styles for a shop",
  tags: ["Shop"],
  parameters: [
    {
      name: "shop_id",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: DesignStylesResponse,
    500: ServerError,
  },
});

// GET /shop/site-data
registry.registerPath({
  method: "get",
  path: "/shop/site-data",
  summary: "Get general site data for a shop",
  tags: ["Shop"],
  parameters: [
    {
      name: "shop_id",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SiteDataResponse,
    500: ServerError,
  },
});

// GET /shop/rates
registry.registerPath({
  method: "get",
  path: "/shop/rates",
  summary: "Get latest exchange rates",
  tags: ["Shop"],
  responses: {
    200: ExchangeRatesResponse,
    500: ServerError,
  },
});

// GET /shop/current-user
registry.registerPath({
  method: "get",
  path: "/shop/current-user",
  summary: "Get the currently authenticated user",
  tags: ["Shop"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: CurrentUserResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /shop/current-admin
registry.registerPath({
  method: "get",
  path: "/shop/current-admin",
  summary: "Get the currently authenticated admin",
  tags: ["Shop"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: CurrentAdminResponse,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});
