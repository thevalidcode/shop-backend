"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogObject = exports.BlogUpdatedResponse = exports.BlogCreatedResponse = exports.BlogListResponse = void 0;
const zod_1 = require("zod");
const blog_schema_1 = require("../../schemas/blog.schema");
exports.BlogListResponse = {
    description: "List of all blogs",
    content: {
        "application/json": {
            schema: zod_1.z.array(blog_schema_1.BlogSchema),
        },
    },
};
exports.BlogCreatedResponse = {
    description: "Successfully created a blog",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Blog added successfully."),
                blog: blog_schema_1.BlogSchema,
            }),
        },
    },
};
exports.BlogUpdatedResponse = {
    description: "Successfully updated a blog",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Blog updated successfully."),
                blog: blog_schema_1.BlogSchema,
            }),
        },
    },
};
exports.BlogObject = {
    description: "Single blog object",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                blog: blog_schema_1.BlogSchema,
            }),
        },
    },
};
