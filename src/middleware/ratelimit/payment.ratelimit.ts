import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for payment viewing operations
 * Allows 100 requests per minute per IP
 */
export const paymentRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many payment requests, please try again later." },
  })
);

/**
 * Strict rate limiter for payment processing
 * Allows 20 payment operations per minute to prevent abuse
 */
export const paymentProcessRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many payment operations, please wait." },
  })
);
