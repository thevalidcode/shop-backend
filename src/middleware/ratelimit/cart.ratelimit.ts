import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for cart operations
 * Allows 100 requests per minute per IP
 * Cart operations are frequent but should be reasonable
 */
export const cartRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many cart requests, please slow down." },
  })
);

/**
 * Strict rate limiter for cart item modifications
 * Prevents spam adding/removing items
 * Allows 50 modifications per minute
 */
export const cartModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many cart modifications, please wait." },
  })
);
