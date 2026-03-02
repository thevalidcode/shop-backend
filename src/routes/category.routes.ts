import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  categoryRateLimit,
  categoryModifyRateLimit,
} from "../middleware/ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

// Public routes
router.get("/", categoryRateLimit, categories.getCategories);
router.get("/:uid", categoryRateLimit, categories.getCategoryByUID);

// Admin-only routes
router.post(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  categoryModifyRateLimit,
  categories.addCategory,
);
router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  categoryModifyRateLimit,
  categories.updateCategory,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  categoryModifyRateLimit,
  categories.deleteCategory,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  categoryModifyRateLimit,
  categories.deleteMultipleCategory,
);

export default router;
