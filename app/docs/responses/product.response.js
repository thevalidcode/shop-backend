"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductUpdated = exports.ProductsDeleted = exports.ProductDeleted = exports.ProductCreated = exports.SingleProductPublicResponse = exports.SingleProductResponse = exports.ProductListResponse = exports.ProductPublicListResponse = void 0;
const zod_1 = require("zod");
const product_schema_1 = require("../../schemas/product.schema");
exports.ProductPublicListResponse = {
    description: "List of available products (public users)",
    content: {
        "application/json": {
            schema: zod_1.z.array(product_schema_1.ProductPublicSchema),
        },
    },
};
exports.ProductListResponse = {
    description: "List of available products (admin)",
    content: {
        "application/json": {
            schema: zod_1.z.array(product_schema_1.ProductSchema),
        },
    },
};
exports.SingleProductResponse = {
    description: "A single service object",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                service: product_schema_1.ProductSchema,
            }),
        },
    },
};
exports.SingleProductPublicResponse = {
    description: "A single service object",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                service: product_schema_1.ProductPublicSchema,
            }),
        },
    },
};
exports.ProductCreated = {
    description: "Product created successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Product added successfully."),
                service: product_schema_1.ProductSchema,
            }),
        },
    },
};
exports.ProductDeleted = {
    description: "Product deleted successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Product deleted successfully."),
            }),
        },
    },
};
exports.ProductsDeleted = {
    description: "Multiple products deleted successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Products deleted successfully."),
            }),
        },
    },
};
exports.ProductUpdated = {
    description: "Product updated successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Product updated successfully."),
                service: product_schema_1.ProductSchema,
            }),
        },
    },
};
