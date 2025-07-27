import { Request, Response } from "express";
import {
  createFAQSchema,
  updateFAQSchema,
  deleteFAQSchema,
  faqIdSchema,
  deleteMultipleFAQsSchema,
} from "../schemas/faq.schema";
import { ShopIdSchema } from "../schemas/common.schema";
import { AuthSchema } from "../schemas/user.schema";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db";
import { getNextShopModelId } from "../utils/nextId";

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

  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId, role } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const lastFaq = await prisma.faq.findFirst({
      where: { shopId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastFaq ? lastFaq.position + 1 : 1;
    const newId = await getNextShopModelId("faq", shopId);
    const newFaq = await prisma.faq.create({
      data: {
        shopId,
        id: newId,
        slug: parsed.data.question.toLowerCase().replace(/\s+/g, "-"),
        question: parsed.data.question,
        answer: parsed.data.answer,
        status: "active",
        position: newPosition,
        uid: uuidv4(),
      },
    });

    res.status(200).json({ success: "FAQ added successfully.", faq: newFaq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = updateFAQSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await prisma.faq.updateMany({
      where: {
        uid,
        shopId,
      },
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        status: parsed.data.status,
        position: parsed.data.position,
      },
    });

    const faq = await prisma.faq.findFirst({
      where: {
        uid,
        shopId,
      },
    });

    res.status(200).json({ success: "FAQ updated successfully.", faq });
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

  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { shopId, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

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

  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { shopId, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

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
