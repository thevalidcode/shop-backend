import express from "express";
import * as checkoutController from "../controllers/checkout.controllers";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

router.post(
  "/initialize",
  authenticateUser,
  checkoutController.initializePayment
);
router.post(
  "/webhook/:shopId",
  express.json(),
  checkoutController.verifyPaymentWebhook
);

export default router;
