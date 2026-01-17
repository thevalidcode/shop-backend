import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for general order viewing operations
 * Allows 200 requests per minute per IP
 */
export const orderRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many order requests, please try again later." },
  })
);

/**
 * Rate limiter for order modifications (admin)
 * Allows 100 modifications per minute
 */
export const orderModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many order modifications, please slow down." },
  })
);

/**
 * Strict rate limiter for bulk operations (admin)
 * Allows 20 bulk operations per minute to prevent abuse
 */
export const orderBulkRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many bulk operations, please wait." },
  })
);
