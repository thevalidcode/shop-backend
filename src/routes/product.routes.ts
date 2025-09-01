import express from "express";
const router = express.Router();
import * as products from "../controllers/product.controllers";
import { authenticateAdmin } from "../middleware/auth";

// Public routes
router.get("/", products.getProducts);
router.get("/:productId", products.getProductByID);

// Admin-only routes
router.post("/", authenticateAdmin, products.addProduct);
router.get("/admin/all", authenticateAdmin, products.getProductsForAdmins);
router.get(
  "/admin/:productId",
  authenticateAdmin,
  products.getProductByIDFromAdmin
);
router.patch("/", authenticateAdmin, products.updateProduct);
router.delete("/", authenticateAdmin, products.deleteProduct);
router.delete("/multiple", authenticateAdmin, products.deleteMultipleProduct);

export default router;
