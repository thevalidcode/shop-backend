import express from "express";
import * as checkoutController from "../controllers/checkout.controllers";
import { authenticate } from "../middleware/authenticate";
import { isUser } from "../middleware/authorize";

const router = express.Router();

router.post("/initialize", authenticate, isUser, checkoutController.initializePayment);
router.post("/webhook/:shopId", express.json(), checkoutController.verifyPaymentWebhook);

export default router;