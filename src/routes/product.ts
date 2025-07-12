import express from "express";
const router = express.Router();
import * as products from "../controllers/product";
import { authenticate } from "../middleware/authenticate";

router.get("/", products.getProducts);
router.get("/admin", authenticate, products.getProductsForAdmins);
router.get("/:product_id", products.getProductByID);
router.get(
  "/admin/:product_id",
  authenticate,
  products.getProductByIDFromAdmin
);
router.patch("/", authenticate, products.updateProduct);
router.delete("/", authenticate, products.deleteProduct);
router.delete("/multiple", authenticate, products.deleteMultipleProduct);

export default router;
