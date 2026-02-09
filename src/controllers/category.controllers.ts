import { z } from "zod";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import {
  CategoryCreateRequestSchema,
  CategoryUpdateRequestSchema,
  DeleteCategoriesSchema,
  DeleteCategorySchema,
} from "../schemas/category.schema";
import { ShopIdSchema, UidSchema } from "../schemas/common.schema";

export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ShopIdSchema.safeParse(req.query);
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

export const getCategoryByUID = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsParsed = UidSchema.safeParse(req.params);
  const queryParsed = ShopIdSchema.safeParse(req.query);

  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { uid } = paramsParsed.data;
  const { shopId } = queryParsed.data;

  try {
    const category = await prisma.category.findFirst({
      where: { uid, shopId },
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
  res: Response,
): Promise<void> => {
  const parsed = CategoryUpdateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    const categoryToUpdate = await prisma.category.findUnique({
      where: { uid, shopId },
    });
    
    if (!categoryToUpdate) {
      res.status(404).json({ error: "Category not found in this shop." });
      return;
    }

    const updateResult = await prisma.category.updateMany({
      where: { uid, shopId },
      data: parsed.data,
    });

    if (updateResult.count === 0) {
      res.status(404).json({ error: "Category not found or does not belong to this shop." });
      return;
    }

    // Fetch the updated category to return
    const category = await prisma.category.findFirst({
      where: { uid, shopId },
    });

    res.status(200).json({
      success: "Category updated successfully.",
      category,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = DeleteCategorySchema.safeParse(req.body);
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
  res: Response,
): Promise<void> => {
  const parsed = DeleteCategoriesSchema.safeParse(req.body);
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
  res: Response,
): Promise<void> => {
  const parsed = CategoryCreateRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = req.auth!;

  try {
    const newCategory = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { categoryCounter: { increment: 1 } },
      });

      const lastCategory = await tx.category.findFirst({
        where: { shopId },
        orderBy: { position: "desc" },
      });
      const newPosition = lastCategory ? lastCategory.position + 1 : 1;

      const category = await tx.category.create({
        data: {
          shopScopedId: counter.categoryCounter,
          uid: uuidv4(),
          shopId,
          slug: parsed.data.name.toLowerCase().replace(/\s+/g, "-"),
          name: parsed.data.name,
          description: parsed.data.description || "",
          status: "ACTIVE",
          position: newPosition,
        },
      });
      return category;
    });

    res
      .status(201)
      .json({ success: "Category added successfully.", category: newCategory });
  } catch (error: any) {
    console.error("Failed to add category:", error);
    res.status(500).json({ error: "Failed to add category." });
  }
};
