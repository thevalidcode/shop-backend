import express from "express";
import * as orders from "../controllers/order.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import {
  orderRateLimit,
  orderModifyRateLimit,
  orderBulkRateLimit,
} from "../middleware/ratelimit/order.ratelimit";

const router = express.Router();

/**
 * ADMIN ROUTES
 */

// GET /admin/orders - View all shop orders (view rate limit)
router.get(
  "/admin/all",
  authenticateAdmin,
  orderRateLimit,
  orders.getOrdersForAdmins,
);

// GET /admin/status/:status - View all shop orders (based on status)
router.get(
  "/admin/status/:status",
  authenticateAdmin,
  orderRateLimit,
  orders.getOrdersByStatus,
);

// GET /admin/orders/:orderUid - View single order details (view rate limit)
router.get(
  "/admin/:orderUid",
  authenticateAdmin,
  orderRateLimit,
  orders.getOrderByIDForAdmins,
);

// PATCH /admin/orders/:orderUid - Update order (modify rate limit)
router.patch(
  "/admin/:orderUid",
  authenticateAdmin,
  orderModifyRateLimit,
  orders.updateOrder,
);

// DELETE /admin/orders/:orderUid - Delete order (modify rate limit)
router.delete(
  "/admin/:orderUid",
  authenticateAdmin,
  orderModifyRateLimit,
  orders.deleteOrder,
);

// POST /admin/orders/bulk-update - Bulk update orders (bulk rate limit)
router.post(
  "/admin/bulk-update",
  authenticateAdmin,
  orderBulkRateLimit,
  orders.bulkUpdateOrderStatus,
);

// POST /admin/orders/:orderUid/verify-payment - Verify payment (modify rate limit)
router.post(
  "/admin/:orderUid/verify-payment",
  authenticateAdmin,
  orderModifyRateLimit,
  orders.verifyPayment,
);

/**
 * USER ROUTES
 */

// GET /orders - View all user's orders (view rate limit)
router.get("/", authenticateUser, orderRateLimit, orders.getOrders);

// GET /orders/:orderUid - View single order (view rate limit)
router.get("/:orderUid", authenticateUser, orderRateLimit, orders.getOrderByID);

// GET /orders/status/:status - View orders by status (view rate limit)
router.get(
  "/status/:status",
  authenticateUser,
  orderRateLimit,
  orders.getUserOrdersByStatus,
);

// PATCH /orders/:orderUid - Update order (notes, mark as received) (modify rate limit)
router.patch(
  "/:orderUid",
  authenticateUser,
  orderModifyRateLimit,
  orders.updateOrderByUser,
);

// PATCH /orders/:orderUid/cancel-request - Cancel order (modify rate limit)
router.patch(
  "/:orderUid/cancel-request",
  authenticateUser,
  orderModifyRateLimit,
  orders.cancelOrderByUser,
);

// POST /orders/:orderUid/refund-request - Request refund (modify rate limit)
router.post(
  "/:orderUid/refund-request",
  authenticateUser,
  orderModifyRateLimit,
  orders.requestRefund,
);

// PATCH /orders/:orderUid/billing - Update billing info (modify rate limit)
router.patch(
  "/:orderUid/billing",
  authenticateUser,
  orderModifyRateLimit,
  orders.updateOrderBilling,
);

export default router;
