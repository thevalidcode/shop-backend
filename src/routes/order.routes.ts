import express from "express";
const router = express.Router();
import * as orders from "../controllers/order.controllers";
import { authenticate } from "../middleware/authenticate";

router.get("/", authenticate, orders.getOrders);
router.get("/admin", authenticate, orders.getOrdersForAdmins);
router.get("/:orderUid", authenticate, orders.getOrderByID);
router.get("admin/:orderUid", authenticate, orders.getOrderByIDForAdmins);
router.post("/", authenticate, orders.placeOrder);
router.patch("/:orderUid", authenticate, orders.updateOrder);
router.delete("/:orderUid", authenticate, orders.deleteOrder);
router.get("/status/:status", authenticate, orders.getOrdersByStatus);
router.post("/bulk", authenticate, orders.bulkCreateOrders);
router.patch("/bulk/status", authenticate, orders.bulkUpdateOrderStatus);

export default router;
