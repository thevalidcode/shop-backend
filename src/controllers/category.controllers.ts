import { z } from "zod";
import { prisma } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";

const categoryIdSchema = z.object({
  categoryId: z.coerce.number(),
});

const getCategoriesSchema = z.object({
  shopId: z.coerce.number(),
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
  const parsed = getCategoriesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId } = parsed.data;

  try {
    const categories = await prisma.category.findMany({
      where: { shopId },
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
  const paramsParsed = categoryIdSchema.safeParse(req.params);
  const queryParsed = getCategoriesSchema.safeParse(req.query);

  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { categoryId } = paramsParsed.data;
  const { shopId } = queryParsed.data;

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, shopId },
    });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.status(200).json({ category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    const categoryToUpdate = await prisma.category.findFirst({
        where: { uid, shopId }
    });
    if (!categoryToUpdate) {
        res.status(404).json({ error: "Category not found in this shop." });
        return;
    }

    const updatedCategory = await prisma.category.update({
      where: { uid },
      data: parsed.data,
    });

    res
      .status(200)
      .json({ success: "Category updated successfully.", category: updatedCategory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = deleteCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.category.deleteMany({
      where: { uid, shopId },
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
  const parsed = z.object({ uids: z.array(z.string()) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.category.deleteMany({
      where: { uid: { in: uids }, shopId },
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

  const { shopId } = req.auth!;

  try {
    const lastCategory = await prisma.category.findFirst({
      where: { shopId },
      orderBy: { position: "desc" },
    });
    const newPosition = lastCategory ? lastCategory.position + 1 : 1;

    const newCategory = await prisma.category.create({
      data: {
        uid: uuidv4(),
        shopId,
        slug: parsed.data.name.toLowerCase().replace(/\s+/g, "-"),
        name: parsed.data.name,
        description: parsed.data.description || "",
        status: "Active",
        position: newPosition,
      },
    });

    res.status(201).json({ success: "Category added successfully.", category: newCategory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};