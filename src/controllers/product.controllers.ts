import { z } from "zod";
import { prisma } from "../config/db";
import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";
import {
  DeleteProductInputSchema,
  DeleteMultipleProductsInputSchema,
  ProductUpdateInputSchema,
  ProductCreateInputSchema,
} from "../schemas/product.schema";
import { getNextShopModelId } from "../utils/nextId";
import { v4 as uuidv4 } from "uuid";

const getProductsSchema = z.object({
  shopId: z.coerce.number(),
});

const productIdSchema = z.object({
  productId: z.coerce.number(),
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
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shop_id, role } = parsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const products = await prisma.product.findMany({
      where: { shopId: shop_id },
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
  const parsed = productIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId, productId } = parsed.data;

  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId },
    });
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByIDFromAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = productIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { productId } = parsed.data;
  const { shop_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId: shop_id },
    });
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = ProductUpdateInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const reqData = parsed.data;
  const { shop_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.product.update({
      where: { uid: reqData.uid },
      data: reqData,
    });

    const product = await prisma.product.findFirst({
      where: { uid: reqData.uid, shopId: shop_id },
    });

    res.status(200).json({ success: "Product updated successfully.", product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = DeleteProductInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;
  const { role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.product.delete({ where: { uid } });
    res.status(200).json({ success: "Product deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = DeleteMultipleProductsInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { uids } = parsed.data;
  const { role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.product.deleteMany({ where: { uid: { in: uids } } });
    res.status(200).json({ success: "Products deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = ProductCreateInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { role, shop_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const newId = await getNextShopModelId("product", shop_id);
    const uid = uuidv4();

    const productData = {
      ...parsed.data,
      id: newId,
      uid,
      shopId: shop_id,
      status: "active",
      position: newId,
    };

    const product = await prisma.product.create({ data: productData });

    res.status(200).json({ success: "Product added successfully.", product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
