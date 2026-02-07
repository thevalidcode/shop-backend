import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

/**
 * Schema for adding a product to cart
 */
export const AddToCartSchema = z.object({
  productUid: z.string().uuid("Invalid product UID"),
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
