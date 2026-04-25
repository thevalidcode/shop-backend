import express from "express";
import { authenticateUser } from "../middleware/auth";
import { requireActiveSubscription } from "../middleware/subscription.middleware";
import { paymentProcessRateLimit, paymentRateLimit } from "../middleware/ratelimit";
import {
  getWalletBalance,
  getWalletTransactionHistory,
  topupWallet,
} from "../controllers/wallet.controllers";

const router = express.Router();

router.get(
  "/balance",
  authenticateUser,
  requireActiveSubscription,
  paymentRateLimit,
  getWalletBalance,
);

router.post(
  "/topup",
  authenticateUser,
  requireActiveSubscription,
  paymentProcessRateLimit,
  topupWallet,
);

router.get(
  "/transactions",
  authenticateUser,
  requireActiveSubscription,
  paymentRateLimit,
  getWalletTransactionHistory,
);

export default router;
