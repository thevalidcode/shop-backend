import express from "express";
const router = express.Router();
import * as internals from "../controllers/internal.controllers";
import {
  authenticateInternalAdmin,
  authenticateInternalAnyone,
} from "../middleware/auth";
import { openCors } from "../config/cors.config";

router.get(
  "/orders",
  openCors,
  authenticateInternalAdmin,
  internals.getOrdersForInternalAdmins,
);
router.post(
  "/stores",
  openCors,
  authenticateInternalAdmin,
  internals.createShop,
);
router.delete(
  "/stores/:uid",
  openCors,
  authenticateInternalAnyone,
  internals.deleteShop,
);
router.patch(
  "/stores/:uid",
  openCors,
  authenticateInternalAnyone,
  internals.updateShop,
);

export default router;
