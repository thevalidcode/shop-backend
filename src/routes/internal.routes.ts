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
  internals.getOrdersForInternalAdmins
);
router.post(
  "/shops",
  openCors,
  authenticateInternalAdmin,
  internals.createShop
);
router.delete(
  "/shops/:uid",
  openCors,
  authenticateInternalAnyone,
  internals.deleteShop
);
router.patch(
  "/shops/:uid",
  openCors,
  authenticateInternalAnyone,
  internals.updateShop
);

export default router;
