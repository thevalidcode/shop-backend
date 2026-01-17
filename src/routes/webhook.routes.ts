import express from "express";
import * as webhooks from "../controllers/webhook.controllers";
import { webhookRateLimit } from "../middleware/ratelimit";

const router = express.Router();

router.post("/flutterwave", webhookRateLimit, webhooks.flutterwaveWebhook);
router.post("/paystack", webhookRateLimit, webhooks.paystackWebhook);

export default router;
