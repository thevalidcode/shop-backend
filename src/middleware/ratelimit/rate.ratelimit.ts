import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for exchange rate viewing operations
 * Allows 150 requests per minute per IP
 */
export const exchangeRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many rate requests, please try again later." },
  })
);

/**
 * Rate limiter for exchange rate modifications (admin)
 * Allows 30 modifications per minute
 */
export const exchangeRateModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many rate modifications, please slow down." },
  })
);
