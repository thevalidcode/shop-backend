import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const orderStatusEnum = z.enum([
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

export const OrderPublicSchema = z
  .object({
    id: z.coerce.number(),
    uid: z.string(),
    user_uid: z.string(),
    product_id: z.coerce.number(),
    price: z.coerce.number(),
    quantity: z.coerce.number(),
    currency: z.string(),
    status: orderStatusEnum,
    shipping_address: z.string(),
    billing_address: z.string(),
    payment_method: z.string(),
    tracking_number: z.string().nullable(),
    estimated_delivery: z.string().datetime().nullable(),
    delivered_at: z.string().datetime().nullable(),
    timestamp: z.string().datetime(),
  })
  .strict()
  .openapi("OrderPublic");

export const OrderSchema = OrderPublicSchema.openapi("Order");

export const placeOrderSchema = z.object({
  user_uid: z.string(),
  product_id: z.coerce.number(),
  quantity: z.coerce.number(),
  shipping_address: z.string(),
  billing_address: z.string(),
  payment_method: z.string(),
});

export const updateOrderSchema = z.object({
  update: z.object({
    status: orderStatusEnum,
    tracking_number: z.string().nullable().optional(),
    estimated_delivery: z.string().datetime().nullable().optional(),
    delivered_at: z.string().datetime().nullable().optional(),
  }),
});

export const getOrdersByStatusSchema = z.object({
  status: orderStatusEnum,
});

export const bulkCreateSchema = z.object({
  orders: z.array(
    z.object({
      user_uid: z.string(),
      product_id: z.coerce.number(),
      quantity: z.coerce.number(),
      shipping_address: z.string(),
      billing_address: z.string(),
      payment_method: z.string(),
    })
  ),
});

export const bulkStatusUpdateSchema = z.object({
  updates: z.array(
    z.object({
      uid: z.string(),
      status: orderStatusEnum,
    })
  ),
});
