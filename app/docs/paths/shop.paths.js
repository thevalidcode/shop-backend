"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const shop_response_1 = require("../responses/shop.response");
const common_response_1 = require("../responses/common.response");
// GET /shop/data
registry_1.registry.registerPath({
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
        200: shop_response_1.ShopDataResponse,
        404: shop_response_1.NotFound,
        500: common_response_1.ServerError,
    },
});
// GET /shop/csrf-token
registry_1.registry.registerPath({
    method: "get",
    path: "/shop/csrf-token",
    description: "Retrieve a CSRF token which must be included in all subsequent requests that mutate data (e.g., POST, PATCH, DELETE). The frontend must extract the token from this response and send it in the 'X-CSRF-Token' header for every protected request. This ensures protection against Cross-Site Request Forgery (CSRF) attacks.",
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
        200: shop_response_1.CSrfTokenResponse,
        404: shop_response_1.NotFound,
        500: common_response_1.ServerError,
    },
});
// GET /shop/styles
registry_1.registry.registerPath({
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
        200: shop_response_1.DesignStylesResponse,
        500: common_response_1.ServerError,
    },
});
// GET /shop/site-data
registry_1.registry.registerPath({
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
        200: shop_response_1.SiteDataResponse,
        500: common_response_1.ServerError,
    },
});
// GET /shop/rates
registry_1.registry.registerPath({
    method: "get",
    path: "/shop/rates",
    summary: "Get latest exchange rates",
    tags: ["Shop"],
    responses: {
        200: shop_response_1.ExchangeRatesResponse,
        500: common_response_1.ServerError,
    },
});
// GET /shop/current-user
registry_1.registry.registerPath({
    method: "get",
    path: "/shop/current-user",
    summary: "Get the currently authenticated user",
    tags: ["Shop"],
    security: [{ CookieAuth: [] }],
    responses: {
        200: shop_response_1.CurrentUserResponse,
        404: shop_response_1.NotFound,
        500: common_response_1.ServerError,
    },
});
// GET /shop/current-admin
registry_1.registry.registerPath({
    method: "get",
    path: "/shop/current-admin",
    summary: "Get the currently authenticated admin",
    tags: ["Shop"],
    security: [{ CookieAuth: [] }],
    responses: {
        200: shop_response_1.CurrentAdminResponse,
        403: common_response_1.Forbidden,
        404: shop_response_1.NotFound,
        500: common_response_1.ServerError,
    },
});
