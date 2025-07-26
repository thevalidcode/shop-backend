"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMultipleProductsInputSchema = exports.DeleteProductInputSchema = exports.ProductUpdateInputSchema = exports.ProductCreateInputSchema = exports.ProductPublicSchema = exports.ProductSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.ProductSchema = zod_1.z
    .object({
    id: zod_1.z.number(),
    uid: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    category: zod_1.z.string(),
    type: zod_1.z.string(),
    min: zod_1.z.number(),
    max: zod_1.z.number(),
    position: zod_1.z.number(),
    status: zod_1.z.string(),
    stock: zod_1.z.number(),
    sku: zod_1.z.string().nullable(),
    image_url: zod_1.z.string().nullable(),
    gallery_urls: zod_1.z.array(zod_1.z.string()).nullable(),
    tags: zod_1.z.array(zod_1.z.string()).nullable(),
    is_featured: zod_1.z.boolean(),
    brand: zod_1.z.string().nullable(),
    weight: zod_1.z.number().nullable(),
    dimensions: zod_1.z.string().nullable(),
    price: zod_1.z.number(),
    compare_price: zod_1.z.number().nullable(),
    discount_type: zod_1.z.string().nullable(),
    discount_value: zod_1.z.number().nullable(),
    slug: zod_1.z.string().min(1),
    shop_id: zod_1.z.number(),
    timestamp: zod_1.z.string(),
})
    .openapi("Product");
exports.ProductPublicSchema = zod_1.z
    .object({
    id: zod_1.z.number(),
    uid: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    category: zod_1.z.string(),
    type: zod_1.z.string(),
    min: zod_1.z.number(),
    max: zod_1.z.number(),
    price: zod_1.z.number(),
    status: zod_1.z.string(),
    stock: zod_1.z.number(),
    image_url: zod_1.z.string().nullable(),
    gallery_urls: zod_1.z.array(zod_1.z.string()).nullable(),
    is_featured: zod_1.z.boolean(),
    brand: zod_1.z.string().nullable(),
    compare_price: zod_1.z.number().nullable(),
    slug: zod_1.z.string().min(1),
    discount_type: zod_1.z.string().nullable(),
    discount_value: zod_1.z.number().nullable(),
    timestamp: zod_1.z.string(),
})
    .openapi("ProductPublic");
exports.ProductCreateInputSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string(),
    type: zod_1.z.string(),
    min: zod_1.z.number(),
    max: zod_1.z.number(),
    price: zod_1.z.number(),
    position: zod_1.z.number().optional(),
    stock: zod_1.z.number().optional(),
    sku: zod_1.z.string().optional(),
    image_url: zod_1.z.string().optional(),
    gallery_urls: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    is_featured: zod_1.z.boolean().optional(),
    brand: zod_1.z.string().optional(),
    weight: zod_1.z.number().optional(),
    dimensions: zod_1.z.string().optional(),
    slug: zod_1.z.string().min(1),
    compare_price: zod_1.z.number().optional(),
    discount_type: zod_1.z.string().optional(),
    discount_value: zod_1.z.number().optional(),
});
exports.ProductUpdateInputSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional(),
    price: zod_1.z.number().optional(),
    position: zod_1.z.number().optional(),
    status: zod_1.z.string().optional(),
    stock: zod_1.z.number().optional(),
    sku: zod_1.z.string().optional(),
    image_url: zod_1.z.string().optional(),
    gallery_urls: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    is_featured: zod_1.z.boolean().optional(),
    brand: zod_1.z.string().optional(),
    weight: zod_1.z.number().optional(),
    dimensions: zod_1.z.string().optional(),
    compare_price: zod_1.z.number().optional(),
    discount_type: zod_1.z.string().optional(),
    slug: zod_1.z.string().min(1),
    discount_value: zod_1.z.number().optional(),
});
exports.DeleteProductInputSchema = zod_1.z.object({
    uid: zod_1.z.string(),
});
exports.DeleteMultipleProductsInputSchema = zod_1.z.object({
    uids: zod_1.z.array(zod_1.z.string()),
});
