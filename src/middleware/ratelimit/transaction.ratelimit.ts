import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for transaction viewing operations
 * Allows 100 requests per minute per IP
 */
export const transactionRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many transaction requests, please try again later." },
  })
);

/**
 * Rate limiter for transaction modifications (admin)
 * Allows 30 modifications per minute
 */
export const transactionModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many transaction modifications, please slow down." },
  })
);
