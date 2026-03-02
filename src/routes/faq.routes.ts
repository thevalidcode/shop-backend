import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { faqRateLimit, faqModifyRateLimit } from "../middleware/ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = express.Router();

// Public routes
router.get("/", faqRateLimit, faq.getFAQs);
router.get("/:faqId", faqRateLimit, faq.getFAQByID);

// Admin-only routes
router.post(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  faqModifyRateLimit,
  faq.addFAQ,
);
router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  faqModifyRateLimit,
  faq.updateFAQ,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  faqModifyRateLimit,
  faq.deleteFAQ,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  faqModifyRateLimit,
  faq.deleteMultipleFAQs,
);

export default router;
