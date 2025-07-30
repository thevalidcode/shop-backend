import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/authorize";

// Public routes
router.get("/", categories.getCategories);
router.get("/:categoryId", categories.getCategoryByID);

// Admin-only routes
router.post("/", authenticate, isAdmin, categories.addCategory);
router.patch("/", authenticate, isAdmin, categories.updateCategory);
router.delete("/", authenticate, isAdmin, categories.deleteCategory);
router.delete("/multiple", authenticate, isAdmin, categories.deleteMultipleCategory);

export default router;