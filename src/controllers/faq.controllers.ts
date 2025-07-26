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
import {
  getDocs,
  addShopDoc,
  updateShopDoc,
  deleteShopDoc,
  deleteShopDocs,
} from "../crud";

export const getFAQs = async (req: Request, res: Response): Promise<void> => {
  const parsed = ShopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shop_id } = parsed.data;
  try {
    const faqs = await getDocs("faqs", shop_id);
    const sorted = faqs.sort((a: any, b: any) => a.position - b.position);
    res.status(200).json(sorted);
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
  const { faq_id } = parsed.data;

  const queryParsed = ShopIdSchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }
  const { shop_id } = queryParsed.data;
  try {
    const faq = await getDocs("faqs", shop_id, {
      find: { field: "id", operator: "===", value: faq_id },
    });
    res.status(200).json({ faq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = createFAQSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shop_id, role } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    const faqs = await getDocs("faqs", shop_id);
    const newId =
      faqs.reduce((max: number, f: any) => Math.max(max, f.id), 0) + 1;
    const faqData = {
      question: parsed.data.question,
      answer: parsed.data.answer,
      status: "Active",
      position: newId,
    };
    await addShopDoc("faqs", faqData, shop_id);
    res.status(200).json({ success: "FAQ added successfully.", faq: faqData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = updateFAQSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);
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
    await updateShopDoc("faqs", uid, parsed.data, shop_id);
    const faq = await getDocs("faqs", shop_id, {
      find: { field: "uid", operator: "===", value: uid },
    });
    res.status(200).json({ success: "FAQ updated successfully.", faq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = deleteFAQSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);
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
    {
      res.status(403).json({ error: "Unauthorised User." });
      return;
    }
  }

  try {
    await deleteShopDoc("faqs", uid, shop_id);
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
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { shop_id, role } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deleteShopDocs("faqs", uids, shop_id);
    res.status(200).json({ success: "FAQs deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
