import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// Cart Item Response (for individual items in cart)
const CartItemResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  shopScopedId: z.number().openapi({ example: 42 }),
  quantity: z.number().min(1).openapi({ example: 2 }),
  product: z.object({
    uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
    name: z.string().openapi({ example: "Wireless Headphones" }),
    price: z.number().openapi({ example: 99.99 }),
    imageUrl: z.string().nullable().openapi({ example: "https://example.com/headphones.jpg" }),
    stock: z.number().openapi({ example: 50 }),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).openapi({ example: "ACTIVE" }),
  }),
});

// Get Cart Response
export const GetCartResponseSchema = z.object({
  uid: z.string().uuid().optional().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
  items: z.array(CartItemResponseSchema).openapi({
    example: [
      {
        id: 1,
        uid: "550e8400-e29b-41d4-a716-446655440000",
        shopScopedId: 42,
        quantity: 2,
        product: {
          uid: "550e8400-e29b-41d4-a716-446655440001",
          name: "Wireless Headphones",
          price: 99.99,
          imageUrl: "https://example.com/headphones.jpg",
          stock: 50,
          status: "ACTIVE",
        },
      },
    ],
  }),
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

// Place Order Response
export const PlaceOrderResponseSchema = z.object({
  success: z.string().openapi({ example: "Order placed successfully" }),
  order: z.object({
    uid: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440003" }),
    orderRef: z.string().openapi({ example: "ORD-1-123" }),
    totalAmount: z.number().openapi({ example: 199.98 }),
    status: z.string().openapi({ example: "PENDING" }),
  }),
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
