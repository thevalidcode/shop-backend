import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers";
import { authenticateUser } from "../middleware/auth";

// Public routes
router.get("/", categories.getCategories);
router.get("/:categoryId", categories.getCategoryByID);

// Admin-only routes
router.post("/", authenticateUser, categories.addCategory);
router.patch("/", authenticateUser, categories.updateCategory);
router.delete("/", authenticateUser, categories.deleteCategory);
router.delete("/multiple", authenticateUser, categories.deleteMultipleCategory);

export default router;
