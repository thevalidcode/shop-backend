// --- START OF FILE src/routes/order.routes.ts ---

import express from "express";
const router = express.Router();
import * as orders from "../controllers/order.controllers";
import { authenticate } from "../middleware/authenticate";
import { isAdmin, isUser } from "../middleware/authorize";

// User-only routes
router.get("/", authenticate, isUser, orders.getOrders);
router.get("/:orderUid", authenticate, isUser, orders.getOrderByID);
// router.post("/", authenticate, isUser, orders.placeOrder);
// router.post("/bulk", authenticate, isUser, orders.bulkCreateOrders);

// Admin-only routes
router.get("/admin/all", authenticate, isAdmin, orders.getOrdersForAdmins);
router.get("/admin/:orderUid", authenticate, isAdmin, orders.getOrderByIDForAdmins);
router.patch("/:orderUid", authenticate, isAdmin, orders.updateOrder);
router.delete("/:orderUid", authenticate, isAdmin, orders.deleteOrder);
router.patch("/bulk/status", authenticate, isAdmin, orders.bulkUpdateOrderStatus);

// Shared route (logic inside controller handles role)
router.get("/status/:status", authenticate, orders.getOrdersByStatus);

export default router;