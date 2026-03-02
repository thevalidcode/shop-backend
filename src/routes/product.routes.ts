import express from "express";
const router = express.Router();
import * as products from "../controllers/product.controllers";
import * as productsEnhanced from "../controllers/productEnhanced.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  productRateLimit,
  productModifyRateLimit,
  productBulkRateLimit,
} from "../middleware/ratelimit";
import { checkProductLimit } from "../middleware/features";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

// Public routes - Enhanced
router.get("/search", productRateLimit, productsEnhanced.getProductsPublic);
router.get("/featured", productRateLimit, productsEnhanced.getFeaturedProducts);
router.get(
  "/best-selling",
  productRateLimit,
  productsEnhanced.getBestSellingProducts,
);
router.get("/slug/:slug", productRateLimit, productsEnhanced.getProductBySlug);

// Public routes - Basic
router.get("/", productRateLimit, products.getProducts);
router.get("/:productUid", productRateLimit, products.getProductByUID);

// Product Reviews
router.get(
  "/:productUid/reviews",
  productRateLimit,
  productsEnhanced.getProductReviews,
);
router.post(
  "/:productUid/reviews",
  authenticateUser,
  productModifyRateLimit,
  productsEnhanced.createProductReview,
);

// Product Variants & Related
router.get(
  "/:productUid/variants",
  productRateLimit,
  productsEnhanced.getProductVariants,
);
router.get(
  "/:productUid/related",
  productRateLimit,
  productsEnhanced.getRelatedProducts,
);

// Admin-only routes
router.post(
  "/",
  authenticateAdmin,
  checkProductLimit,
  requireActiveSubscription,
  productModifyRateLimit,
  products.addProduct,
);
router.get(
  "/admin/all",
  authenticateAdmin,
  productRateLimit,
  products.getProductsForAdmins,
);
router.get(
  "/admin/:productUid",
  authenticateAdmin,
  productRateLimit,
  products.getProductByUIDFromAdmin,
);
router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  productModifyRateLimit,
  products.updateProduct,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  productModifyRateLimit,
  products.deleteProduct,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  productBulkRateLimit,
  products.deleteMultipleProduct,
);

export default router;
