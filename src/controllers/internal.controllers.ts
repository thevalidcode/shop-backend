import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  createShopSchema,
  PaginationQuerySchema,
  UidSchema,
  UpdateShopSchema,
} from "../schemas/internal.schema";
import { CreateShop, DeleteShop } from "../services/shop";
import { ShopError } from "../errors/shop.error";

/**
 * Standardized error response format for API callers
 */
const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: any
) => {
  res.status(statusCode).json({
    error: {
      message,
      code: code || "UNKNOWN_ERROR",
      ...(details && { details }),
    },
  });
};

export const getOrdersForInternalAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = PaginationQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      sendErrorResponse(
        res,
        400,
        "Invalid pagination parameters",
        "VALIDATION_ERROR",
        parsed.error.flatten()
      );
      return;
    }

    const { page, limit } = parsed.data;

    const skip = (page - 1) * limit;

    // Count total orders
    const total = await prisma.order.count();

    // Fetch paginated orders
    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        user: true,
      },
    });

    res.status(200).json({
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    sendErrorResponse(res, 500, "Failed to fetch orders", "DATABASE_ERROR");
  }
};

export const createShop = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createShopSchema.safeParse(req.body);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid shop creation parameters",
      "VALIDATION_ERROR",
      parsed.error.flatten()
    );
    return;
  }

  try {
    const result = await CreateShop(parsed.data);
    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("Error creating shop:", err);

    if (err instanceof ShopError) {
      const statusCode =
        err.code === "DOMAIN_TAKEN" || err.code === "ADMIN_EMAIL_TAKEN"
          ? 409
          : err.code === "CLI_ERROR"
          ? 500
          : 400;

      sendErrorResponse(res, statusCode, err.message, err.code);
    } else {
      sendErrorResponse(res, 500, "Failed to create shop", "DATABASE_ERROR");
    }
  }
};

export const deleteShop = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = UidSchema.safeParse(req.params);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid shop UID",
      "VALIDATION_ERROR",
      parsed.error.flatten()
    );
    return;
  }
  const { uid } = parsed.data;
  try {
    const shop = await prisma.shop.findUnique({ where: { uid } });

    if (!shop) {
      sendErrorResponse(res, 404, "Shop not found", "STORE_NOT_FOUND");
      return;
    }

    await DeleteShop({ uid });
    res.json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting shop:", err);

    if (err instanceof ShopError) {
      sendErrorResponse(res, 500, err.message, err.code);
    } else {
      sendErrorResponse(res, 500, "Failed to delete shop", "DATABASE_ERROR");
    }
  }
};

export const updateShop = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = UidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid shop UID",
      "VALIDATION_ERROR",
      paramsParsed.error.flatten()
    );
    return;
  }
  const { uid } = paramsParsed.data;

  const parsed = UpdateShopSchema.safeParse(req.body);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid shop update parameters",
      "VALIDATION_ERROR",
      parsed.error.flatten()
    );
    return;
  }
  try {
    const shop = await prisma.shop.findUnique({ where: { uid } });

    if (!shop) {
      sendErrorResponse(res, 404, "Shop not found", "STORE_NOT_FOUND");
      return;
    }

    const setting = await prisma.setting.findUnique({
      where: { shopId: shop.shopId },
    });

    const settingData = {
      logoUrl: parsed.data.logoUrl || setting?.logoUrl,
      faviconUrl: parsed.data.faviconUrl || setting?.faviconUrl,
      defaultClientCurrency:
        parsed.data.defaultClientCurrency || setting?.defaultClientCurrency,
      showBanner: parsed.data.showBanner || setting?.showBanner,
      onboardingCompleted:
        parsed.data.onboardingCompleted || setting?.onboardingCompleted,
    };

    await prisma.setting.upsert({
      where: {
        shopId: shop.shopId,
      },
      create: {
        ...settingData,
        shopId: shop.shopId,
      },
      update: {
        logoUrl: settingData.logoUrl,
        faviconUrl: settingData.faviconUrl,
      },
    });

    await prisma.shop.update({
      where: {
        uid,
      },
      data: {
        name: parsed.data.storeName,
        features: parsed.data.features,
        description: parsed.data.storeDescription,
        status: parsed.data.status,
      },
    });
    res.json({
      success: true,
      message: "Shop updated successfully",
    });
  } catch (err: any) {
    console.error("Error updating shop:", err);
    sendErrorResponse(res, 500, "Failed to update shop", "DATABASE_ERROR");
  }
};
