import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/transaction.controllers";
import { transactionRateLimit } from "../middleware/ratelimit";

const router = express.Router();

router.get("", authenticateUser, transactionRateLimit, payments.getTransactionsForUser);
router.get("/admin", authenticateAdmin, transactionRateLimit, payments.getTransactionsForAdmin);

export default router;
