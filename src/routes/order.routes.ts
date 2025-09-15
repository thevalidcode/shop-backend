import express from "express";
const router = express.Router();
import * as orders from "../controllers/order.controllers";
import {
  authenticateUser,
  authenticateAdmin,
  authenticateAnyone,
} from "../middleware/auth";

// User-only routes
router.get("/", authenticateUser, orders.getOrders);
router.get("/:orderUid", authenticateUser, orders.getOrderByID);

// Admin-only routes
router.get("/admin/all", authenticateAdmin, orders.getOrdersForAdmins);
router.get("/admin/:orderUid", authenticateAdmin, orders.getOrderByIDForAdmins);
router.patch("/admin/:orderUid", authenticateAdmin, orders.updateOrder);
router.delete("/admin/:orderUid", authenticateAdmin, orders.deleteOrder);
router.patch(
  "/admin/bulk/status",
  authenticateAdmin,
  orders.bulkUpdateOrderStatus
);

// Shared route (logic inside controller handles role)
router.get("/status/:status", authenticateAnyone, orders.getOrdersByStatus);

export default router;
