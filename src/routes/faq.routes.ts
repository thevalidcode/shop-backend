import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { faqRateLimit, faqModifyRateLimit } from "../middleware/ratelimit";

const router = express.Router();

// Public routes
router.get("/", faqRateLimit, faq.getFAQs);
router.get("/:faqId", faqRateLimit, faq.getFAQByID);

// Admin-only routes
router.post("/", authenticateAdmin, faqModifyRateLimit, faq.addFAQ);
router.patch("/", authenticateAdmin, faqModifyRateLimit, faq.updateFAQ);
router.delete("/", authenticateAdmin, faqModifyRateLimit, faq.deleteFAQ);
router.delete(
  "/multiple",
  authenticateAdmin,
  faqModifyRateLimit,
  faq.deleteMultipleFAQs,
);

export default router;
