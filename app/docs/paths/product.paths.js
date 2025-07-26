"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const product_schema_1 = require("../../schemas/product.schema");
const product_response_1 = require("../responses/product.response");
const common_response_1 = require("../responses/common.response");
// Public: Get all active products
registry_1.registry.registerPath({
    method: "get",
    path: "/product",
    summary: "Get all active products",
    tags: ["Products"],
    parameters: [
        {
            name: "shop_id",
            in: "query",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: product_response_1.ProductPublicListResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// Admin: Get all products
registry_1.registry.registerPath({
    method: "get",
    path: "/product/admin",
    summary: "Get all products for admins",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    responses: {
        200: product_response_1.ProductListResponse,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Get products by provider ID
registry_1.registry.registerPath({
    method: "get",
    path: "/product/{provider_id}",
    summary: "Get products by provider ID",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    parameters: [
        {
            name: "provider_id",
            in: "path",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: product_response_1.ProductListResponse,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Public: Get single service
registry_1.registry.registerPath({
    method: "get",
    path: "/product/{product_id}",
    summary: "Get a service by ID (public)",
    tags: ["Products"],
    parameters: [
        {
            name: "product_id",
            in: "path",
            required: true,
            schema: { type: "number" },
        },
        {
            name: "shop_id",
            in: "query",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: product_response_1.SingleProductPublicResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// Admin: Get service by ID
registry_1.registry.registerPath({
    method: "get",
    path: "/product/admin/{product_id}",
    summary: "Get a service by ID (admin)",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    parameters: [
        {
            name: "product_id",
            in: "path",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: product_response_1.SingleProductResponse,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Update a service
registry_1.registry.registerPath({
    method: "patch",
    path: "/product",
    summary: "Update a service",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: product_schema_1.ProductUpdateInputSchema,
                },
            },
        },
    },
    responses: {
        200: product_response_1.ProductUpdated,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Delete single service
registry_1.registry.registerPath({
    method: "delete",
    path: "/product",
    summary: "Delete a single service",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: product_schema_1.DeleteProductInputSchema,
                },
            },
        },
    },
    responses: {
        200: product_response_1.ProductDeleted,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Delete multiple products
registry_1.registry.registerPath({
    method: "delete",
    path: "/product/multiple",
    summary: "Delete multiple products",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: product_schema_1.DeleteMultipleProductsInputSchema,
                },
            },
        },
    },
    responses: {
        200: product_response_1.ProductsDeleted,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Create new service
registry_1.registry.registerPath({
    method: "post",
    path: "/product/create",
    summary: "Create a new service",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: product_schema_1.ProductCreateInputSchema,
                },
            },
        },
    },
    responses: {
        200: product_response_1.ProductCreated,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
