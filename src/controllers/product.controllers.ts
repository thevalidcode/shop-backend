import { z } from "zod";
import {
  getDocs,
  addShopDoc,
  updateShopDoc,
  deleteShopDoc,
  deleteShopDocs,
} from "../crud";
import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";
import {
  DeleteProductInputSchema,
  DeleteMultipleProductsInputSchema,
  ProductUpdateInputSchema,
  ProductCreateInputSchema,
} from "../schemas/product.schema";

const getProductsSchema = z.object({
  shop_id: z.coerce.number(),
});

const serviceIdSchema = z.object({
  product_id: z.coerce.number(),
  shop_id: z.coerce.number(),
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
  const { shop_id } = parsed.data;

  try {
    const products = await getDocs("products", shop_id, {
      filter: { field: "status", operator: "===", value: "active" },
    });

    const sortedProducts = products.sort(
      (a: any, b: any) => a.position - b.position
    );
    res.status(200).json(sortedProducts);
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
    const products = await getDocs("products", shop_id);

    const sortedProducts = products.sort(
      (a: any, b: any) => a.position - b.position
    );
    res.status(200).json(sortedProducts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = serviceIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shop_id, product_id } = parsed.data;

  try {
    const service = await getDocs("products", shop_id, {
      find: { field: "id", operator: "===", value: product_id },
    });
    res.status(200).json({ service });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByIDFromAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = serviceIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { product_id } = parsed.data;
  const { shop_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    const service = await getDocs("products", shop_id, {
      find: { field: "id", operator: "===", value: product_id },
    });
    res.status(200).json({ service });
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
    await updateShopDoc("products", reqData.uid, reqData, shop_id);

    const service = await getDocs("products", shop_id, {
      find: { field: "uid", operator: "===", value: reqData.uid },
    });
    res.status(200).json({ success: "Product updated successfully.", service });
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
  const { role, shop_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deleteShopDoc("products", uid, shop_id);
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
  const { role, shop_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deleteShopDocs("products", uids, shop_id);

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
    const products = await getDocs("products", shop_id);
    const newId =
      products.reduce((max: number, s: any) => Math.max(max, s.id), 0) + 1;

    const productData = {
      ...parsed.data,
      position: newId,
      shop_id,
      status: "active",
    };

    await addShopDoc("products", productData, shop_id);

    res.status(200).json({
      success: "Product added successfully.",
      product: productData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
