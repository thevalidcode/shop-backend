import { registry } from "../components/registry";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  CartItemIdSchema,
} from "../../schemas/cart.schema";
import {
  GetCartResponseSchema,
  AddToCartResponseSchema,
  UpdateCartItemResponseSchema,
  RemoveItemResponseSchema,
  CartErrorResponseSchema,
  CartValidationErrorResponseSchema,
} from "../responses/cart.response";

/**
 * GET /cart
 * Get user's shopping cart with all items
 */
registry.registerPath({
  method: "get",
  path: "/cart",
  tags: ["Cart"],
  summary: "Get shopping cart",
  description:
    "Retrieve the authenticated user's shopping cart with all items and calculated total. Returns an empty cart if no items exist.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  responses: {
    200: {
      description: "Cart retrieved successfully",
      content: {
        "application/json": {
          schema: GetCartResponseSchema,
        },
      },
    },
    400: {
      description: "Authentication error",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * POST /cart/items
 * Add a product to the cart
 */
registry.registerPath({
  method: "post",
  path: "/cart/items",
  tags: ["Cart"],
  summary: "Add item to cart",
  description:
    "Add a product to the shopping cart. If the product already exists in the cart, the quantity will be incremented. Creates a new cart if one doesn't exist. Validates product availability and stock.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: AddToCartSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Item added to cart successfully",
      content: {
        "application/json": {
          schema: AddToCartResponseSchema,
        },
      },
    },
    200: {
      description: "Cart item quantity updated (product already in cart)",
      content: {
        "application/json": {
          schema: AddToCartResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or insufficient stock",
      content: {
        "application/json": {
          schema: CartValidationErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * PATCH /cart/items/{itemId}
 * Update cart item quantity
 */
registry.registerPath({
  method: "patch",
  path: "/cart/items/{itemId}",
  tags: ["Cart"],
  summary: "Update cart item",
  description:
    "Update the quantity of an item in the cart. Validates that the item belongs to the user's cart and checks stock availability.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: CartItemIdSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateCartItemSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Cart item updated successfully",
      content: {
        "application/json": {
          schema: UpdateCartItemResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or insufficient stock",
      content: {
        "application/json": {
          schema: CartValidationErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Cart or item not found",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * DELETE /cart/items/{itemId}
 * Remove item from cart
 */
registry.registerPath({
  method: "delete",
  path: "/cart/items/{itemId}",
  tags: ["Cart"],
  summary: "Remove item from cart",
  description:
    "Remove an item from the shopping cart. Validates that the item belongs to the user's cart.",
  security: [{ CookieAuth: [], CsrfHeader: [], CsrfCookie: [] }],
  request: {
    params: CartItemIdSchema,
  },
  responses: {
    200: {
      description: "Item removed successfully",
      content: {
        "application/json": {
          schema: RemoveItemResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Cart or item not found",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: CartErrorResponseSchema,
        },
      },
    },
  },
});
