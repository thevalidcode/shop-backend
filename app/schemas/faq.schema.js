"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleFAQsSchema = exports.deleteFAQSchema = exports.updateFAQSchema = exports.FAQSchema = exports.createFAQSchema = exports.faqIdSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.faqIdSchema = zod_1.z.object({
    faq_id: zod_1.z.coerce.number(),
});
exports.createFAQSchema = zod_1.z.object({
    question: zod_1.z.string(),
    slug: zod_1.z.string().min(1),
    answer: zod_1.z.string(),
});
exports.FAQSchema = zod_1.z
    .object({
    id: zod_1.z.coerce.number(),
    slug: zod_1.z.string().min(1),
    question: zod_1.z.string().min(1),
    answer: zod_1.z.string().min(1),
    status: zod_1.z.boolean(),
    position: zod_1.z.coerce.number(),
})
    .openapi("FAQ");
exports.updateFAQSchema = exports.createFAQSchema.extend({
    uid: zod_1.z.string(),
});
exports.deleteFAQSchema = zod_1.z.object({
    uid: zod_1.z.string(),
});
exports.deleteMultipleFAQsSchema = zod_1.z.object({
    uids: zod_1.z.array(zod_1.z.string()),
});
