import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for review read operations
 * Allows 200 requests per minute per IP
 * Reading reviews is public and should be generous
 */
export const reviewRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200, // limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many review requests, please slow down." },
  })
);

/**
 * Strict rate limiter for creating/deleting reviews
 * Prevents spam and abuse
 * Allows 10 modifications per minute
 */
export const reviewModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many review modifications, please wait." },
  })
);

/**
 * Rate limiter for admin review operations
 * More generous for authenticated admins
 * Allows 100 operations per minute
 */
export const reviewAdminRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many admin review requests, please slow down." },
  })
);
