import express from "express";
const router = express.Router();
import * as products from "../controllers/product.controllers";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/authorize";

// Public routes
router.get("/", products.getProducts);
router.get("/:productId", products.getProductByID);

// Admin-only routes
router.post("/", authenticate, isAdmin, products.addProduct);
router.get("/admin/all", authenticate, isAdmin, products.getProductsForAdmins);
router.get("/admin/:productId", authenticate, isAdmin, products.getProductByIDFromAdmin);
router.patch("/", authenticate, products.updateProduct);
router.delete("/", authenticate, isAdmin, products.deleteProduct);
router.delete("/multiple", authenticate, isAdmin, products.deleteMultipleProduct);

export default router;