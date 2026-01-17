import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

/**
 * Schema for adding a product to cart
 */
export const AddToCartSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(1000, "Quantity cannot exceed 1000"),
});

/**
 * Schema for updating cart item quantity
 */
export const UpdateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(1000, "Quantity cannot exceed 1000"),
});

/**
 * Schema for cart item ID parameter
 */
export const CartItemIdSchema = z.object({
  itemId: z.coerce
    .number()
    .int()
    .positive("Item ID must be a positive integer"),
});

/**
 * Schema for placing an order from cart
 */
export const PlaceOrderFromCartSchema = z.object({
  billingInfoUid: z.string().uuid("Invalid billing information ID"),
  paymentGatewayUid: z.string().uuid("Invalid payment gateway ID"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});
