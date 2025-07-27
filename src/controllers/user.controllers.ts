import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { sendEmail } from "../emails";
import { env } from "../config/env";
import { AuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db";
import { getNextShopModelId } from "../utils/nextId";
import { randomBytes } from "crypto";

const createUserSchema = z.object({
  shopId: z.coerce.number(),
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
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shopId, role } = parsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

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
  const { shopId, email, username, ref, password } = parsed.data;

  try {
    const existing = await prisma.user.findFirst({
      where: {
        shopId,
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
    const newId = await getNextShopModelId("user", shopId);
    const userData = {
      shopId,
      id: newId,
      email,
      username,
      password: hashedPassword,
      uid: uuidv4(),
      apiKey: uuidv4(),
      ref: ref ? Number(ref) : undefined,
    };
    const newUser = await prisma.user.create({ data: userData });

    const token = jwt.sign(
      {
        email,
        shopId,
        apiKey: newUser.apiKey,
        role: "user",
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const csrfToken = randomBytes(32).toString("hex");

    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await sendEmail(undefined, "newUser", userData, shopId);

    res.status(200).send({
      success: "Created Successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
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

    if ("status" in account && account.status === "banned") {
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

    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, apiKey: __, ...safeAccount } = account;
    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: safeAccount,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
};

export const verifySession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { role } = authParsed.data;

  try {
    res.status(200).send({ role });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify user session" });
  }
};
