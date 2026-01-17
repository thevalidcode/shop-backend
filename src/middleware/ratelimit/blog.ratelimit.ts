import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for blog viewing operations
 * Allows 150 requests per minute per IP
 */
export const blogRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many blog requests, please try again later." },
  })
);

/**
 * Rate limiter for blog modifications (admin)
 * Allows 40 modifications per minute
 */
export const blogModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many blog modifications, please slow down." },
  })
);
