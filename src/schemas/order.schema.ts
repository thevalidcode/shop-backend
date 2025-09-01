import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { OrderStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

const orderStatusEnum = z.nativeEnum(OrderStatus);

export const OrderPublicSchema = z
  .object({
    id: z.coerce.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    userUid: z.string(),
    productId: z.coerce.number(),
    price: z.coerce.number(),
    quantity: z.coerce.number(),
    currency: z.string(),
    status: orderStatusEnum,
    shippingAddress: z.string(),
    billingAddress: z.string(),
    paymentMethod: z.string(),
    trackingNumber: z.string().nullable(),
    estimatedDelivery: z.string().datetime().nullable(),
    deliveredAt: z.string().datetime().nullable(),
    timestamp: z.string().datetime(),
  })
  .strict()
  .openapi("OrderPublic");

export const OrderSchema = OrderPublicSchema.openapi("Order");

export const placeOrderSchema = z.object({
  userUid: z.string(),
  productId: z.coerce.number(),
  quantity: z.coerce.number(),
  shippingAddress: z.string(),
  billingAddress: z.string(),
  paymentMethod: z.string(),
});

export const updateOrderSchema = z.object({
  update: z.object({
    status: orderStatusEnum,
    trackingNumber: z.string().nullable().optional(),
    estimatedDelivery: z.string().datetime().nullable().optional(),
    deliveredAt: z.string().datetime().nullable().optional(),
  }),
});

export const getOrdersByStatusSchema = z.object({
  status: orderStatusEnum,
});

export const bulkCreateSchema = z.object({
  orders: z.array(
    z.object({
      userUid: z.string(),
      productId: z.coerce.number(),
      quantity: z.coerce.number(),
      shippingAddress: z.string(),
      billingAddress: z.string(),
      paymentMethod: z.string(),
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
