import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { sendEmail } from "../emails";
import { env } from "../config/env.config";
import { prisma } from "../config/db.config";
import { randomBytes } from "crypto";
import { UserUpdateRequestSchema } from "../schemas/user.schema";

const createUserSchema = z.object({
  shopDomain: z.string().min(1), // Shop domain is required (cleaner than shopId)
  email: z.string().email(),
  username: z.string(),
  password: z.string().min(6),
  ref: z.union([z.string(), z.number()]).optional(),
});

const meQuerySchema = z.object({
  email: z.string().email(),
  password: z.string(),
  shopId: z.coerce.number(),
});

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { shopId } = req.auth!;

  try {
    const allUsers = await prisma.user.findMany({
      where: { shopId },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        role: true,
        timestamp: true,
        status: true,
      },
    });
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopDomain, email, username, ref, password } = parsed.data;

  try {
    // Find shop by domain
    const shop = await prisma.shop.findFirst({
      where: { uid: shopDomain },
      select: { shopId: true, status: true, uid: true },
    });

    if (!shop) {
      res
        .status(404)
        .json({ error: "Shop not found. Please check the shop domain." });
      return;
    }

    if (shop.status !== "ACTIVE") {
      res.status(400).json({ error: "This shop is not currently active." });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: {
        shopId: shop.shopId,
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      const error =
        existing.email === email
          ? "Email already exists"
          : "Username already exists";
      res.status(400).send({ error });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId: shop.shopId },
        data: { userCounter: { increment: 1 } },
      });

      return tx.user.create({
        data: {
          shopId: shop.shopId,
          email,
          username,
          password: hashedPassword,
          uid: uuidv4(),
          apiKey: uuidv4(),
          shopScopedId: counter.userCounter,
          ref: ref ? Number(ref) : undefined,
        },
      });
    });

    const token = jwt.sign(
      { email, shopId: shop.shopId, apiKey: newUser.apiKey, role: "user" },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const csrfToken = randomBytes(32).toString("hex");

    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always true for SameSite=None
      sameSite: "none" as const, // Must be 'none' for cross-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("auth_token", token, cookieOptions);
    res.cookie("csrf_token", csrfToken, { ...cookieOptions, httpOnly: false });

    await sendEmail(undefined, "newUser", { ...newUser }, shop.shopId);

    res.status(201).send({
      success: "User account created successfully!",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        shopDomain: shopDomain,
        shopUrl: `https://${shopDomain}.yourplatform.com`,
      },
      message: `Welcome to ${shopDomain}! You can now start shopping.`,
    });
  } catch (error: any) {
    console.error("User creation failed:", error);
    res.status(500).send({ error: "Could not create user." });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const parsed = meQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password, shopId } = parsed.data;

  try {
    const account =
      (await prisma.user.findFirst({
        where: { email, shopId },
      })) ||
      (await prisma.admin.findFirst({
        where: { email, shopId },
      }));

    if (!account) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    if ("status" in account && account.status === "BANNED") {
      res
        .status(403)
        .json({ error: "You’ve been banned from this site. Contact support." });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    const apiKey = account.apiKey || uuidv4();
    const role = account.role;

    const token = jwt.sign({ email, shopId, apiKey, role }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const csrfToken = randomBytes(32).toString("hex");

    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always true for SameSite=None
      sameSite: "none" as const, // Must be 'none' for cross-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("auth_token", token, cookieOptions);
    res.cookie("csrf_token", csrfToken, { ...cookieOptions, httpOnly: false });

    const { password: _, apiKey: __, ...safeAccount } = account;
    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: safeAccount,
    });
  } catch (err: any) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Login failed due to a server error." });
  }
};

export const verifySession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { role } = req.auth?.user!;

  try {
    res.status(200).send({ role });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify user session" });
  }
};

export const updateUserByAdmin = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { shopId } = req.auth!;

  const validation = UserUpdateRequestSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.flatten() });
    return;
  }

  try {
    const updatedUser = await prisma.user.updateMany({
      where: { uid, shopId }, // Ensures admin can only update users in their own shop
      data: validation.data,
    });

    if (updatedUser.count === 0) {
      res.status(404).json({ error: "User not found in this shop." });
      return;
    }

    res.status(200).json({ success: "User updated successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update user." });
  }
};

export const deleteUserByAdmin = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { shopId } = req.auth!;

  try {
    const deletedUser = await prisma.user.deleteMany({
      where: { uid, shopId },
    });

    if (deletedUser.count === 0) {
      res.status(404).json({ error: "User not found in this shop." });
      return;
    }

    res.status(200).json({ success: "User deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete user." });
  }
};
