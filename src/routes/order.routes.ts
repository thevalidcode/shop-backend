import express from "express";
import * as orders from "../controllers/order.controllers";
import {
  authenticateUser,
  authenticateAdmin,
} from "../middleware/auth";
import {
  orderRateLimit,
  orderModifyRateLimit,
  orderBulkRateLimit,
} from "../middleware/ratelimit/order.ratelimit";

const router = express.Router();

/**
 * USER ROUTES
 */

// GET /orders - View all user's orders (view rate limit)
router.get("/", authenticateUser, orderRateLimit, orders.getOrders);

// GET /orders/:orderUid - View single order (view rate limit)
router.get("/:orderUid", authenticateUser, orderRateLimit, orders.getOrderByID);

// GET /orders/status/:status - View orders by status (view rate limit)
router.get("/status/:status", authenticateUser, orderRateLimit, orders.getOrdersByStatus);

/**
 * ADMIN ROUTES
 */

// GET /admin/orders - View all shop orders (view rate limit)
router.get("/admin/all", authenticateAdmin, orderRateLimit, orders.getOrdersForAdmins);

// GET /admin/orders/:orderUid - View single order details (view rate limit)
router.get("/admin/:orderUid", authenticateAdmin, orderRateLimit, orders.getOrderByIDForAdmins);

// PATCH /admin/orders/:orderUid - Update order (modify rate limit)
router.patch("/admin/:orderUid", authenticateAdmin, orderModifyRateLimit, orders.updateOrder);

// DELETE /admin/orders/:orderUid - Delete order (modify rate limit)
router.delete("/admin/:orderUid", authenticateAdmin, orderModifyRateLimit, orders.deleteOrder);

// POST /admin/orders/bulk-update - Bulk update orders (bulk rate limit)
router.post("/admin/bulk-update", authenticateAdmin, orderBulkRateLimit, orders.bulkUpdateOrderStatus);

export default router;
