import { z } from "zod";
import { getDocs } from "../crud";
import type { Request, Response } from "express";

const storeIdQuerySchema = z.object({ domain: z.string().min(1) });
const storeIdSchema = z.object({ shop_id: z.coerce.number() });

export const getShopData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = storeIdQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { domain } = parsed.data;

  try {
    const shops = await getDocs("shops");
    const shop = shops.find((p: any) => p.uid === domain);
    if (!shop) {
      res.status(404).json({ error: "Shop not found for the given domain" });
      return;
    }
    res.json({
      shop_id: shop.shop_id,
      plan: shop.plan,
      timestamp: shop.timestamp,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getShopCSRFToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = storeIdQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { domain } = parsed.data;

  try {
    const shops = await getDocs("shops");
    const shop = shops.find((p: any) => p.uid === domain);
    if (!shop) {
      res.status(404).json({ error: "Shop not found for the given domain" });
      return;
    }
    res.json({ csrfToken: req.csrfToken() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStyles = async (req: Request, res: Response): Promise<void> => {
  const parsed = storeIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shop_id } = parsed.data;

  try {
    const result = await getDocs("design_styles", shop_id);
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSiteData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = storeIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shop_id } = parsed.data;

  try {
    const result = await getDocs("general", shop_id);
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await getDocs("currencies", 1);
    res.json(result[0].quotes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }
  const { uid, shop_id } = req.auth;

  try {
    const result = await getDocs("users", shop_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password", "api_key"],
    });
    if (!result) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }
  const { shop_id, uid, role } = req.auth;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const result = await getDocs("admins", shop_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password", "api_key"],
    });
    if (!result) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
