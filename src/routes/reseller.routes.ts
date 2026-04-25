import express from "express";
import * as suppliers from "../controllers/reseller.controllers";
import {
  supplierSourceProductsRateLimit,
  supplierSourceStoresRateLimit,
} from "../middleware/ratelimit/supplier.ratelimit";

const router = express.Router();

router.get(
  "/suppliers",
  supplierSourceStoresRateLimit,
  suppliers.getSourceSuppliers,
);

router.get(
  "/suppliers/:supplierId/products",
  supplierSourceProductsRateLimit,
  suppliers.getSourceSupplierProducts,
);

export default router;