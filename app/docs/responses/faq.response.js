"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQObject = exports.FAQUpdatedResponse = exports.FAQCreatedResponse = exports.FAQListResponse = void 0;
const zod_1 = require("zod");
const faq_schema_1 = require("../../schemas/faq.schema");
exports.FAQListResponse = {
    description: "List of all FAQs",
    content: {
        "application/json": {
            schema: zod_1.z.array(faq_schema_1.FAQSchema),
        },
    },
};
exports.FAQCreatedResponse = {
    description: "Successfully created an FAQ",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("FAQ added successfully."),
                faq: faq_schema_1.FAQSchema,
            }),
        },
    },
};
exports.FAQUpdatedResponse = {
    description: "Successfully updated an FAQ",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("FAQ updated successfully."),
                faq: faq_schema_1.FAQSchema,
            }),
        },
    },
};
exports.FAQObject = {
    description: "Single FAQ object",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                faq: faq_schema_1.FAQSchema,
            }),
        },
    },
};
