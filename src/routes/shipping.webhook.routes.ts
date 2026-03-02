import { Router } from "express";
import {
  handleSendboxWebhook,
  handleShippoWebhook,
} from "../controllers/shipping.webhook.controllers";
import { webhookRateLimit } from "../middleware/ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = Router();

/**
 * Webhook Routes (no authentication required, verified via signature)
 */

// Sendbox webhook
router.post("/sendbox", webhookRateLimit, handleSendboxWebhook);

// Shippo webhook
router.post("/shippo", webhookRateLimit, handleShippoWebhook);

export default router;
