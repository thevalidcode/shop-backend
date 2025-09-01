import { Request, Response, NextFunction } from "express";
import { verifyBrowserAuth, verifyInternalAuth } from "./auth.shared";
import { prisma } from "../../config/db.config";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = verifyBrowserAuth(req, res);
    if (!payload) return;

    const { email, shopId, apiKey, uid } = payload;

    const user = await prisma.user.findFirst({ where: { shopId, email } });
    if (!user || user.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid user API key or not found" });
      return;
    }

    const { password, ...safeUser } = user;

    req.auth = {
      shopId,
      uid,
      type: "user",
      user: safeUser,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = verifyBrowserAuth(req, res) || verifyInternalAuth(req, res);
    if (!payload) return;

    const { email, shopId, apiKey, uid } = payload;

    const admin = await prisma.admin.findFirst({ where: { shopId, email } });
    if (!admin || admin.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid admin API key or not found" });
      return;
    }

    const { password, ...safeAdmin } = admin;

    req.auth = {
      shopId,
      uid,
      type: "admin",
      user: safeAdmin,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAnyone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const payload = verifyBrowserAuth(req, res) || verifyInternalAuth(req, res);
  if (!payload) return;

  const { email, shopId, apiKey, uid } = payload;

  try {
    const [user, admin] = await Promise.all([
      prisma.user.findFirst({ where: { shopId, email } }),
      prisma.admin.findFirst({ where: { shopId, email } }),
    ]);

    const account = admin || user;

    if (!account || account.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid API key or user not found" });
      return;
    }

    if (admin) {
      req.auth = {
        type: "admin",
        shopId,
        uid,
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          uid: admin.uid,
          apiKey: admin.apiKey,
          status: admin.status,
        },
      };
    } else if (user) {
      req.auth = {
        type: "user",
        shopId,
        uid,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          apiKey: user.apiKey,
          balance: user.balance,
        },
      };
    }

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
