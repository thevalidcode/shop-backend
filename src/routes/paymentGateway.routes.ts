import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  paymentGatewayRateLimit,
  paymentGatewayModifyRateLimit,
} from "../middleware/ratelimit";
import { checkPaymentGatewayLimit } from "../middleware/features";

const router = express.Router();

/**
 *
 * ADMIN ROUTES FOR PAYMENT GATEWAYS
 *
 */

router.patch(
  "/",
  authenticateAdmin,
  paymentGatewayModifyRateLimit,
  paymentGateways.updatePaymentGateway,
);

router.delete(
  "/",
  authenticateAdmin,
  paymentGatewayModifyRateLimit,
  paymentGateways.deletePaymentGateway,
);

router.post(
  "/",
  authenticateAdmin,
  checkPaymentGatewayLimit,
  paymentGatewayModifyRateLimit,
  paymentGateways.addPaymentGateway,
);

router.get(
  "/admin",
  authenticateAdmin,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGateways,
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGatewayByUid,
);

/**
 *
 * USER ROUTES FOR PAYMENT GATEWAYS
 *
 */

router.get(
  "/",
  authenticateUser,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGatewaysForUser,
);

router.get(
  "/:uid",
  authenticateUser,
  paymentGatewayRateLimit,
  paymentGateways.getPaymentGatewayByUidForUser,
);

export default router;
