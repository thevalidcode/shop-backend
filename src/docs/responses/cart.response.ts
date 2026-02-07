import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ProductPublicSchema } from "../../schemas/product.schema";

extendZodWithOpenApi(z);

// Cart Item Response (for individual items in cart)
const CartItemResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  shopScopedId: z.number().openapi({ example: 42 }),
  quantity: z.number().min(1).openapi({ example: 2 }),
  product: ProductPublicSchema,
});

// Get Cart Response
export const GetCartResponseSchema = z.object({
  uid: z.string().uuid().optional().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
  items: z.array(CartItemResponseSchema),
  total: z.number().openapi({ example: 199.98 }),
  itemCount: z.number().openapi({ example: 1 }),
});

// Add to Cart Response
export const AddToCartResponseSchema = z.object({
  success: z.string().openapi({ example: "Item added to cart" }),
  quantity: z.number().openapi({ example: 2 }),
});

// Update Cart Item Response
export const UpdateCartItemResponseSchema = z.object({
  success: z.string().openapi({ example: "Cart item updated" }),
  quantity: z.number().openapi({ example: 3 }),
});

// Remove Item Response
export const RemoveItemResponseSchema = z.object({
  success: z.string().openapi({ example: "Item removed from cart" }),
});

// Error Responses
export const CartErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: "Product not found or not available",
  }),
});

export const CartValidationErrorResponseSchema = z.object({
  error: z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.array(z.string())),
  }),
});
