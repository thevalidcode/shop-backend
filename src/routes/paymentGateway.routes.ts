import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limittAdd,
  limittActions,
} from "../middleware/ratelimit/common.ratelimit";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  limittActions,
  paymentGateways.getPaymentGatewaysForUser
);

router.get(
  "/:uid",
  authenticateUser,
  limittActions,
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
  limittActions,
  paymentGateways.updatePaymentGateway
);

router.delete(
  "/",
  authenticateAdmin,
  limittActions,
  paymentGateways.deletePaymentGateway
);

router.post(
  "/",
  authenticateAdmin,
  limittAdd,
  paymentGateways.addPaymentGateway
);

router.get(
  "/admin",
  authenticateAdmin,
  limittActions,
  paymentGateways.getPaymentGateways
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  limittActions,
  paymentGateways.getPaymentGatewayByUid
);
export default router;
