import express from "express";
const router = express.Router();
import * as internals from "../controllers/internal.controllers";
import {
  authenticateInternalAdmin,
  authenticateInternalAnyone,
} from "../middleware/auth";
import { requireFeature } from "../middleware/subscription.middleware";
import { supplierImportRateLimit } from "../middleware/ratelimit/supplier.ratelimit";
import * as suppliers from "../controllers/supplier.controllers";

router.get(
  "/orders",
  authenticateInternalAdmin,
  internals.getOrdersForInternalAdmins,
);
router.post("/stores", authenticateInternalAdmin, internals.createShop);
router.delete("/stores/:uid", authenticateInternalAnyone, internals.deleteShop);
router.patch("/stores/:uid", authenticateInternalAnyone, internals.updateShop);
router.post(
  "/suppliers/import-products",
  authenticateInternalAnyone,
  requireFeature("reselling"),
  requireFeature("api_access"),
  supplierImportRateLimit,
  suppliers.importResellerProductsInternal,
);
router.post(
  "/suppliers/sync-products",
  authenticateInternalAnyone,
  requireFeature("reselling"),
  requireFeature("api_access"),
  supplierImportRateLimit,
  suppliers.syncResellerProductsInternal,
);

export default router;
