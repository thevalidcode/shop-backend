import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  ShopGeneralDataRequestSchema,
  shopIdSchema,
  UpdateGeneralDataRequestSchema,
  UpdateStylesRequestSchema,
} from "../schemas/shop.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { normalizeHost } from "../config/cors.config";
import { subscriptionService } from "../services/subscription.services";

export const getShopData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  try {
    const shop = await prisma.shop.findUnique({
      where: { uid: domain, status: "ACTIVE" },
      select: {
        shopId: true,
        timestamp: true,
        name: true,
        description: true,
        status: true,
      },
    });
    if (!shop) {
      res
        .status(404)
        .json({ error: "Active Shop not found for the given domain" });
      return;
    }

    try {
      // Get store data from Core Platform to get owner ID (cached)
      const coreStore = await subscriptionService.getStoreData(shop.shopId);

      if (!coreStore) {
        res.status(503).json({
          error: "Service Unavailable",
          message: "Unable to verify store subscription",
        });
        return;
      }

      // Get subscription with plan features (cached)
      const validation = await subscriptionService.getValidatedSubscription(
        shop.shopId,
      );

      if (!validation.subscription?.plan?.features) {
        res.status(503).json({
          error: "Service Unavailable",
          message: "Unable to fetch subscription details",
        });
        return;
      }

      // Return shop with features and subscription details
      res.json({
        ...shop,
        features: validation.subscription.plan.features,
        planName: validation.subscription.plan.name,
        subscriptionStatus: validation.subscription.status,
        startedAt: validation.subscription.startedAt,
        createdAt: validation.subscription.createdAt,
        expiresAt: validation.subscription.expiresAt,
        gracePeriod: validation.subscription.plan.gracePeriod,
        billingCycle: validation.subscription.billingCycle,
      });
    } catch (apiError: any) {
      res.status(503).json({
        error: "Service Unavailable",
        message: "Unable to fetch subscription details",
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch shop data." });
  }
};

export const getShopGeneralData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ShopGeneralDataRequestSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = parsed.data;

  try {
    const generalData = await prisma.setting.findFirst({
      where: { shopId },
    });

    if (!generalData) {
      res
        .status(404)
        .json({ error: "General Settings not found for the given shop" });
      return;
    }

    res.json(generalData);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch shop general data." });
  }
};

export const updateShopGeneralData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateGeneralDataRequestSchema.safeParse(req.body);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const bodyData = bodyParsed.data;

  try {
    await prisma.setting.upsert({
      where: {
        shopId,
      },
      create: {
        ...bodyData,
        shopId,
      },
      update: {
        ...bodyData,
      },
    });

    await prisma.shop.update({
      where: {
        shopId,
      },
      data: {
        name: bodyData.shopName,
        description: bodyData.shopDescription,
      },
    });

    res.json({ success: "Successfully updated the data." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update shop general data." });
  }
};

export const getStyles = async (req: Request, res: Response): Promise<void> => {
  const parsed = shopIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = parsed.data;

  try {
    const style = await prisma.designStyle.findFirst({ where: { shopId } });

    res.json(style || {});
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch shop styles." });
  }
};

export const updateShopStyles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateStylesRequestSchema.safeParse(req.body);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const bodyData = bodyParsed.data;

  try {
    const existing = await prisma.designStyle.findFirst({ where: { shopId } });

    if (!existing) {
      await prisma.designStyle.create({
        data: { ...bodyData, shopId, shopScopedId: 1 },
      });
    } else {
      await prisma.designStyle.update({
        where: { id: existing.id },
        data: bodyData,
      });
    }

    res.json({ success: "Updated styles successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update shop styles." });
  }
};

export const getSiteData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = shopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = parsed.data;

  try {
    const general = await prisma.setting.findFirst({ where: { shopId } });
    res.json(general || {});
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch site data." });
  }
};

export const completeOnboarding = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ShopGeneralDataRequestSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = parsed.data;

  try {
    const setting = await prisma.setting.update({
      where: { shopId },
      data: { onboardingCompleted: true },
    });

    res.status(200).json({ success: "Onboarding completed", setting });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update onboarding status" });
  }
};
