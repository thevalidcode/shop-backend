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

const createUserSchema = z.object({
  shop_id: z.coerce.number(),
  email: z.string().email(),
  username: z.string(),
  password: z.string().min(6),
  ref: z.union([z.string(), z.number()]).optional(),
});

const meQuerySchema = z.object({
  email: z.string().email(),
  password: z.string(),
  shop_id: z.coerce.number(),
});

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { shop_id, role } = parsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const allUsers = await prisma.user.findMany({
      where: { shopId: shop_id },
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
  const { shop_id, email, username, ref, password } = parsed.data;

  try {
    const existing = await prisma.user.findFirst({
      where: {
        shopId: shop_id,
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
    const newId = await getNextShopModelId("user", shop_id);
    const userData = {
      shopId: shop_id,
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
        shop_id,
        api_key: newUser.apiKey,
        role: "user",
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await sendEmail(undefined, "new_user", userData, shop_id);

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
  const { email, password, shop_id } = parsed.data;

  try {
    const account =
      (await prisma.user.findFirst({
        where: { email, shopId: shop_id },
      })) ||
      (await prisma.admin.findFirst({
        where: { email, shopId: shop_id },
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

    const api_key = account.apiKey || uuidv4();
    const role = account.role;

    const token = jwt.sign({ email, shop_id, api_key, role }, env.JWT_SECRET, {
      expiresIn: "7d",
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
