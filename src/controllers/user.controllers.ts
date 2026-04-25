import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { env } from "../config/env.config";
import {
  AuthenticateUserSchema,
  UserAuthSchema,
  CreateUserInputSchema,
  DeleteUserSchema,
  DeleteUsersSchema,
  UpdateUserByAdminRequestSchema,
  UserUpdateRequestSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  VerifySessionCodeBodySchema,
} from "../schemas/user.schema";
import crypto from "crypto";
import { Prisma } from "../../prisma/generated";
import { sendUserEmail } from "../emails";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { ShopIdSchema, UidSchema } from "../schemas/common.schema";
import { normalizeHost } from "../config/cors.config";
import { encryptKey } from "../utils/encrypt";

const hashApiKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

async function getNextShopScopedId(
  shopId: number,
  tx: Prisma.TransactionClient,
): Promise<number> {
  const counter = await tx.shopCounter.upsert({
    where: { shopId },
    update: { userCounter: { increment: 1 } },
    create: { shopId, userCounter: 1 },
  });

  return counter.userCounter;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const parsed = AdminAuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId } = parsed.data;

  try {
    const allUsers = await prisma.user.findMany({
      where: { shopId },
      orderBy: { shopScopedId: "desc" },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        status: true,
        role: true,
        phone: true,
        balance: true,
        fullName: true,
        image: true,
        refCode: true,
        spent: true,
        ref: true,
        timestamp: true,
        updatedAt: true,
        currency: true,
        shopScopedId: true,
      },
    });
    res.status(200).json(allUsers);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = CreateUserInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  const { shopId, email, fullName, ref, password } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const emailExists = await tx.user.findFirst({
        where: { email, shopId },
      });

      if (emailExists) {
        res.status(400).send({ error: "Email already exists" });
        return;
      }

      const username = email.split("@")[0] + Math.floor(Math.random() * 1000);
      const { phone } = parsed.data;

      const hashedPassword = await bcrypt.hash(password, 10);
      const shopScopedId = await getNextShopScopedId(shopId, tx);

      const rawApiKey = uuidv4();
      const { encryptedKey, iv } = encryptKey(rawApiKey);

      const newUser = await tx.user.create({
        data: {
          shopId,
          shopScopedId,
          email,
          fullName,
          phone,
          username,
          password: hashedPassword,
          uid: uuidv4(),
          encryptedApiKey: encryptedKey,
          apiKeyIv: iv,
          apiKeyHash: hashApiKey(rawApiKey),
          ref,
        },
      });

      if (ref) {
        await tx.user.update({
          where: { refCode: ref },
          data: { referrals: { connect: { id: newUser.id } } },
        });
      }

      const token = jwt.sign({ uid: newUser.uid, shopId }, env.JWT_SECRET, {
        expiresIn: "7d",
      });

      const csrfToken = crypto.randomBytes(32).toString("hex");

      res.cookie("csrf_token", csrfToken, {
        httpOnly: false,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
      });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
      });

      // Send welcome email to new user
      try {
        const shop = await prisma.shop.findUnique({ where: { shopId } });
        const shopUrl = shop?.uid ? `https://${shop.uid}` : "";

        await sendUserEmail(shopId, newUser.email, "WELCOME_EMAIL", {
          userName: newUser.fullName || newUser.username,
          loginUrl: `${shopUrl}/auth/signin`,
          accountEmail: newUser.email,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      res.status(200).send({
        success: "Created Successfully",
        user: {
          id: newUser.id,
          shopScopedId: newUser.shopScopedId,
          email: newUser.email,
          username: newUser.username,
        },
      });
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const parsed = AuthenticateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  const { email, password, shopId } = parsed.data;

  try {
    const account = await prisma.user.findFirst({ where: { email, shopId } });

    if (!account) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    if ("status" in account && account.status === "BANNED") {
      res.status(403).json({ error: "You’ve been banned. Contact support." });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    const role = account.role;

    const token = jwt.sign({ uid: account.uid, shopId }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const csrfToken = crypto.randomBytes(32).toString("hex");

    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
    });

    const {
      password: _,
      resetToken,
      resetTokenExpiry,
      encryptedApiKey: __encryptedApiKey,
      apiKeyIv: __apiKeyIv,
      apiKeyHash: __apiKeyHash,
      ...safeUser
    } = account;
    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};

export const getUserByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsSchema = UidSchema.safeParse(req.params);
  const parsed = UserAuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!paramsSchema.success) {
    res.status(400).json({ error: paramsSchema.error.flatten() });
    return;
  }
  const { shopId } = parsed.data;
  const { uid } = paramsSchema.data;

  try {
    const user = await prisma.user.findUnique({
      where: { uid, shopId },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        status: true,
        role: true,
        phone: true,
        balance: true,
        fullName: true,
        spent: true,
        image: true,
        refCode: true,
        ref: true,
        timestamp: true,
        updatedAt: true,
        currency: true,
        shopScopedId: true,
      },
    });
    res.status(200).send({ user });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const verifySession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = VerifySessionCodeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sessionCode, shopId } = parsed.data;

  const session = await prisma.sessionCode.findUnique({
    where: { code: sessionCode, shopId },
  });

  if (!session || session.used || new Date(session.expiresAt) < new Date()) {
    res.status(400).json({ error: "Session code expired or invalid" });
    return;
  }

  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  let account: any = null;

  account = await prisma.user.findFirst({
    where: { email: session.email, shopId: session.shopId },
  });
  if (!account) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const user = account;

  if (!user) {
    res.status(404).json({
      error: "User not found",
    });
    return;
  }

  await prisma.sessionCode.update({
    where: { code: sessionCode },
    data: { used: true },
  });

  const token = jwt.sign({ uid: user.uid, shopId }, env.JWT_SECRET, {
    expiresIn: "7d",
  });
  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
  });

  const {
    password: _,
    resetToken,
    resetTokenExpiry,
    encryptedApiKey: __encryptedApiKey,
    apiKeyIv: __apiKeyIv,
    apiKeyHash: __apiKeyHash,
    ...safeUser
  } = user;

  res
    .status(200)
    .json({ success: "User authenticated successfully", user: safeUser });
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = DeleteUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    await prisma.user.delete({ where: { uid: parsed.data.uid } });
    res.status(200).send({ success: "Deleted Successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const deleteUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = DeleteUsersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    await prisma.user.deleteMany({ where: { uid: { in: parsed.data.uids } } });
    res.status(200).send({ success: "Deleted Successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete users" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = UserUpdateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = req.auth!;

  try {
    const user = await prisma.user.update({
      where: { uid: uid },
      data: {
        ...parsed.data,
      },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        status: true,
        fullName: true,
        image: true,
        refCode: true,
        spent: true,
        ref: true,
        timestamp: true,
        updatedAt: true,
        currency: true,
        shopScopedId: true,
      },
    });
    res.status(200).json({ success: "Successfully updated user", user });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const updateUserByAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const adminParsed = AdminAuthSchema.safeParse(req.auth);
  if (!adminParsed.success) {
    res.status(400).json({ error: adminParsed.error.flatten() });
    return;
  }

  const parsed = UpdateUserByAdminRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopId } = adminParsed.data;
  const { uid, balanceAction, balanceAdjustment, ...safeUpdate } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { uid, shopId },
        select: {
          uid: true,
          balance: true,
          currency: true,
        },
      });

      if (!existingUser) {
        throw new Error("USER_NOT_FOUND");
      }

      const updateData: any = { ...safeUpdate };

      if (balanceAction && balanceAdjustment) {
        const currentBalance = new Prisma.Decimal(existingUser.balance);
        const adjustment = new Prisma.Decimal(balanceAdjustment);

        const nextBalance =
          balanceAction === "ADD"
            ? currentBalance.plus(adjustment)
            : currentBalance.minus(adjustment);

        if (nextBalance.lt(0)) {
          throw new Error("INSUFFICIENT_WALLET_BALANCE");
        }

        updateData.balance = nextBalance;
      }

      await tx.user.update({
        where: { uid },
        data: updateData,
      });

      if (balanceAction && balanceAdjustment) {
        const counter = await tx.shopCounter.update({
          where: { shopId },
          data: { transactionCounter: { increment: 1 } },
          select: { transactionCounter: true },
        });

        await tx.transaction.create({
          data: {
            amount: new Prisma.Decimal(balanceAdjustment),
            currency: existingUser.currency,
            userUid: uid,
            shopId,
            status: "SUCCESS",
            type: balanceAction === "ADD" ? "WALLET_CREDIT" : "WALLET_DEBIT",
            description:
              balanceAction === "ADD"
                ? "Admin wallet credit adjustment"
                : "Admin wallet debit adjustment",
            shopScopedId: counter.transactionCounter,
          },
        });
      }
    });

    res.status(200).json({ success: "Successfully updated user" });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (error.message === "INSUFFICIENT_WALLET_BALANCE") {
      res.status(400).json({ error: "Insufficient wallet balance" });
      return;
    }
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const regenerateApiKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid, shopId } = authParsed.data;

  try {
    const newApiKey = uuidv4();
    const { encryptedKey, iv } = encryptKey(newApiKey);
    await prisma.user.update({
      where: { uid, shopId },
      data: {
        encryptedApiKey: encryptedKey,
        apiKeyIv: iv,
        apiKeyHash: hashApiKey(newApiKey),
      },
    });

    res.status(200).json({
      success: "API key regenerated successfully",
      apiKey: newApiKey,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to regenerate API key" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: input.error.flatten() });
    return;
  }
  const parsed = ShopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId } = parsed.data;
  const { email } = input.data;
  try {
    // Find user by email
    const user = await prisma.user.findFirst({ where: { email, shopId } });
    if (!user) {
      res.status(404).json({ error: "User with this email not found." });
      return;
    }

    // Generate reset token and expiry
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Save token to user record
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Send password reset email
    await sendUserEmail(shopId, user.email, "FORGOT_PASSWORD", {
      email: user.email,
      token: resetToken,
    });

    res.status(200).json({
      success: "A password reset link has been sent to your email.",
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to process password reset." + err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const input = resetPasswordSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: input.error.flatten() });
    return;
  }

  const { password, token, email } = input.data;

  const parsed = ShopIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId } = parsed.data;
  try {
    const user = await prisma.user.findFirst({
      where: { email, shopId },
    });

    if (!user) {
      res.status(400).json({ error: "User not found." });
      return;
    }

    if (!user.resetToken || user.resetToken !== token) {
      res.status(400).json({ error: "Invalid reset token." });
      return;
    }

    if (
      !user.resetTokenExpiry ||
      new Date(user.resetTokenExpiry) < new Date()
    ) {
      res.status(400).json({ error: "Token expired." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Send password changed email
    await sendUserEmail(shopId, user.email, "PASSWORD_CHANGED");
    res.status(200).json({ success: "Password updated successfully." });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to update password: " + err.message });
  }
};
