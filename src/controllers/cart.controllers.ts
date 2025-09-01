// src/controllers/cart.controllers.ts
import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AddToCartSchema, UpdateCartItemSchema } from "../schemas/cart.schema";

// Helper to get or create a cart for a user
const getOrCreateCart = async (userUid: string, shopId: number) => {
  let cart = await prisma.cart.findUnique({ where: { userUid } });
  if (!cart) {
    await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { cartCounter: { increment: 1 } },
      });
      cart = await tx.cart.create({
        data: { shopScopedId: counter.cartCounter, userUid, shopId },
      });
    });
  }
  return cart!;
};

// GET /cart
export const getCart = async (req: Request, res: Response) => {
  const { uid: userUid, shopId } = req.auth!;
  try {
    const cart = await prisma.cart.findUnique({
      where: { userUid },
      include: {
        items: {
          include: { product: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!cart) {
      res.status(200).json({ items: [], total: 0 });
      return;
    }

    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve cart." });
  }
};

// POST /cart/items
export const addItemToCart = async (req: Request, res: Response) => {
  const validation = AddToCartSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { uid: userUid, shopId } = req.auth!;
  const { productId, quantity } = validation.data;

  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId },
    });
    if (!product || product.status !== "ACTIVE" || product.stock < quantity) {
      res
        .status(404)
        .json({ error: "Product is not available or insufficient stock." });
      return;
    }

    const cart = await getOrCreateCart(userUid, shopId);

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const counter = await tx.shopCounter.update({
          where: { shopId },
          data: { cartItemCounter: { increment: 1 } },
        });
        await prisma.cartItem.create({
          data: {
            shopScopedId: counter.cartItemCounter,
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      });
    }

    res.status(201).json({ success: "Item added to cart." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add item to cart." });
  }
};

// PATCH /cart/items/:itemId
export const updateCartItem = async (req: Request, res: Response) => {
  const validation = UpdateCartItemSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { uid: userUid } = req.auth!;
  const itemId = parseInt(req.params.itemId, 10);
  const { quantity } = validation.data;

  try {
    const cart = await prisma.cart.findUnique({ where: { userUid } });
    if (!cart) {
      res.status(404).json({ error: "Cart not found." });
      return;
    }

    const updatedItem = await prisma.cartItem.updateMany({
      where: { id: itemId, cartId: cart.id }, // Ensures user owns the item
      data: { quantity },
    });

    if (updatedItem.count === 0) {
      res.status(404).json({
        error:
          "Cart item not found or you do not have permission to update it.",
      });
      return;
    }

    res.status(200).json({ success: "Cart updated." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update cart item." });
  }
};

// DELETE /cart/items/:itemId
export const removeItemFromCart = async (req: Request, res: Response) => {
  const { uid: userUid } = req.auth!;
  const itemId = parseInt(req.params.itemId, 10);

  try {
    const cart = await prisma.cart.findUnique({ where: { userUid } });
    if (!cart) {
      res.status(404).json({ error: "Cart not found." });
      return;
    }

    const deletedItem = await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id }, // Security check
    });

    if (deletedItem.count === 0) {
      res.status(404).json({
        error:
          "Cart item not found or you do not have permission to delete it.",
      });
      return;
    }

    res.status(200).json({ success: "Item removed from cart." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to remove item from cart." });
  }
};
