import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// Order Item Response (for items within an order)
const OrderItemResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  quantity: z.number().min(1).openapi({ example: 2 }),
  priceAtTimeOfPurchase: z.number().openapi({ example: 99.99 }),
  product: z.object({
    uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
    name: z.string().openapi({ example: "Wireless Headphones" }),
    imageUrl: z.string().nullable().openapi({ example: "https://example.com/headphones.jpg" }),
  }),
});

// Billing Info in Order Response
const BillingInfoInOrderSchema = z.object({
  fullName: z.string().openapi({ example: "John Doe" }),
  address: z.string().openapi({ example: "123 Main St" }),
  city: z.string().openapi({ example: "New York" }),
  state: z.string().openapi({ example: "NY" }),
  country: z.string().openapi({ example: "USA" }),
  postalCode: z.string().openapi({ example: "10001" }),
});

// User Info in Order (Admin view)
const UserInfoInOrderSchema = z.object({
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  firstName: z.string().nullable().openapi({ example: "John" }),
  lastName: z.string().nullable().openapi({ example: "Doe" }),
});

// Single Order Response (User view)
export const OrderResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440003" }),
  shopScopedId: z.number().openapi({ example: 123 }),
  orderRef: z.string().openapi({ example: "ORD-1-123" }),
  totalAmount: z.number().openapi({ example: 199.98 }),
  currency: z.string().openapi({ example: "USD" }),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).openapi({ example: "PENDING" }),
  notes: z.string().nullable().openapi({ example: "Please handle with care" }),
  createdAt: z.string().openapi({ example: "2024-01-15T10:30:00.000Z" }),
  updatedAt: z.string().openapi({ example: "2024-01-15T10:30:00.000Z" }),
  items: z.array(OrderItemResponseSchema),
  billingInfo: BillingInfoInOrderSchema,
});

// Single Order Response (Admin view with user info)
export const OrderAdminResponseSchema = OrderResponseSchema.extend({
  user: UserInfoInOrderSchema,
  paymentReference: z.string().nullable().openapi({ example: "PAY-123456" }),
});

// Get Orders Response (List)
export const GetOrdersResponseSchema = z.array(OrderResponseSchema);

// Get Orders Response (Admin - List)
export const GetOrdersAdminResponseSchema = z.array(OrderAdminResponseSchema);

// Update Order Response
export const UpdateOrderResponseSchema = z.object({
  success: z.string().openapi({ example: "Order updated successfully" }),
  order: z.object({
    uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440003" }),
    status: z.string().openapi({ example: "PROCESSING" }),
  }),
});

// Delete Order Response
export const DeleteOrderResponseSchema = z.object({
  success: z.string().openapi({ example: "Order deleted successfully" }),
});

// Bulk Update Response
export const BulkUpdateResponseSchema = z.object({
  success: z.string().openapi({ example: "Successfully updated 5 orders" }),
  count: z.number().openapi({ example: 5 }),
});

// Error Responses
export const OrderErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: "Order not found",
  }),
});

export const OrderValidationErrorResponseSchema = z.object({
  error: z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.array(z.string())),
  }),
});

export const OrderCreatedListResponse = {
  description: "Successfully created orders",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Orders added successfully."),
        uids: z.array(z.string().uuid()),
      }),
    },
  },
};

export const OrderUpdatedResponse = {
  description: "Successfully updated a order",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Order updated successfully."),
      }),
    },
  },
};
