import express from "express";
const router = express.Router();
import * as orders from "../controllers/internal.controllers";
import { authenticateInternalAdmin } from "../middleware/auth";
import {
  limittActions,
  limittAdd,
} from "../middleware/ratelimit/common.ratelimit";
import { openCors } from "../config/cors.config";

router.get(
  "/orders",
  openCors,
  authenticateInternalAdmin,
  orders.getOrdersForInternalAdmins
);

export default router;
