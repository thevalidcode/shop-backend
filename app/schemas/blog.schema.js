"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogsSchema = exports.deleteMultipleBlogsSchema = exports.deleteBlogSchema = exports.updateBlogSchema = exports.BlogSchema = exports.createBlogSchema = exports.blogIdSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.blogIdSchema = zod_1.z.object({
    blog_id: zod_1.z.coerce.number(),
});
exports.createBlogSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
exports.BlogSchema = zod_1.z
    .object({
    id: zod_1.z.coerce.number(),
    title: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    status: zod_1.z.boolean(),
    position: zod_1.z.coerce.number(),
    description: zod_1.z.string().optional(),
})
    .openapi("Blog");
exports.updateBlogSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    title: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
exports.deleteBlogSchema = zod_1.z.object({
    uid: zod_1.z.string(),
});
exports.deleteMultipleBlogsSchema = zod_1.z.object({
    uids: zod_1.z.array(zod_1.z.string()),
});
exports.getBlogsSchema = zod_1.z.object({ shop_id: zod_1.z.coerce.number() });
