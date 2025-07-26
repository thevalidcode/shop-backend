"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const blog_schema_1 = require("../../schemas/blog.schema");
const blog_response_1 = require("../responses/blog.response");
const common_response_1 = require("../responses/common.response");
// GET /blog?shop_id=123
registry_1.registry.registerPath({
    method: "get",
    path: "/blog",
    summary: "Get all blogs",
    tags: ["Blogs"],
    parameters: [
        {
            name: "shop_id",
            in: "query",
            required: true,
            description: "Shop ID to filter blogs",
            schema: { type: "number" },
        },
    ],
    responses: {
        200: blog_response_1.BlogListResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// GET /blog/{blog_id}?shop_id=123
registry_1.registry.registerPath({
    method: "get",
    path: "/blog/{blog_id}",
    summary: "Get blog by ID",
    tags: ["Blogs"],
    parameters: [
        {
            name: "blog_id",
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
        200: blog_response_1.BlogObject,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// POST /blog
registry_1.registry.registerPath({
    method: "post",
    path: "/blog",
    summary: "Create a new blog",
    tags: ["Blogs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: blog_schema_1.createBlogSchema,
                },
            },
        },
    },
    responses: {
        200: blog_response_1.BlogCreatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// PATCH /blog
registry_1.registry.registerPath({
    method: "patch",
    path: "/blog",
    summary: "Update a blog",
    tags: ["Blogs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: blog_schema_1.updateBlogSchema,
                },
            },
        },
    },
    responses: {
        200: blog_response_1.BlogUpdatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /blog
registry_1.registry.registerPath({
    method: "delete",
    path: "/blog",
    summary: "Delete a blog",
    tags: ["Blogs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: blog_schema_1.deleteBlogSchema,
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
// DELETE /blog/multiple
registry_1.registry.registerPath({
    method: "delete",
    path: "/blog/multiple",
    summary: "Delete multiple blogs",
    tags: ["Blogs"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: blog_schema_1.deleteMultipleBlogsSchema,
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
