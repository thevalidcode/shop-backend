"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const faq_schema_1 = require("../../schemas/faq.schema");
const faq_response_1 = require("../responses/faq.response");
const common_response_1 = require("../responses/common.response");
// GET /faq?shop_id=123
registry_1.registry.registerPath({
    method: "get",
    path: "/faq",
    summary: "Get all FAQs",
    tags: ["FAQs"],
    parameters: [
        {
            name: "shop_id",
            in: "query",
            required: true,
            description: "Shop ID to filter FAQs",
            schema: { type: "number" },
        },
    ],
    responses: {
        200: faq_response_1.FAQListResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// GET /faq/{faq_id}?shop_id=123
registry_1.registry.registerPath({
    method: "get",
    path: "/faq/{faq_id}",
    summary: "Get FAQ by ID",
    tags: ["FAQs"],
    parameters: [
        {
            name: "faq_id",
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
        200: faq_response_1.FAQObject,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// POST /faq
registry_1.registry.registerPath({
    method: "post",
    path: "/faq",
    summary: "Create a new FAQ",
    tags: ["FAQs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: faq_schema_1.createFAQSchema,
                },
            },
        },
    },
    responses: {
        200: faq_response_1.FAQCreatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// PATCH /faq
registry_1.registry.registerPath({
    method: "patch",
    path: "/faq",
    summary: "Update an FAQ",
    tags: ["FAQs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: faq_schema_1.updateFAQSchema,
                },
            },
        },
    },
    responses: {
        200: faq_response_1.FAQUpdatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /faq
registry_1.registry.registerPath({
    method: "delete",
    path: "/faq",
    summary: "Delete an FAQ",
    tags: ["FAQs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: faq_schema_1.deleteFAQSchema,
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /faq/multiple
registry_1.registry.registerPath({
    method: "delete",
    path: "/faq/multiple",
    summary: "Delete multiple FAQs",
    tags: ["FAQs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: faq_schema_1.deleteMultipleFAQsSchema,
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
