import { registry } from "../components/registry";
import {
  ShopDataResponse,
  DesignStylesResponse,
  SiteDataResponse,
  ExchangeRatesResponse,
  CurrentUserResponse,
  CurrentAdminResponse,
  NotFound,
} from "../responses/shop.response";
import { ServerError, Forbidden } from "../responses/common.response";
import { 
  ShopsListResponseSchema, 
  ShopInfoResponseSchema 
} from "../../schemas/shop.schema";

// GET /shops/data
registry.registerPath({
  method: "get",
  path: "/shops/data",
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

// GET /shops/styles
registry.registerPath({
  method: "get",
  path: "/shops/styles",
  summary: "Get design styles for a shop",
  tags: ["Shop"],
  parameters: [
    {
      name: "shopId",
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

// GET /shops/site-data
registry.registerPath({
  method: "get",
  path: "/shops/site-data",
  summary: "Get general site data for a shop",
  tags: ["Shop"],
  parameters: [
    {
      name: "shopId",
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

// GET /shops/rates
registry.registerPath({
  method: "get",
  path: "/shops/rates",
  summary: "Get latest exchange rates",
  tags: ["Shop"],
  responses: {
    200: ExchangeRatesResponse,
    500: ServerError,
  },
});

// GET /shops/current-user
registry.registerPath({
  method: "get",
  path: "/shops/current-user",
  summary: "Get the currently authenticated user",
  tags: ["Shop"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: CurrentUserResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /shops/current-admin
registry.registerPath({
  method: "get",
  path: "/shops/current-admin",
  summary: "Get the currently authenticated admin",
  tags: ["Shop"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: CurrentAdminResponse,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});

// NEW: GET /shops/discover
registry.registerPath({
  method: "get",
  path: "/shops/discover",
  summary: "Discover All Active Shops",
  description:
    "Get a list of all active shops on the platform.\n\n" +
    "### 🔍 What It Returns:\n" +
    "- List of active shops with basic info\n" +
    "- Shop domains, names, and settings\n" +
    "- Useful for shop discovery features\n\n" +
    "### 🌐 Use Cases:\n" +
    "- Shop directory/marketplace\n" +
    "- Letting users browse available shops\n" +
    "- Platform analytics and overview",
  tags: ["Shop"],
  responses: {
    200: {
      description: "List of active shops",
      content: {
        "application/json": {
          schema: ShopsListResponseSchema,
        },
      },
    },
    500: ServerError,
  },
});

// NEW: GET /shops/info/{identifier}
registry.registerPath({
  method: "get",
  path: "/shops/info/{identifier}",
  summary: "Get Shop Information by Domain or ID",
  description:
    "Get detailed information about a specific shop.\n\n" +
    "### 🔍 What It Does:\n" +
    "- Accepts shop domain or shopId as identifier\n" +
    "- Returns shop details, settings, and status\n" +
    "- Public endpoint for shop information\n\n" +
    "### 📝 Examples:\n" +
    "- `/shop/info/awesomestore` (by domain)\n" +
    "- `/shop/info/123` (by shopId)\n\n" +
    "### ✅ Use This To:\n" +
    "- Validate shop existence before user registration\n" +
    "- Display shop info to potential customers\n" +
    "- Check shop status and settings",
  tags: ["Shop"],
  parameters: [
    {
      name: "identifier",
      in: "path",
      required: true,
      description: "Shop domain (e.g., 'awesomestore') or shopId (e.g., '123')",
      schema: { 
        type: "string",
        examples: ["awesomestore", "123"]
      },
    },
  ],
  responses: {
    200: {
      description: "Shop information",
      content: {
        "application/json": {
          schema: ShopInfoResponseSchema,
        },
      },
    },
    404: NotFound,
    500: ServerError,
  },
});
