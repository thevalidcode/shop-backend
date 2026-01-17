import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for product viewing operations
 * Allows 200 requests per minute per IP
 * Products are frequently viewed
 */
export const productRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many product requests, please try again later." },
  })
);

/**
 * Rate limiter for product modifications (admin)
 * Allows 50 modifications per minute
 */
export const productModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many product modifications, please slow down." },
  })
);

/**
 * Rate limiter for product bulk operations (admin)
 * Allows 10 bulk operations per minute
 */
export const productBulkRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many bulk operations, please wait." },
  })
);
