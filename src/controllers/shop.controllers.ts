import { z } from "zod";
import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import { CreateContactMessageSchema } from "../schemas/shop.schema";
import { sendEmail } from "../emails";

const storeIdQuerySchema = z.object({ domain: z.string().min(1) });
const storeIdSchema = z.object({ shopId: z.coerce.number() });

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
      shopId: shop.shopId,
      plan: shop.plan,
      timestamp: shop.timestamp,
    });
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
  const { shopId } = parsed.data;

  try {
    const style = await prisma.designStyle.findFirst({
      where: { shopId },
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
  const { shopId } = parsed.data;

  try {
    const siteData = await prisma.general.findFirst({
      where: { shopId },
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
  const { uid, shopId } = req.auth;

  try {
    const user = await prisma.user.findFirst({
      where: {
        uid,
        shopId,
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

// NEW: Get public shop info by domain or shopId
export const getShopByIdentifier = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { identifier } = req.params; // Could be shopId or domain

  try {
    let shop;

    // Try to find by shopId first (if it's a number)
    if (!isNaN(Number(identifier))) {
      shop = await prisma.shop.findFirst({
        where: { shopId: Number(identifier) },
        include: {
          General: {
            select: {
              title: true,
              logoUrl: true,
              faviconUrl: true,
              defaultClientCurrency: true,
            },
          },
        },
      });
    }

    // If not found and looks like a domain, try finding by UID or other identifier
    if (!shop) {
      shop = await prisma.shop.findFirst({
        where: { uid: identifier },
        include: {
          General: {
            select: {
              title: true,
              logoUrl: true,
              faviconUrl: true,
              defaultClientCurrency: true,
            },
          },
        },
      });
    }

    if (!shop) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }

    res.status(200).json({
      shopId: shop.shopId,
      uid: shop.uid,
      status: shop.status,
      plan: shop.plan,
      ssl: shop.ssl,
      settings: shop.General[0] || null,
    });
  } catch (error: any) {
    console.error("Error fetching shop:", error);
    res.status(500).json({ error: "Failed to fetch shop information" });
  }
};

// NEW: List all active shops (for discovery)
export const getActiveShops = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shops = await prisma.shop.findMany({
      where: { status: "active" },
      include: {
        General: {
          select: {
            title: true,
            logoUrl: true,
            defaultClientCurrency: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    const formattedShops = shops.map((shop) => ({
      shopId: shop.shopId,
      domain: shop.uid,
      plan: shop.plan,
      timestamp: shop.timestamp,
      settings: shop.General[0] || null,
    }));

    res.status(200).json(formattedShops);
  } catch (error: any) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ error: "Failed to fetch shops" });
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
  const { shopId, uid, role } = req.auth;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: {
        uid,
        shopId,
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

export const createContactMessage = async (req: Request, res: Response) => {
  const validation = CreateContactMessageSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { name, email, phone, message, shopId } = validation.data;

  try {
    await prisma.contactMessage.create({
      data: { name, email, phone, message, shopId },
    });

    // Notify admin via email
    await sendEmail(
      undefined,
      "newSupport", // We can reuse the "newSupport" template for this
      { user: name, subject: "New Contact Form Submission", message },
      shopId
    );

    res.status(201).json({ success: "Message sent successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Could not send message." });
  }
};
