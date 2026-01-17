import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import { paymentGatewayRateLimit, paymentGatewayModifyRateLimit } from "../middleware/ratelimit";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGatewaysForUser
);

router.get(
  "/:uid",
  authenticateUser,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGatewayByUidForUser
);

/**
 *
 * ADMIN ROUTES FOR PAYMENT GATEWAYS
 *
 */

router.patch(
  "/",
  authenticateAdmin,
  paymentGatewayModifyRateLimit,
  paymentGateways.updatePaymentGateway
);

router.delete(
  "/",
  authenticateAdmin,
  paymentGatewayModifyRateLimit,
  paymentGateways.deletePaymentGateway
);

router.post(
  "/",
  authenticateAdmin,
  paymentGatewayModifyRateLimit,
  paymentGateways.addPaymentGateway
);

router.get(
  "/admin",
  authenticateAdmin,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGateways
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGatewayByUid
);
export default router;
