import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});