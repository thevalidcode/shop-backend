"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkStatusUpdateSchema = exports.bulkCreateSchema = exports.getOrdersByStatusSchema = exports.updateOrderSchema = exports.placeOrderSchema = exports.OrderSchema = exports.OrderPublicSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
const orderStatusEnum = zod_1.z.enum([
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Completed",
    "Canceled",
    "Failed",
    "Refunded",
    "Returned",
]);
exports.OrderPublicSchema = zod_1.z
    .object({
    id: zod_1.z.coerce.number(),
    uid: zod_1.z.string(),
    user_uid: zod_1.z.string(),
    product_id: zod_1.z.coerce.number(),
    price: zod_1.z.coerce.number(),
    quantity: zod_1.z.coerce.number(),
    currency: zod_1.z.string(),
    status: orderStatusEnum,
    shipping_address: zod_1.z.string(),
    billing_address: zod_1.z.string(),
    payment_method: zod_1.z.string(),
    tracking_number: zod_1.z.string().nullable(),
    estimated_delivery: zod_1.z.string().datetime().nullable(),
    delivered_at: zod_1.z.string().datetime().nullable(),
    timestamp: zod_1.z.string().datetime(),
})
    .strict()
    .openapi("OrderPublic");
exports.OrderSchema = exports.OrderPublicSchema.openapi("Order");
exports.placeOrderSchema = zod_1.z.object({
    user_uid: zod_1.z.string(),
    product_id: zod_1.z.coerce.number(),
    quantity: zod_1.z.coerce.number(),
    shipping_address: zod_1.z.string(),
    billing_address: zod_1.z.string(),
    payment_method: zod_1.z.string(),
});
exports.updateOrderSchema = zod_1.z.object({
    update: zod_1.z.object({
        status: orderStatusEnum,
        tracking_number: zod_1.z.string().nullable().optional(),
        estimated_delivery: zod_1.z.string().datetime().nullable().optional(),
        delivered_at: zod_1.z.string().datetime().nullable().optional(),
    }),
});
exports.getOrdersByStatusSchema = zod_1.z.object({
    status: orderStatusEnum,
});
exports.bulkCreateSchema = zod_1.z.object({
    orders: zod_1.z.array(zod_1.z.object({
        user_uid: zod_1.z.string(),
        product_id: zod_1.z.coerce.number(),
        quantity: zod_1.z.coerce.number(),
        shipping_address: zod_1.z.string(),
        billing_address: zod_1.z.string(),
        payment_method: zod_1.z.string(),
    })),
});
exports.bulkStatusUpdateSchema = zod_1.z.object({
    updates: zod_1.z.array(zod_1.z.object({
        uid: zod_1.z.string(),
        status: orderStatusEnum,
    })),
});
