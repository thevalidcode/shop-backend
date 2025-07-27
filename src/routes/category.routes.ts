import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers";
import { authenticate } from "../middleware/authenticate";

router.get("/", categories.getCategories);
router.get("/:categoryId", categories.getCategoryByID);
router.post("/", authenticate, categories.addCategory);
router.patch("/", authenticate, categories.updateCategory);
router.delete("/", authenticate, categories.deleteCategory);
router.delete("/multiple", authenticate, categories.deleteMultipleCategory);

export default router;
