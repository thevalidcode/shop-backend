import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticateUser } from "../middleware/auth";
import { faqRateLimit, faqModifyRateLimit } from "../middleware/ratelimit";

const router = express.Router();

// Public routes
router.get("/", faqRateLimit, faq.getFAQs);
router.get("/:faqId", faqRateLimit, faq.getFAQByID);

// Admin-only routes
router.post("/", authenticateUser, faqModifyRateLimit, faq.addFAQ);
router.patch("/", authenticateUser, faqModifyRateLimit, faq.updateFAQ);
router.delete("/", authenticateUser, faqModifyRateLimit, faq.deleteFAQ);
router.delete(
  "/",
  authenticateUser,
  faqModifyRateLimit,
  faq.deleteMultipleFAQs
);

export default router;
