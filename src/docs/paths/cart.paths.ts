import { registry } from "../components/registry";
import { z } from "zod";
import { AddToCartSchema, UpdateCartItemSchema } from "../../schemas/cart.schema";
import { ProductSchema } from "../../schemas/product.schema";
import { BadRequest, Forbidden, ServerError, SuccessResponse } from "../responses/common.response";
import { NotFound } from "../responses/shop.response";

const CartItemWithProductSchema = z.object({
  id: z.number(),
  cartId: z.number(),
  productId: z.number(),
  quantity: z.number(),
  product: ProductSchema,
});

const CartResponseSchema = z.object({
  id: z.number(),
  uid: z.string().uuid(),
  userUid: z.string(),
  items: z.array(CartItemWithProductSchema),
});

registry.registerPath({
  method: "get",
  path: "/cart",
  summary: "Get the current user's shopping cart",
  tags: ["Cart"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "User's cart details.",
      content: { "application/json": { schema: CartResponseSchema } },
    },
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/cart/items",
  summary: "Add an item to the cart",
  tags: ["Cart"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: { content: { "application/json": { schema: AddToCartSchema } } },
  },
  responses: {
    201: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "patch",
  path: "/cart/items/{itemId}",
  summary: "Update the quantity of an item in the cart",
  tags: ["Cart"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [{ name: "itemId", in: "path", required: true, schema: { type: "number" } }],
  request: {
    body: { content: { "application/json": { schema: UpdateCartItemSchema } } },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "delete",
  path: "/cart/items/{itemId}",
  summary: "Remove an item from the cart",
  tags: ["Cart"],
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  parameters: [{ name: "itemId", in: "path", required: true, schema: { type: "number" } }],
  responses: {
    200: SuccessResponse,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});