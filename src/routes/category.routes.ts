import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  categoryRateLimit,
  categoryModifyRateLimit,
} from "../middleware/ratelimit";

// Public routes
router.get("/", categoryRateLimit, categories.getCategories);
router.get("/:uid", categoryRateLimit, categories.getCategoryByUID);

// Admin-only routes
router.post(
  "/",
  authenticateAdmin,
  categoryModifyRateLimit,
  categories.addCategory,
);
router.patch(
  "/",
  authenticateAdmin,
  categoryModifyRateLimit,
  categories.updateCategory,
);
router.delete(
  "/",
  authenticateAdmin,
  categoryModifyRateLimit,
  categories.deleteCategory,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  categoryModifyRateLimit,
  categories.deleteMultipleCategory,
);

export default router;
