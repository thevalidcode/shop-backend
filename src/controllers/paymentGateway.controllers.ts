import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { encryptKey } from "../utils/encrypt";
import { UserAuthSchema } from "../schemas/user.schema";
import {
  DeletePaymentGatewaySchema,
  GetPaymentGatewayByIdSchema,
  PaymentCreateRequestSchema,
  PaymentUpdateRequestSchema,
} from "../schemas/paymentGateway.schema";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { Prisma } from "../../prisma/generated";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const getPaymentGateways = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;

  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { shopId },
      select: {
        id: true,
        shopScopedId: true,
        shopId: true,
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        description: true,
        content: true,
        status: true,
        min: true,
        max: true,
        currency: true,
        feePercent: true,
        webhookUrl: true,
      },
      orderBy: { position: "asc" },
    });

    res.status(200).json(gateways);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewayByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = GetPaymentGatewayByIdSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const { shopId } = authParsed.data;

  try {
    const gateway = await prisma.paymentGateway.findFirst({
      where: { uid, shopId },
      select: {
        id: true,
        shopScopedId: true,
        shopId: true,
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        description: true,
        content: true,
        status: true,
        min: true,
        max: true,
        currency: true,
        feePercent: true,
        webhookUrl: true,
      },
    });

    res.status(200).json(gateway);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewaysForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;

  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { status: "ACTIVE", shopId },
      select: {
        id: true,
        shopScopedId: true,
        shopId: true,
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        description: true,
        content: true,
        position: true,
        min: true,
        max: true,
        currency: true,
        feePercent: true,
      },
      orderBy: { position: "asc" },
    });

    res.status(200).json(gateways);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewayByUidForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = GetPaymentGatewayByIdSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }
  const { uid } = paramsParsed.data;
  const { shopId } = authParsed.data;

  try {
    const gateway = await prisma.paymentGateway.findFirst({
      where: { uid, status: "ACTIVE", shopId },
      select: {
        id: true,
        shopScopedId: true,
        shopId: true,
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        description: true,
        content: true,
        position: true,
        min: true,
        max: true,
        currency: true,
        feePercent: true,
      },
    });

    res.status(200).json(gateway);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addPaymentGateway = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = PaymentCreateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }
  const { shopId } = authParsed.data;
  const reqData = bodyParsed.data;
  if (reqData.max < reqData.min) {
    res.status(400).json({ error: "Max amount must be greater than or equal to min amount." });
    return;
  }

  if (reqData.platform !== "MANUAL") {
    if (!reqData.secretKey) {
      res.status(400).json({
        error: "Secret key is required for this payment gateway.",
      });
      return;
    }
  }
  try {
    const gateway = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { paymentGatewayCounter: { increment: 1 } },
      });

      const shop = await tx.shop.findFirst({
        where: { shopId },
        select: { uid: true },
      });

      const paymentData: Prisma.PaymentGatewayCreateInput = {
        uid: uuidv4(),
        name: reqData.name,
        shopScopedId: counter.paymentGatewayCounter,
        shop: { connect: { shopId } },
        description: reqData.description,
        content: reqData.content,
        platform: reqData.platform,
        position: counter.paymentGatewayCounter,
        min: reqData.min,
        max: reqData.max,
        currency: reqData.currency,
        feePercent: reqData.feePercent ?? 0,
        status: "ACTIVE",
        signature: crypto.randomBytes(32).toString("hex"),
        encryptedSecretKey: undefined,
        iv: undefined,
      };

      if (reqData.secretKey) {
        const encrypted_key = encryptKey(reqData.secretKey);
        paymentData.encryptedSecretKey = encrypted_key.encryptedKey;
        paymentData.iv = encrypted_key.iv;
        paymentData.webhookUrl = `https://api.${
          shop?.uid //The domain name
        }/v1/webhooks/${reqData.platform.toLowerCase()}`;
      }

      const payment = await tx.paymentGateway.create({
        data: paymentData,
      });

      return payment;
    });
    const signature = gateway.signature;

    res.status(200).json({
      success: "Payment gateway created successfully",
      signature,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePaymentGateway = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = PaymentUpdateRequestSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const reqData = parsed.data;
  const { shopId } = authParsed.data;
  try {
    const existing = await prisma.paymentGateway.findFirst({
      where: { uid: reqData.uid, shopId },
      select: { platform: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Payment gateway not found or does not belong to this shop." });
      return;
    }

    if (
      typeof reqData.min === "number" &&
      typeof reqData.max === "number" &&
      reqData.max < reqData.min
    ) {
      res.status(400).json({ error: "Max amount must be greater than or equal to min amount." });
      return;
    }

    const paymentGatewayData: Prisma.PaymentGatewayUpdateInput = {
      ...(reqData.name !== undefined ? { name: reqData.name } : {}),
      ...(reqData.description !== undefined
        ? { description: reqData.description }
        : {}),
      ...(reqData.content !== undefined ? { content: reqData.content } : {}),
      ...(reqData.platform !== undefined ? { platform: reqData.platform } : {}),
      ...(reqData.status !== undefined ? { status: reqData.status } : {}),
      ...(reqData.feePercent !== undefined
        ? { feePercent: reqData.feePercent }
        : {}),
      ...(reqData.min !== undefined ? { min: reqData.min } : {}),
      ...(reqData.max !== undefined ? { max: reqData.max } : {}),
      ...(reqData.currency !== undefined ? { currency: reqData.currency } : {}),
      signature: crypto.randomBytes(32).toString("hex"),
    };

    if (reqData.secretKey) {
      const encrypted_key = encryptKey(reqData.secretKey);
      paymentGatewayData.encryptedSecretKey = encrypted_key.encryptedKey;
      paymentGatewayData.iv = encrypted_key.iv;
    }

    const updateResult = await prisma.paymentGateway.updateMany({
      where: { uid: reqData.uid, shopId },
      data: {
        ...paymentGatewayData,
      },
    });

    if (updateResult.count === 0) {
      res.status(404).json({ error: "Payment gateway not found or does not belong to this shop." });
      return;
    }

    const payment = await prisma.paymentGateway.findFirst({
      where: { uid: reqData.uid, shopId },
    });

    res.status(200).json({
      success: "Payment gateway updated successfully.",
      signature: payment?.signature,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePaymentGateway = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = DeletePaymentGatewaySchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid } = parsed.data;

  const { shopId } = authParsed.data;
  try {
    await prisma.paymentGateway.delete({
      where: { uid, shopId },
    });

    res.status(200).json({ success: "Payment gateway deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
