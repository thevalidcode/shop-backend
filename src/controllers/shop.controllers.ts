import { z } from "zod";
import { prisma } from "../config/db";
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
    const shop = await prisma.shop.findUnique({
      where: { uid: domain },
      select: {
        shopId: true,
        plan: true,
        timestamp: true,
      },
    });
    if (!shop) {
      res.status(404).json({ error: "Shop not found for the given domain" });
      return;
    }
    res.json({
      shop_id: shop.shopId,
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
    const shop = await prisma.shop.findUnique({
      where: { uid: domain },
    });
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
    const style = await prisma.designStyle.findFirst({
      where: { shopId: shop_id },
    });
    res.json(style);
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
    const siteData = await prisma.general.findFirst({
      where: { shopId: shop_id },
    });
    res.json(siteData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rate = await prisma.currency.findFirst({
      select: { quotes: true },
    });
    res.json(rate?.quotes || {});
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
    const user = await prisma.user.findFirst({
      where: {
        uid,
        shopId: shop_id,
      },
      select: {
        password: false,
        apiKey: false,
        uid: true,
        username: true,
        role: true,
        email: true,
        timestamp: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
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
    const admin = await prisma.admin.findFirst({
      where: {
        uid,
        shopId: shop_id,
      },
      select: {
        password: false,
        apiKey: false,
        uid: true,
        username: true,
        role: true,
        email: true,
        timestamp: true,
      },
    });
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(admin);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
