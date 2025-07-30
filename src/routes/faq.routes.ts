import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/authorize";

const router = express.Router();

// Public routes
router.get("/", faq.getFAQs);
router.get("/:faqId", faq.getFAQByID);

// Admin-only routes
router.post("/", authenticate, isAdmin, faq.addFAQ);
router.patch("/", authenticate, isAdmin, faq.updateFAQ);
router.delete("/", authenticate, isAdmin, faq.deleteFAQ);
router.delete("/multiple", authenticate, isAdmin, faq.deleteMultipleFAQs);

export default router;