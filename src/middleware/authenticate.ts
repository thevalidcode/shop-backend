import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { tokenPayloadSchema } from "../schemas/user.schema";
import { prisma } from "../config/db";

// Extend Express Request to include `auth`
declare module "express" {
  interface Request {
    auth?: {
      email: string;
      shopId: number;
      apiKey: string;
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
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers["x-csrf-token"];

  // Step 1: Ensure cookies exist
  if (!token || !csrfCookie) {
    res.status(401).json({ error: "Missing auth or CSRF token" });
    return;
  }

  // Step 2: Compare CSRF cookie with CSRF header
  if (!csrfHeader || csrfHeader !== csrfCookie) {
    res.status(403).json({ error: "CSRF token mismatch" });
    return;
  }

  try {
    // Step 3: Decode and validate JWT
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = tokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, shopId, apiKey, role } = parsed.data;

    // Step 4: Find user or admin from DB
    const [user, admin] = await Promise.all([
      prisma.user.findFirst({ where: { shopId, email } }),
      prisma.admin.findFirst({ where: { shopId, email } }),
    ]);

    const account = admin || user;

    if (!account || account.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid API key or user not found" });
      return;
    }

    // FIX: Omit password before attaching to request
    const { password, ...safeAccount } = account;

    // Step 5: Attach user info to request
    req.auth = {
      email,
      shopId,
      apiKey,
      role,
      uid: safeAccount.uid,
      user: safeAccount,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};