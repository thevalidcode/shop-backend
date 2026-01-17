import { registry } from "../components/registry";
import { z } from "zod";
import {
  ShopDataResponse,
  DesignStylesResponse,
  ExchangeRatesResponse,
  NotFound,
  GeneralDataResponse,
  OnboardingCompletedResponse,
} from "../responses/shop.response";
import {
  ServerError,
  SuccessResponse,
} from "../responses/common.response";
import {
  ShopGeneralDataRequestSchema,
  UpdateGeneralDataRequestSchema,
  UpdateStylesRequestSchema,
} from "../../schemas/shop.schema";

// GET /shops/data
registry.registerPath({
  method: "get",
  path: "/shops/data",
  summary: "Get the shop data for a custom domain",
  tags: ["Shop"],
  responses: {
    200: ShopDataResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /shops/{shopId}/general-data
registry.registerPath({
  method: "get",
  path: "/shops/{shopId}/general-data",
  summary: "Get the general data for a shop",
  tags: ["Shop"],
  request: {
    params: ShopGeneralDataRequestSchema,
  },
  responses: {
    200: GeneralDataResponse,
    404: NotFound,
    500: ServerError,
  },
});

// PATCH /shops/general-data
registry.registerPath({
  method: "patch",
  path: "/shops/general-data",
  summary: "Update the general data for a shop",
  tags: ["Shop"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateGeneralDataRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /shops/{shopId}/styles
registry.registerPath({
  method: "get",
  path: "/shops/{shopId}/styles",
  summary: "Get design styles for a shop",
  tags: ["Shop"],
  request: {
    params: ShopGeneralDataRequestSchema,
  },
  responses: {
    200: DesignStylesResponse,
    500: ServerError,
  },
});

// PATCH /shops/styles
registry.registerPath({
  method: "patch",
  path: "/shops/styles",
  summary: "Update the styles for a shop",
  tags: ["Shop"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateStylesRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    404: NotFound,
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

// Complete onboarding
registry.registerPath({
  method: "put",
  path: "/shops/{shopId}/onboarding-completed",
  summary: "Mark onboarding as completed",
  tags: ["Admins"],
  request: {
    params: ShopGeneralDataRequestSchema,
  },
  responses: {
    200: OnboardingCompletedResponse,
    500: ServerError,
  },
});
