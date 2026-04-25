import express from "express";
import * as suppliers from "../controllers/supplier.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  supplierImportRateLimit,
  supplierSourceProductsRateLimit,
  supplierSourceStoresRateLimit,
} from "../middleware/ratelimit/supplier.ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = express.Router();

router.get(
  "/stores",
  authenticateAdmin,
  supplierSourceStoresRateLimit,
  suppliers.getSourceSuppliers,
);
router.get(
  "/stores/:sourceStoreUid/products",
  authenticateAdmin,
  supplierSourceProductsRateLimit,
  suppliers.getSourceSupplierProducts,
);
router.get("/suppliers", authenticateAdmin, suppliers.getSuppliers);
router.post(
  "/suppliers",
  authenticateAdmin,
  requireActiveSubscription,
  suppliers.createSupplier,
);
router.patch(
  "/suppliers",
  authenticateAdmin,
  requireActiveSubscription,
  suppliers.updateSupplier,
);
router.delete(
  "/suppliers",
  authenticateAdmin,
  requireActiveSubscription,
  suppliers.removeSupplier,
);
router.delete(
  "/suppliers/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  suppliers.removeMultipleSuppliers,
);

router.get(
  "/suppliers/products",
  authenticateAdmin,
  suppliers.getSupplierProductsAdmin,
);
router.get(
  "/suppliers/source-products",
  authenticateAdmin,
  supplierSourceProductsRateLimit,
  suppliers.getSupplierSourceProductsAdmin,
);
router.post(
  "/suppliers/products/import",
  authenticateAdmin,
  requireActiveSubscription,
  supplierImportRateLimit,
  suppliers.importSupplierProducts,
);
router.post(
  "/suppliers/products/sync",
  authenticateAdmin,
  requireActiveSubscription,
  supplierImportRateLimit,
  suppliers.syncSupplierProducts,
);

export default router;
