import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { z } from "zod";
import { prisma } from "../config/db";

// Zod schema for verifying JWT payload
const tokenPayloadSchema = z.object({
  email: z.string().email(),
  shop_id: z.number(),
  api_key: z.string(),
  role: z.enum(["admin", "user"]),
});

// Extend Express Request to include `auth`
declare module "express" {
  interface Request {
    auth?: {
      email: string;
      shop_id: number;
      api_key: string;
      role: string;
      uid: string;
      user: any;
    };
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = tokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, shop_id, api_key, role } = parsed.data;

    const [user, admin] = await Promise.all([
      prisma.user.findFirst({
        where: {
          shopId: shop_id,
          email,
        },
      }),
      prisma.admin.findFirst({
        where: {
          shopId: shop_id,
          email,
        },
      }),
    ]);

    const account = admin || user;

    if (!account || account.apiKey !== api_key) {
      res.status(401).json({ error: "Key mismatch or user not found" });
      return;
    }

    req.auth = {
      email,
      shop_id,
      api_key,
      role,
      uid: account.uid?.toString() || "",
      user: account,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
