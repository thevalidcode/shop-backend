import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", faq.getFAQs);
router.get("/:faqId", faq.getFAQByID);

// Admin-only routes
router.post("/", authenticateUser, faq.addFAQ);
router.patch("/", authenticateUser, faq.updateFAQ);
router.delete("/", authenticateUser, faq.deleteFAQ);
router.delete("/multiple", authenticateUser, faq.deleteMultipleFAQs);

export default router;
