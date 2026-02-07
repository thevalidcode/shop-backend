import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  CartItemIdSchema,
} from "../schemas/cart.schema";
import { UserAuthSchema } from "../schemas/user.schema";
import { v4 as uuidv4 } from "uuid";
import { calculateCartTotal } from "../utils/cart";
import convertCurrency from "../utils/ConvertCurrency";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * CART FLOW OVERVIEW:
 * 1. User adds items to cart (creates cart if doesn't exist)
 * 2. User can view cart with all items and calculated totals
 * 3. User can update item quantities or remove items
 * 4. User can place order from cart (converts cart to order)
 * 5. After successful order placement, cart is cleared
 *
 * CART STRUCTURE:
 * - Each user has ONE cart per shop
 * - Cart contains multiple CartItems
 * - Each CartItem references a Product with quantity
 * - Cart total is calculated from all items (price * quantity)
 */

/**
 * Helper: Get or create a cart for the authenticated user
 * Creates a new cart if one doesn't exist for this user in this shop
 */
const getOrCreateCart = async (
  userUid: string,
  shopId: number,
  tx: any = prisma,
) => {
  let cart = await tx.cart.findUnique({
    where: { userUid_shopId: { userUid, shopId } },
  });

  if (!cart) {
    // Generate unique shop-scoped ID for cart
    const counter = await tx.shopCounter.update({
      where: { shopId },
      data: { cartCounter: { increment: 1 } },
    });

    cart = await tx.cart.create({
      data: {
        uid: uuidv4(),
        shopScopedId: counter.cartCounter,
        userUid,
        shopId,
      },
    });
  }

  return cart;
};

/**
 * GET /cart
 * Retrieve the user's cart with all items and calculated total
 * Returns empty cart if user has no items
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid: userUid, shopId } = authParsed.data;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userUid_shopId: { userUid, shopId } },
      include: {
        items: {
          include: {
            product: {
              select: {
                uid: true,
                name: true,
                price: true,
                imageUrl: true,
                stock: true,
                currency: true,
                status: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    // Return empty cart if none exists
    if (!cart) {
      res.status(200).json({
        items: [],
        currency: "USD",
        total: 0,
        itemCount: 0,
      });
      return;
    }

    // Check if all products have the same currency
    const currencies = new Set(
      cart.items.map((item) => item.product?.currency || "USD"),
    );
    const hasDifferentCurrencies = currencies.size > 1;

    let finalCurrency = "USD";
    let finalTotal = new Decimal(0);
    let processedItems = cart.items;

    if (hasDifferentCurrencies) {
      // Convert all items to USD
      processedItems = await Promise.all(
        cart.items.map(async (item) => {
          const productCurrency = item.product?.currency || "USD";
          const productPrice = new Decimal(item.product?.price || 0);

          let convertedPrice = productPrice;
          if (productCurrency !== "USD") {
            const converted = await convertCurrency(
              productPrice,
              productCurrency,
              "USD",
            );
            convertedPrice = new Decimal(converted);
          }

          const itemTotal = convertedPrice.mul(item.quantity);
          finalTotal = finalTotal.add(itemTotal);

          return {
            ...item,
            product: {
              ...item.product,
              price: convertedPrice,
              currency: "USD",
              originalPrice: productPrice,
              originalCurrency: productCurrency,
            },
          };
        }),
      );
    } else {
      // All same currency, use as is
      const cartTotal = await calculateCartTotal(cart);
      finalCurrency = cartTotal.currency;
      finalTotal = cartTotal.amount;
    }

    res.status(200).json({
      uid: cart.uid,
      items: processedItems,
      currency: finalCurrency,
      total: finalTotal.toNumber(),
      itemCount: cart.items.length,
      currenciesConverted: hasDifferentCurrencies,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve cart." });
  }
};

/**
 * POST /cart/items
 * Add a product to the cart
 * - Creates cart if it doesn't exist
 * - Increments quantity if product already in cart
 * - Validates product availability and stock
 */
export const addItemToCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const validation = AddToCartSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { uid: userUid, shopId } = authParsed.data;
  const { productUid, quantity } = validation.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Validate product exists and is available
      const product = await tx.product.findFirst({
        where: {
          uid: productUid,
          shopId,
          status: "ACTIVE",
        },
      });

      if (!product) {
        throw new Error("Product not found or not available");
      }

      // Check stock availability
      if (product.trackInventory && product.stock < quantity) {
        throw new Error(`Insufficient stock. Only ${product.stock} available.`);
      }

      // Get or create cart
      const cart = await getOrCreateCart(userUid, shopId, tx);

      // Check if product already in cart
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: product.id,
        },
      });

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;

        // Validate new quantity against stock
        if (product.trackInventory && product.stock < newQuantity) {
          throw new Error(
            `Cannot add ${quantity} more. Maximum available: ${product.stock - existingItem.quantity}`,
          );
        }

        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });

        res.status(200).json({
          success: "Cart item quantity updated",
          quantity: newQuantity,
        });
      } else {
        // Create new cart item with shop-scoped ID
        const counter = await tx.shopCounter.update({
          where: { shopId },
          data: { cartItemCounter: { increment: 1 } },
        });

        await tx.cartItem.create({
          data: {
            uid: uuidv4(),
            shopScopedId: counter.cartItemCounter,
            cartId: cart.id,
            productId: product.id,
            quantity,
          },
        });

        res.status(201).json({
          success: "Item added to cart",
          quantity,
        });
      }
    });
  } catch (error: any) {
    if (
      error.message.includes("stock") ||
      error.message.includes("available")
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to add item to cart." });
    }
  }
};

/**
 * PATCH /cart/items/:itemId
 * Update the quantity of an item in the cart
 * - Validates item belongs to user's cart
 * - Checks stock availability for new quantity
 */
export const updateCartItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = CartItemIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const bodyParsed = UpdateCartItemSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { uid: userUid, shopId } = authParsed.data;
  const { itemId } = paramsParsed.data;
  const { quantity } = bodyParsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Get user's cart
      const cart = await tx.cart.findUnique({
        where: { userUid_shopId: { userUid, shopId } },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      // Get cart item with product info
      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        include: {
          product: true,
        },
      });

      if (!cartItem) {
        throw new Error("Cart item not found or does not belong to you");
      }

      // Validate stock if product tracks inventory
      if (
        cartItem.product.trackInventory &&
        cartItem.product.stock < quantity
      ) {
        throw new Error(
          `Insufficient stock. Only ${cartItem.product.stock} available.`,
        );
      }

      // Update quantity
      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });

      res.status(200).json({
        success: "Cart item updated",
        quantity,
      });
    });
  } catch (error: any) {
    if (
      error.message.includes("not found") ||
      error.message.includes("stock")
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to update cart item." });
    }
  }
};

/**
 * DELETE /cart/items/:itemId
 * Remove an item from the cart
 * - Validates item belongs to user's cart
 */
export const removeItemFromCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const paramsParsed = CartItemIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const { uid: userUid, shopId } = authParsed.data;
  const { itemId } = paramsParsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Get user's cart
      const cart = await tx.cart.findUnique({
        where: { userUid_shopId: { userUid, shopId } },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      // Delete cart item (only if it belongs to user's cart)
      const deletedItem = await tx.cartItem.deleteMany({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

      if (deletedItem.count === 0) {
        throw new Error("Cart item not found or does not belong to you");
      }

      res.status(200).json({ success: "Item removed from cart" });
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to remove item from cart." });
    }
  }
};
