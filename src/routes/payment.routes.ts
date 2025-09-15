import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/payment.controllers";

const router = express.Router();

router.post("/initialize", authenticateUser, payments.initializePayment);
router.get("/", authenticateUser, payments.getPaymentsForUsers);
router.get("/admin", authenticateAdmin, payments.getPaymentsForAdmins);

export default router;
