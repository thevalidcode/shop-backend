import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for user profile operations
 * Allows 100 requests per minute per IP
 */
export const userRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many user requests, please try again later." },
  })
);

/**
 * Rate limiter for user profile modifications
 * Allows 30 modifications per minute
 */
export const userModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many profile modifications, please slow down." },
  })
);
