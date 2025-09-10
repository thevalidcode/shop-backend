import { env } from "../config/env.config";
import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { randomUUID } from "crypto";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CreatePaymentGatewaySchema,
  UpdatePaymentGatewaySchema,
  ModifyWalletBalanceSchema,
  UpdateContactMessageSchema,
} from "../schemas/admin.schema";
import {
  UpdateGeneralSettingsSchema,
  UpdateDesignSettingsSchema,
} from "../schemas/shop.schema";
import { encryptKey } from "../utils/encrypt";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

// NEW: Admin Registration Endpoint (Shop Owner Registration)
export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const registerSchema = z.object({
    email: z.string().email(),
    plan: z.string(),
    features: z.any(),
    username: z.string().min(3),
    password: z.string().min(8),
    shopName: z.string().min(1),
    shopDomain: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9-]+$/, {
        message:
          "Domain must contain only lowercase letters, numbers, and hyphens",
      }),
  });

  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { email, username, password, shopName, shopDomain, plan, features } =
    validation.data;

  try {
    // Check if admin already exists globally
    const existingAdmin = await prisma.admin.findFirst({
      where: { email },
    });

    if (existingAdmin) {
      res
        .status(400)
        .json({ error: "An admin account with this email already exists." });
      return;
    }

    // Check if shop domain is already taken
    const existingShop = await prisma.shop.findFirst({
      where: { uid: shopDomain },
    });

    if (existingShop) {
      res.status(400).json({
        error:
          "This shop domain is already taken. Please choose a different one.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create shop and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the next available shopId
      const lastShop = await tx.shop.findFirst({
        orderBy: { shopId: "desc" },
        select: { shopId: true },
      });
      const nextShopId = lastShop ? lastShop.shopId + 1 : 1;

      // Create new shop with chosen domain
      const shop = await tx.shop.create({
        data: {
          shopId: nextShopId,
          uid: shopDomain, // Use chosen domain instead of random UUID
          ssl: false,
          plan,
          features,
          name: shopName,
          status: "ACTIVE",
        },
      });

      // Initialize shop counter
      await tx.shopCounter.create({
        data: {
          shopId: shop.shopId,
          productCounter: 0,
          orderCounter: 0,
          blogCounter: 0,
          faqCounter: 0,
          categoryCounter: 0,
          userCounter: 0,
          emailLogCounter: 0,
        },
      });

      // Create admin for the new shop
      const admin = await tx.admin.create({
        data: {
          uid: randomUUID(),
          email,
          username,
          password: hashedPassword,
          apiKey: randomUUID(),
          role: "BASIC",
          status: "ACTIVE",
          shopId: shop.shopId,
        },
      });

      // Create shop general settings
      await tx.general.create({
        data: {
          uid: randomUUID(),
          shopId: shop.shopId,
          title: shopName || "My Shop",
          defaultClientCurrency: "NGN",
        },
      });

      return { shop, admin };
    });

    // Generate JWT token for immediate login
    const token = jwt.sign(
      {
        email: result.admin.email,
        shopId: result.shop.shopId,
        apiKey: result.admin.apiKey,
        role: "admin",
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const csrfToken = randomBytes(32).toString("hex");

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("auth_token", token, cookieOptions);
    res.cookie("csrf_token", csrfToken, { ...cookieOptions, httpOnly: false });

    res.status(201).json({
      success: "Shop and admin account created successfully!",
      shop: {
        shopId: result.shop.shopId,
        domain: result.shop.uid,
        name: shopName,
        url: `https://${result.shop.uid}`, // This would be your actual platform domain
        status: result.shop.status,
        plan: result.shop.plan,
      },
      admin: {
        uid: result.admin.uid,
        email: result.admin.email,
        username: result.admin.username,
        role: result.admin.role,
      },
      nextSteps: [
        "Set up your payment gateways in the admin panel",
        "Add your first products",
        "Customize your shop appearance",
        `Share your shop URL: https://${result.shop.uid}`,
      ],
    });
  } catch (error: any) {
    console.error("Admin registration failed:", error);
    res.status(500).json({ error: "Failed to create admin account and shop." });
  }
};

// NEW: Check domain availability
export const checkDomainAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { domain } = req.params;

  // Validate domain format
  const domainRegex = /^[a-z0-9-]+$/;
  if (
    !domain ||
    domain.length < 3 ||
    domain.length > 30 ||
    !domainRegex.test(domain)
  ) {
    res.status(400).json({
      available: false,
      error:
        "Domain must be 3-30 characters long and contain only lowercase letters, numbers, and hyphens",
    });
    return;
  }

  try {
    const existingShop = await prisma.shop.findFirst({
      where: { uid: domain },
    });

    res.status(200).json({
      domain,
      available: !existingShop,
      message: existingShop
        ? "This domain is already taken"
        : "Domain is available!",
      suggestedUrl: `https://${domain}.yourplatform.com`,
    });
  } catch (error: any) {
    console.error("Error checking domain availability:", error);
    res.status(500).json({ error: "Failed to check domain availability" });
  }
};

export const updateGeneralSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const validation = UpdateGeneralSettingsSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  try {
    const settings = await prisma.general.upsert({
      where: { shopId },
      update: validation.data,
      create: {
        ...validation.data,
        shopId,
        uid: randomUUID(),
      },
    });
    res.status(200).json(settings);
  } catch (error: any) {
    console.error("Error updating general settings:", error);
    res.status(500).json({ error: "Failed to update general settings." });
  }
};

export const updateDesignSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const validation = UpdateDesignSettingsSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const updateData = validation.data;

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ error: "No fields to update provided." });
    return;
  }

  try {
    const existingSettings = await prisma.designStyle.findUnique({
      where: { shopId },
    });

    if (existingSettings) {
      const updatedSettings = await prisma.designStyle.update({
        where: { shopId },
        data: updateData,
      });
      res.status(200).json(updatedSettings);
    } else {
      const { title, hex, schema } = updateData;
      if (title === undefined || hex === undefined || schema === undefined) {
        res.status(400).json({
          error:
            "When creating design settings for the first time, 'title', 'hex', and 'schema' fields are all required.",
        });
        return;
      }

      const newSettings = await prisma.designStyle.create({
        data: {
          uid: randomUUID(),
          shopId,
          title,
          hex,
          schema,
        },
      });
      res.status(201).json(newSettings);
    }
  } catch (error: any) {
    console.error("Error updating design settings:", error);
    res.status(500).json({ error: "Failed to update design settings." });
  }
};

export const getPaymentGateways = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { shopId },
      select: {
        uid: true,
        name: true,
        publicKey: true,
        isActive: true,
      },
    });
    const safeGateways = gateways.map((g) => ({
      ...g,
      secretKey: "••••••••••••••••",
    }));
    res.status(200).json(safeGateways);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment gateways." });
  }
};

export const createPaymentGateway = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const validation = CreatePaymentGatewaySchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { name, publicKey, secretKey, isActive } = validation.data;
  const { encryptedKey, iv } = encryptKey(secretKey);

  try {
    const newGateway = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId: shopId },
        data: { paymentGatewayCounter: { increment: 1 } },
      });
      const data = await tx.paymentGateway.create({
        data: {
          uid: randomUUID(),
          shopId,
          shopScopedId: counter.paymentGatewayCounter,
          name,
          publicKey,
          encryptedSecretKey: encryptedKey,
          iv,
          isActive,
        },
      });

      return data;
    });
    const { encryptedSecretKey, iv: _, ...safeGateway } = newGateway;
    res.status(201).json(safeGateway);
  } catch (error) {
    res.status(500).json({
      error:
        "Failed to create payment gateway. A gateway with this name might already exist.",
    });
  }
};

export const updatePaymentGateway = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const { uid } = req.params;
  const validation = UpdatePaymentGatewaySchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { name, publicKey, secretKey, isActive } = validation.data;

  const updateData: any = { name, publicKey, isActive };

  if (secretKey) {
    const { encryptedKey, iv } = encryptKey(secretKey);
    updateData.encryptedSecretKey = encryptedKey;
    updateData.iv = iv;
  }

  try {
    const result = await prisma.paymentGateway.updateMany({
      where: { uid, shopId },
      data: updateData,
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Payment gateway not found." });
      return;
    }
    res.status(200).json({ success: "Gateway updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment gateway." });
  }
};

export const deletePaymentGateway = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const { uid } = req.params;

  try {
    const result = await prisma.paymentGateway.deleteMany({
      where: { uid, shopId },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Payment gateway not found." });
      return;
    }

    res.status(200).json({ success: "Payment gateway deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete payment gateway." });
  }
};

/**
 * @desc    Add funds to a user's wallet.
 * @route   POST /api/v1/admin/users/:userUid/wallet/credit
 * @access  Private (Admin)
 */
export const creditUserWallet = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const { userUid } = req.params;

  const validation = ModifyWalletBalanceSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { amount, description } = validation.data;
  const decimalAmount = new Decimal(amount);

  try {
    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.updateMany({
        where: {
          uid: userUid,
          shopId: shopId,
        },
        data: {
          balance: {
            increment: decimalAmount,
          },
        },
      });

      if (updatedUser.count === 0) {
        throw new Error("UserNotFound");
      }
      const counter = await tx.shopCounter.update({
        where: { shopId: shopId },
        data: { walletTransactionCounter: { increment: 1 } },
      });

      await tx.walletTransaction.create({
        data: {
          userUid,
          shopId,
          amount: decimalAmount,
          shopScopedId: counter.walletTransactionCounter,
          description,
          type: "CREDIT",
        },
      });
    });

    res.status(200).json({ success: "Wallet credited successfully." });
  } catch (error: any) {
    if (error.message === "UserNotFound") {
      res.status(404).json({ error: "User not found in this shop." });
      return;
    }

    console.error("Error crediting user wallet:", error);
    res.status(500).json({
      error: "Transaction failed. The user's balance was not updated.",
    });
  }
};

export const debitUserWallet = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const { userUid } = req.params;
  const validation = ModifyWalletBalanceSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  const { amount, description } = validation.data;
  const decimalAmount = new Decimal(amount);

  try {
    const user = await prisma.user.findFirst({
      where: { uid: userUid, shopId },
    });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.balance.lessThan(decimalAmount)) {
      res.status(400).json({ error: "Insufficient balance." });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { uid: userUid },
        data: {
          balance: { decrement: decimalAmount },
          spent: { increment: decimalAmount },
        },
      });
      const counter = await tx.shopCounter.update({
        where: { shopId: shopId },
        data: { walletTransactionCounter: { increment: 1 } },
      });
      await tx.walletTransaction.create({
        data: {
          userUid,
          shopId,
          shopScopedId: counter.walletTransactionCounter,
          amount: decimalAmount,
          description,
          type: "DEBIT",
        },
      });
    });

    res.status(200).json({ success: "Wallet debited successfully." });
  } catch (error) {
    res.status(500).json({ error: "Transaction failed." });
  }
};

export const getWalletHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const { userUid } = req.params;
  try {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userUid, shopId },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet history." });
  }
};

export const getReferrals = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  try {
    const referrers = await prisma.user.findMany({
      where: {
        shopId,
        referrals: { some: {} },
      },
      select: {
        uid: true,
        username: true,
        email: true,
        referrals: {
          select: {
            uid: true,
            username: true,
            email: true,
            timestamp: true,
          },
        },
      },
    });
    res.status(200).json(referrers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch referral data." });
  }
};

export const getContactMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  // ... no changes needed here ...
  const { shopId } = req.auth!;
  try {
    const messages = await prisma.contactMessage.findMany({
      where: { shopId },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contact messages." });
  }
};

export const updateContactMessageStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const { uid } = req.params;
  const validation = UpdateContactMessageSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  try {
    const result = await prisma.contactMessage.updateMany({
      where: { uid, shopId },
      data: { status: validation.data.status },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    res.status(200).json({ success: "Message status updated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update message status." });
  }
};

export const deleteContactMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shopId } = req.auth!;
  const { uid } = req.params;

  try {
    const result = await prisma.contactMessage.deleteMany({
      where: {
        uid,
        shopId, // Ensures an admin can only delete messages from their own shop
      },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Contact message not found." });
      return;
    }

    res.status(200).json({ success: "Contact message deleted successfully." });
  } catch (error: any) {
    console.error("Failed to delete contact message:", error);
    res.status(500).json({ error: "Failed to delete contact message." });
  }
};
