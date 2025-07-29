import { Request, Response } from "express";
import {
  createFAQSchema,
  updateFAQSchema,
  deleteFAQSchema,
  faqIdSchema,
  deleteMultipleFAQsSchema,
} from "../schemas/faq.schema";
import { ShopIdSchema } from "../schemas/common.schema";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db";

export const getFAQs = async (req: Request, res: Response): Promise<void> => {
  const parsed = ShopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = parsed.data;

  try {
    const faqs = await prisma.faq.findMany({
      where: { shopId },
      orderBy: { position: "asc" },
    });
    res.status(200).json(faqs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFAQByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = faqIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const queryParsed = ShopIdSchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { faqId } = parsed.data;
  const { shopId } = queryParsed.data;

  try {
    const faq = await prisma.faq.findFirst({
      where: {
        id: faqId,
        shopId,
      },
    });
     if (!faq) {
      res.status(404).json({ error: "FAQ not found" });
      return;
    }
    res.status(200).json({ faq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = createFAQSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = req.auth!; // isAdmin middleware guarantees this exists

  try {
    const lastFaq = await prisma.faq.findFirst({
      where: { shopId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastFaq ? lastFaq.position + 1 : 1;
    
    const newFaq = await prisma.faq.create({
      data: {
        // No `id` provided, database will auto-increment
        shopId,
        slug: parsed.data.question.toLowerCase().replace(/\s+/g, "-"),
        question: parsed.data.question,
        answer: parsed.data.answer,
        status: "active",
        position: newPosition,
        uid: uuidv4(),
      },
    });

    res.status(201).json({ success: "FAQ added successfully.", faq: newFaq });
  } catch (err: any) {
    console.error("Failed to add FAQ:", err);
    res.status(500).json({ error: "Failed to add FAQ." });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = updateFAQSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid, ...updateData } = parsed.data;
  const { shopId } = req.auth!;

  try {
    const updatedFaq = await prisma.faq.update({
      where: {
        uid,
        shopId,
      },
      data: updateData,
    });

    res.status(200).json({ success: "FAQ updated successfully.", faq: updatedFaq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = deleteFAQSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.faq.deleteMany({
      where: {
        uid,
        shopId,
      },
    });

    res.status(200).json({ success: "FAQ deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMultipleFAQs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = deleteMultipleFAQsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { shopId } = req.auth!;

  try {
    await prisma.faq.deleteMany({
      where: {
        uid: { in: uids },
        shopId,
      },
    });

    res.status(200).json({ success: "FAQs deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};