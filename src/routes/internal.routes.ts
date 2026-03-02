import express from "express";
const router = express.Router();
import * as internals from "../controllers/internal.controllers";
import {
  authenticateInternalAdmin,
  authenticateInternalAnyone,
} from "../middleware/auth";

router.get(
  "/orders",
  authenticateInternalAdmin,
  internals.getOrdersForInternalAdmins,
);
router.post("/stores", authenticateInternalAdmin, internals.createShop);
router.delete("/stores/:uid", authenticateInternalAnyone, internals.deleteShop);
router.patch("/stores/:uid", authenticateInternalAnyone, internals.updateShop);

export default router;
