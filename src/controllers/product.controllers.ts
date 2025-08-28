import { z } from "zod";
import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import {
  DeleteProductInputSchema,
  DeleteMultipleProductsInputSchema,
  ProductUpdateInputSchema,
  ProductCreateInputSchema,
} from "../schemas/product.schema";
import { v4 as uuidv4 } from "uuid";

const getProductsSchema = z.object({
  shopId: z.coerce.number(),
});

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = getProductsSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId } = parsed.data;

  try {
    const products = await prisma.product.findMany({
      where: { shopId, status: "active" },
      orderBy: { position: "asc" },
    });

    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;

  try {
    const products = await prisma.product.findMany({
      where: { shopId },
      orderBy: { position: "asc" },
    });
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = z.object({ productId: z.coerce.number() }).safeParse(req.params);
  const queryParsed = z.object({ shopId: z.coerce.number() }).safeParse(req.query);
  
  if (!paramsParsed.success) {
      res.status(400).json({ error: paramsParsed.error.flatten() });
      return;
  }
  if (!queryParsed.success) {
      res.status(400).json({ error: queryParsed.error.flatten() });
      return;
  }

  const { shopId } = queryParsed.data;
  const { productId } = paramsParsed.data;

  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId, status: 'active' },
    });
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
    }
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByIDFromAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = z.object({ productId: z.coerce.number() }).safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { productId } = parsed.data;
  const { shopId } = req.auth!;

  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = ProductUpdateInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const reqData = parsed.data;
  const { shopId } = req.auth!;

  try {
    const productToUpdate = await prisma.product.findFirst({
      where: { uid: reqData.uid, shopId }
    });
    if (!productToUpdate) {
        res.status(404).json({ error: "Product not found in this shop." });
        return;
    }

    const updatedProduct = await prisma.product.update({
      where: { uid: reqData.uid },
      data: reqData,
    });

    res.status(200).json({ success: "Product updated successfully.", product: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = DeleteProductInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.product.deleteMany({ where: { uid, shopId } });
    res.status(200).json({ success: "Product deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = DeleteMultipleProductsInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uids } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.product.deleteMany({ where: { uid: { in: uids }, shopId } });
    res.status(200).json({ success: "Products deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = ProductCreateInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  
  const { shopId } = req.auth!;

  try {
    const newProduct = await prisma.$transaction(async (tx) => {
        const counter = await tx.shopCounter.update({
            where: { shopId },
            data: { productCounter: { increment: 1 } },
        });

        const lastProduct = await tx.product.findFirst({
            where: { shopId },
            orderBy: { position: "desc" },
            select: { position: true },
        });
        const newPosition = lastProduct ? lastProduct.position + 1 : 1;

        const product = await tx.product.create({
            data: {
                ...parsed.data,
                uid: uuidv4(),
                shopId,
                shopScopedId: counter.productCounter,
                status: "active",
                position: newPosition,
            },
        });
        return product;
    });

    res.status(201).json({ success: "Product added successfully.", product: newProduct });
  } catch (error: any) {
    console.error("Failed to add product:", error);
    // Check for unique constraint violation on the slug
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      res.status(409).json({ error: "A product with this slug already exists." });
      return;
    }
    res.status(500).json({ error: "Failed to add product." });
  }
};