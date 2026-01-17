import express from "express";
const router = express.Router();
import * as rates from "../controllers/rate.controllers";
import { exchangeRateLimit } from "../middleware/ratelimit";

// Public routes
router.get("/", exchangeRateLimit, rates.getCurrentRates);

export default router;
