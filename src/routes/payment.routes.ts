import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/payment.controllers";
import { paymentRateLimit, paymentProcessRateLimit } from "../middleware/ratelimit";

const router = express.Router();

router.post("/initialize", authenticateUser, paymentProcessRateLimit, payments.initializePayment);
router.get("/", authenticateUser, paymentRateLimit, payments.getPaymentsForUsers);
router.get("/admin", authenticateAdmin, paymentRateLimit, payments.getPaymentsForAdmins);

export default router;
