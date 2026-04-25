import type { Request, Response } from "express";
import { UserAuthSchema } from "../schemas/user.schema";
import { WalletTopupSchema } from "../schemas/wallet.schema";
import {
  getUserWalletBalance,
  getWalletTransactions,
} from "../services/wallet.services";

export async function getWalletBalance(
  req: Request,
  res: Response,
): Promise<void> {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid, shopId } = authParsed.data;

  try {
    const data = await getUserWalletBalance(uid, shopId);
    res.status(200).json({ data });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(500).json({ error: error.message || "Failed to get wallet" });
  }
}

export async function topupWallet(
  req: Request,
  res: Response,
): Promise<void> {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const bodyParsed = WalletTopupSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  res.status(400).json({
    error:
      "Direct wallet top-up is disabled. Please use the Add Funds payment flow.",
  });
}

export async function getWalletTransactionHistory(
  req: Request,
  res: Response,
): Promise<void> {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid, shopId } = authParsed.data;

  try {
    const data = await getWalletTransactions(uid, shopId);
    res.status(200).json({ data });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch wallet transactions" });
  }
}
