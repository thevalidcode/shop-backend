import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { UserAuthSchema } from "../schemas/user.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import {
  ConnectShippingAccountSchema,
  UpdateShippingAccountSchema,
  CreateShipmentSchema,
  BulkCreateShipmentsSchema,
  ShipmentFiltersSchema,
  querySchema,
} from "../schemas/shipping.schema";
import { encryptKey } from "../utils/encrypt";
import {
  createShipmentForOrder,
  getShippingProvider,
  getShippingRatesForCart,
} from "../services/shipping.services";
import { z } from "zod";
import { ShippingPlatform } from "../../prisma/generated";

/**
 * Admin: Connect shipping account
 */
export async function connectShippingAccount(req: Request, res: Response) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;

  const bodyParsed = ConnectShippingAccountSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: bodyParsed.error.flatten() });
  }

  const { platform, apiKey, testMode, isPreferred, webhookSecret } =
    bodyParsed.data;

  try {
    // Test connection before saving
    const provider = getShippingProvider(platform, apiKey, testMode || false);
    const testResult = await provider.testConnection(apiKey, testMode || false);

    if (!testResult.success) {
      return res
        .status(400)
        .json({ error: "Connection test failed", message: testResult.message });
    }

    // Check if account already exists for this platform
    const existingAccount = await prisma.shippingAccount.findFirst({
      where: { shopId, platform },
    });

    if (existingAccount) {
      return res.status(400).json({
        error: "Shipping account already connected for this platform",
      });
    }

    // Encrypt API key
    const { encryptedKey, iv } = encryptKey(apiKey);

    // Use a transaction to increment the counter and create the account,
    // and ensure if this is the first account it becomes preferred.
    const account = await prisma.$transaction(async (tx) => {
      const existingCount = await tx.shippingAccount.count({
        where: { shopId },
      });

      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { shippingAccountCounter: { increment: 1 } },
      });

      const isPreferredFinal = Boolean(isPreferred) || existingCount === 0;

      const created = await tx.shippingAccount.create({
        data: {
          shopScopedId: counter.shippingAccountCounter,
          shopId,
          platform,
          encryptedApiKey: encryptedKey,
          iv,
          testMode: testMode || false,
          isActive: true,
          isPreferred: isPreferredFinal,
          webhookSecret,
        },
      });

      if (isPreferredFinal) {
        await tx.shippingAccount.updateMany({
          where: {
            shopId,
            id: { not: created.id },
          },
          data: { isPreferred: false },
        });
      }

      return created;
    });

    res.json({
      message: "Shipping account connected successfully",
      account: {
        uid: account.uid,
        platform: account.platform,
        testMode: account.testMode,
        isActive: account.isActive,
        isPreferred: account.isPreferred,
        createdAt: account.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to connect shipping account",
      message: error.message,
    });
  }
}

/**
 * Admin: Get all shipping accounts for shop
 */
export async function getShippingAccounts(req: Request, res: Response) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;

  try {
    const accounts = await prisma.shippingAccount.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      select: {
        uid: true,
        shopScopedId: true,
        platform: true,
        testMode: true,
        isActive: true,
        isPreferred: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ accounts });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch shipping accounts",
      message: error.message,
    });
  }
}

/**
 * Admin: Update shipping account
 */
export async function updateShippingAccount(req: Request, res: Response) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;
  const { accountUid } = req.params;
  const accountUidStr = String(accountUid);

  const bodyParsed = UpdateShippingAccountSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: bodyParsed.error.flatten() });
  }

  try {
    const account = await prisma.shippingAccount.findFirst({
      where: { uid: accountUidStr, shopId },
    });

    if (!account) {
      return res.status(404).json({ error: "Shipping account not found" });
    }

    const updateData: any = {};

    if (bodyParsed.data.isActive !== undefined) {
      updateData.isActive = bodyParsed.data.isActive;
    }

    if (bodyParsed.data.isPreferred !== undefined) {
      updateData.isPreferred = bodyParsed.data.isPreferred;

      // If setting as preferred, unset others
      if (bodyParsed.data.isPreferred) {
        await prisma.shippingAccount.updateMany({
          where: {
            shopId,
            id: { not: account.id },
          },
          data: { isPreferred: false },
        });
      }
    }

    if (bodyParsed.data.testMode !== undefined) {
      updateData.testMode = bodyParsed.data.testMode;
    }

    if (bodyParsed.data.webhookSecret !== undefined) {
      updateData.webhookSecret = bodyParsed.data.webhookSecret;
    }

    const updatedAccount = await prisma.shippingAccount.update({
      where: { id: account.id },
      data: updateData,
    });

    res.json({
      message: "Shipping account updated successfully",
      account: {
        uid: updatedAccount.uid,
        platform: updatedAccount.platform,
        testMode: updatedAccount.testMode,
        isActive: updatedAccount.isActive,
        isPreferred: updatedAccount.isPreferred,
        updatedAt: updatedAccount.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update shipping account",
      message: error.message,
    });
  }
}

/**
 * Admin: Disconnect shipping account
 */
export async function disconnectShippingAccount(req: Request, res: Response) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;
  const { accountUid } = req.params;
  const accountUidStr = String(accountUid);

  try {
    const account = await prisma.shippingAccount.findFirst({
      where: { uid: accountUidStr, shopId },
    });

    if (!account) {
      return res.status(404).json({ error: "Shipping account not found" });
    }

    // Check if there are any shipments using this account
    const shipmentsCount = await prisma.shipment.count({
      where: { shippingAccountUid: account.uid },
    });

    if (shipmentsCount > 0) {
      return res.status(400).json({
        error: "Cannot disconnect shipping account",
        message: `This account has ${shipmentsCount} shipment(s) associated with it. Please ensure no active shipments are using this account before disconnecting.`,
      });
    }

    // Delete account
    await prisma.shippingAccount.delete({
      where: { id: account.id },
    });

    res.json({ message: "Shipping account disconnected successfully" });
  } catch (error: any) {
    console.error("Error disconnecting shipping account:", error);
    res.status(500).json({
      error: "Failed to disconnect shipping account",
      message: error.message,
    });
  }
}

/**
 * Admin: Create shipment for order
 */
export async function createShipment(req: Request, res: Response) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;

  const bodyParsed = CreateShipmentSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: bodyParsed.error.flatten() });
  }

  const { orderUid, weight, weightUnit, courierCode, platformOverride } =
    bodyParsed.data;

  try {
    const shipment = await createShipmentForOrder(shopId, orderUid, {
      weight,
      weightUnit,
      courierCode,
      platformOverride,
    });

    res.json({
      message: "Shipment created successfully",
      shipment: {
        uid: shipment.uid,
        orderUid: shipment.orderUid,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        courierName: shipment.courierName,
        status: shipment.status,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        labelUrl: shipment.labelUrl,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to create shipment", message: error.message });
  }
}

/**
 * Admin: Bulk create shipments
 */
export async function bulkCreateShipments(req: Request, res: Response) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;

  const bodyParsed = BulkCreateShipmentsSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: bodyParsed.error.flatten() });
  }

  const { orderUids, weight, weightUnit, platformOverride } = bodyParsed.data;

  try {
    const results = [];
    const errors = [];

    for (const orderUid of orderUids) {
      try {
        const shipment = await createShipmentForOrder(shopId, orderUid, {
          weight,
          weightUnit,
          platformOverride,
        });
        results.push({
          orderUid,
          success: true,
          shipmentUid: shipment.uid,
          trackingNumber: shipment.trackingNumber,
        });
      } catch (error: any) {
        errors.push({
          orderUid,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      message: `Created ${results.length} shipments, ${errors.length} failed`,
      results,
      errors,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to bulk create shipments",
      message: error.message,
    });
  }
}

/**
 * Admin: Get all shipments with filters
 */
export async function getShipments(req: Request, res: Response) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;

  const queryParsed = ShipmentFiltersSchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({
      error: "Invalid query params",
      details: queryParsed.error.flatten(),
    });
  }

  const {
    page = 1,
    limit = 20,
    status,
    platform,
    startDate,
    endDate,
  } = queryParsed.data;

  try {
    const where: any = { shopId };

    if (status) {
      where.status = status;
    }

    if (platform) {
      where.platform = platform;
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              orderRef: true,
              uid: true,
              status: true,
            },
          },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    res.json({
      shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch shipments", message: error.message });
  }
}

/**
 * User: Get shipment by order
 */
export async function getShipmentByOrder(req: Request, res: Response) {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId, user } = authParsed.data;
  const { orderUid } = req.params;
  const orderUidStr = String(orderUid);

  try {
    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { uid: orderUidStr, shopId, userUid: user.uid },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const shipment = await prisma.shipment.findFirst({
      where: { orderUid: orderUidStr, shopId },
      select: {
        uid: true,
        shopScopedId: true,
        trackingNumber: true,
        trackingUrl: true,
        courierName: true,
        status: true,
        estimatedDeliveryDate: true,
        actualDeliveryDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json({ shipment });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch shipment", message: error.message });
  }
}

/**
 * User: Get tracking events for shipment
 */
export async function getTrackingEvents(req: Request, res: Response) {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId, user } = authParsed.data;
  const { shipmentUid } = req.params;
  const shipmentUidStr = String(shipmentUid);

  try {
    // Verify shipment belongs to user's order
    const shipment = await prisma.shipment.findFirst({
      where: { uid: shipmentUidStr, shopId },
      include: {
        order: {
          select: { userUid: true },
        },
      },
    });

    if (!shipment || shipment.order.userUid !== user.uid) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const events = await prisma.trackingEvent.findMany({
      where: { shipmentUid: shipmentUidStr },
      orderBy: { timestamp: "desc" },
      select: {
        uid: true,
        status: true,
        location: true,
        description: true,
        timestamp: true,
        createdAt: true,
      },
    });

    res.json({ events });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch tracking events",
      message: error.message,
    });
  }
}

/**
 * User: Get shipping rates for a cart
 */
export async function getShippingRates(req: Request, res: Response) {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const queryParsed = querySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: queryParsed.error.flatten(),
    });
  }

  const { shopId } = authParsed.data;
  const { cartUid, billingInfoUid, platform } = queryParsed.data;

  try {
    const rates = await getShippingRatesForCart(
      shopId,
      cartUid,
      billingInfoUid,
      platform,
    );

    res.status(200).json({
      success: true,
      rates,
      count: rates.length,
    });
  } catch (error: any) {
    console.error("Get shipping rates error:", error);
    res.status(500).json({
      error: error.message || "Failed to get shipping rates",
    });
  }
}

/**
 * User: Get available shipping methods for the shop
 */
export async function getShippingMethods(req: Request, res: Response) {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    return res
      .status(401)
      .json({ error: "Unauthorized", details: authParsed.error.flatten() });
  }

  const { shopId } = authParsed.data;

  try {
    const accounts = await prisma.shippingAccount.findMany({
      where: { shopId, isActive: true },
      select: {
        uid: true,
        platform: true,
        isPreferred: true,
        testMode: true,
      },
      orderBy: [{ isPreferred: "desc" }, { createdAt: "desc" }],
    });

    const methods = accounts.map((account) => ({
      uid: account.uid,
      platform: account.platform,
      name:
        account.platform === "SENDBOX" ? "Sendbox Delivery" : "Shippo Shipping",
      isPreferred: account.isPreferred,
      testMode: account.testMode,
    }));

    res.status(200).json({
      success: true,
      methods,
      hasShipping: methods.length > 0,
    });
  } catch (error: any) {
    console.error("Get shipping methods error:", error);
    res.status(500).json({
      error: "Failed to get shipping methods",
    });
  }
}
