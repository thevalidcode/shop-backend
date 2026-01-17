import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { OrderStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

const orderStatusEnum = z.nativeEnum(OrderStatus);

/**
 * Public-facing order schema (for users)
 */
export const OrderPublicSchema = z
  .object({
    id: z.coerce.number(),
    shopScopedId: z.number(),
    uid: z.string(),
    orderRef: z.string(),
    userUid: z.string(),
    shopId: z.number(),
    totalAmount: z.coerce.number(),
    currency: z.string(),
    status: orderStatusEnum,
    billingInfoUid: z.string().nullable(),
    paymentReference: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()
  .openapi("Order");

/**
 * Full order schema (for admins with additional fields)
 */
export const OrderAdminSchema = OrderPublicSchema;

/**
 * Schema for order UID parameter
 */
export const OrderUidSchema = z.object({
  orderUid: z.string().uuid("Invalid order ID"),
});

/**
 * Schema for updating order (admin only)
 */
export const UpdateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentReference: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

/**
 * Schema for getting orders by status
 */
export const GetOrdersByStatusSchema = z.object({
  status: orderStatusEnum,
});

/**
 * Schema for bulk status updates (admin only)
 */
export const BulkStatusUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        orderUid: z.string().uuid("Invalid order ID"),
        status: orderStatusEnum,
      })
    )
    .min(1, "At least one order must be provided")
    .max(100, "Cannot update more than 100 orders at once"),
});
