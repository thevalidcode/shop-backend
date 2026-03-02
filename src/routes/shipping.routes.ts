import { Router } from "express";
import {
  connectShippingAccount,
  getShippingAccounts,
  updateShippingAccount,
  disconnectShippingAccount,
  createShipment,
  bulkCreateShipments,
  getShipments,
  getShipmentByOrder,
  getTrackingEvents,
  getShippingRates,
  getShippingMethods,
} from "../controllers/shipping.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import { orderModifyRateLimit, apiLimiter } from "../middleware/ratelimit";
import {
  checkAutomatedShippingAllowed,
  checkShippingAccountLimit,
} from "../middleware/features";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = Router();

/**
 * Admin Routes
 */

// Connect shipping account
router.post(
  "/admin/accounts",
  authenticateAdmin,
  requireActiveSubscription,
  checkAutomatedShippingAllowed,
  checkShippingAccountLimit,
  orderModifyRateLimit,
  connectShippingAccount,
);

// Get all shipping accounts
router.get(
  "/admin/accounts",
  authenticateAdmin,
  apiLimiter,
  getShippingAccounts,
);

// Update shipping account
router.patch(
  "/admin/accounts/:accountUid",
  authenticateAdmin,
  requireActiveSubscription,
  orderModifyRateLimit,
  updateShippingAccount,
);

// Disconnect shipping account
router.delete(
  "/admin/accounts/:accountUid",
  authenticateAdmin,
  requireActiveSubscription,
  orderModifyRateLimit,
  disconnectShippingAccount,
);

// Create shipment for order
router.post(
  "/admin/shipments",
  authenticateAdmin,
  requireActiveSubscription,
  checkAutomatedShippingAllowed,
  orderModifyRateLimit,
  createShipment,
);

// Bulk create shipments
router.post(
  "/admin/shipments/bulk",
  authenticateAdmin,
  requireActiveSubscription,
  checkAutomatedShippingAllowed,
  orderModifyRateLimit,
  bulkCreateShipments,
);

// Get all shipments with filters
router.get("/admin/shipments", authenticateAdmin, apiLimiter, getShipments);

/**
 * User Routes
 */

// Get shipping rates for a cart
router.get("/rates", authenticateUser, apiLimiter, getShippingRates);

// Get available shipping methods for the shop
router.get("/methods", authenticateUser, apiLimiter, getShippingMethods);

// Get shipment by order
router.get(
  "/orders/:orderUid/shipment",
  authenticateUser,
  apiLimiter,
  getShipmentByOrder,
);

// Get tracking events for shipment
router.get(
  "/shipments/:shipmentUid/tracking",
  authenticateUser,
  apiLimiter,
  getTrackingEvents,
);

export default router;
