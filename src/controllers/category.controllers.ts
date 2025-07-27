import { z } from "zod";
import { prisma } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";

const categoryIdSchema = z.object({
  category_id: z.coerce.number(),
  shop_id: z.coerce.number(),
});

const updateCategorySchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  position: z.coerce.number().optional(),
  description: z.string().optional(),
});

const deleteCategorySchema = z.object({
  uid: z.string(),
});

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = z.object({ shop_id: z.coerce.number() }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shop_id } = parsed.data;

  try {
    const categories = await prisma.category.findMany({
      where: { shopId: shop_id },
      orderBy: { position: "asc" },
    });
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = categoryIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { category_id, shop_id } = parsed.data;

  try {
    const category = await prisma.category.findFirst({
      where: { id: category_id, shopId: shop_id },
    });
    res.status(200).json({ category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = updateCategorySchema.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: parsed.error.flatten() });
  return;
}
if (!authParsed.success) {
  res.status(400).json({ error: authParsed.error.flatten() });
  return;
}

  const { uid } = parsed.data;
  const { shop_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.category.updateMany({
      where: { uid, shopId: shop_id },
      data: parsed.data,
    });

    const category = await prisma.category.findFirst({
      where: { uid, shopId: shop_id },
    });

    res
      .status(200)
      .json({ success: "Category updated successfully.", category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = deleteCategorySchema.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: parsed.error.flatten() });
  return;
}
if (!authParsed.success) {
  res.status(400).json({ error: authParsed.error.flatten() });
  return;
}


  const { uid } = parsed.data;
  const { shop_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.category.deleteMany({
      where: { uid, shopId: shop_id },
    });

    res.status(200).json({ success: "Category deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = z.object({ uids: z.array(z.string()) }).safeParse(req.body);
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
    await prisma.category.deleteMany({
      where: { uid: { in: uids }, shopId: shop_id },
    });

    res.status(200).json({ success: "Categories deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = z
    .object({
      name: z.string(),
      description: z.string().optional(),
    })
    .safeParse(req.body);

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
    const lastCategory = await prisma.category.findFirst({
      where: { shopId: shop_id },
      orderBy: { id: "desc" },
    });

    const newId = lastCategory ? lastCategory.id + 1 : 1;

    const category = await prisma.category.create({
      data: {
        id: newId,
        uid: uuidv4(),
        shopId: shop_id,
        slug: parsed.data.name.toLowerCase().replace(/\s+/g, "-"),
        name: parsed.data.name,
        description: parsed.data.description || "",
        status: "Active",
        position: newId,
      },
    });

    res.status(200).json({ success: "Category added successfully.", category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
