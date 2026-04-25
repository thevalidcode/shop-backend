import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/payment.controllers";
import {
  paymentRateLimit,
  paymentProcessRateLimit,
} from "../middleware/ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = express.Router();

router.post(
  "/initialize",
  authenticateUser,
  requireActiveSubscription,
  paymentProcessRateLimit,
  payments.initializePayment,
);
router.post(
  "/create",
  authenticateUser,
  requireActiveSubscription,
  paymentProcessRateLimit,
  payments.createWalletTopupPayment,
);
router.get(
  "/",
  authenticateUser,
  paymentRateLimit,
  payments.getPaymentsForUsers,
);
router.get(
  "/admin",
  authenticateAdmin,
  paymentRateLimit,
  payments.getPaymentsForAdmins,
);
router.patch(
  "/admin/:paymentUid/status",
  authenticateAdmin,
  requireActiveSubscription,
  paymentProcessRateLimit,
  payments.updatePaymentStatusForAdmin,
);

export default router;
