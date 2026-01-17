import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for admin operations
 * Allows 150 requests per minute per IP
 */
export const adminRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many admin requests, please try again later." },
  })
);

/**
 * Rate limiter for admin modifications
 * Allows 50 modifications per minute
 */
export const adminModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many admin modifications, please slow down." },
  })
);

/**
 * Rate limiter for admin bulk operations
 * Allows 15 bulk operations per minute
 */
export const adminBulkRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many bulk operations, please wait." },
  })
);
