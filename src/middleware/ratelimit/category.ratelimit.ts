import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for category viewing operations
 * Allows 150 requests per minute per IP
 */
export const categoryRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many category requests, please try again later." },
  })
);

/**
 * Rate limiter for category modifications (admin)
 * Allows 40 modifications per minute
 */
export const categoryModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many category modifications, please slow down." },
  })
);
